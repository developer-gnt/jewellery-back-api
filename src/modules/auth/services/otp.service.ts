import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service.js';
import { Redis } from 'ioredis';

interface MemoryOtpRecord {
  otp: string;
  expiresAt: number;
  used: boolean;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private redisClient: Redis | null = null;
  private readonly memoryStore = new Map<string, MemoryOtpRecord>();
  private readonly rateLimitStore = new Map<string, RateLimitRecord>();
  private readonly OTP_TTL_SECONDS = 120; // 2 minutes validity
  private readonly RECORD_RETENTION_MS = 15 * 60 * 1000; // 15 mins history for accurate status
  private readonly MAX_REQUESTS = 5;
  private readonly RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {
    this.initRedis();
  }

  private initRedis() {
    try {
      const host = this.configService.get<string>('redis.host', 'localhost');
      const port = this.configService.get<number>('redis.port', 6379);

      this.redisClient = new Redis({
        host,
        port,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });

      this.redisClient.connect().catch(() => {
        this.logger.warn('Redis not reachable. Falling back to in-memory store for OTPs.');
        this.redisClient = null;
      });

      this.redisClient.on('error', () => {
        this.redisClient = null;
      });
    } catch {
      this.logger.warn('Redis client initialization failed; using in-memory store.');
      this.redisClient = null;
    }
  }

  private checkRateLimit(mobile: string) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      // Do not block developers with rate limit lockout during local testing
      return;
    }

    const now = Date.now();
    const record = this.rateLimitStore.get(mobile);

    if (record) {
      if (now < record.resetAt) {
        if (record.count >= this.MAX_REQUESTS) {
          const waitMinutes = Math.ceil((record.resetAt - now) / 60000);
          throw new HttpException(
            `Too many OTP requests. Please try again in ${waitMinutes} minutes.`,
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        record.count++;
      } else {
        this.rateLimitStore.set(mobile, {
          count: 1,
          resetAt: now + this.RATE_LIMIT_WINDOW_MS,
        });
      }
    } else {
      this.rateLimitStore.set(mobile, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW_MS,
      });
    }
  }

  async sendOtp(mobile: string): Promise<{ expiresIn: number; devOtp?: string }> {
    this.checkRateLimit(mobile);

    // Generate fresh 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:${mobile}`;
    const expiresAt = Date.now() + this.OTP_TTL_SECONDS * 1000;

    const record: MemoryOtpRecord = {
      otp,
      expiresAt,
      used: false,
    };

    this.storeInMemory(key, record);

    if (this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(record), 'EX', 900);
      } catch {
        // Fallback already in memory
      }
    }

    await this.smsService.sendOtpSms(mobile, otp);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      expiresIn: this.OTP_TTL_SECONDS,
      ...(isDev ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(mobile: string, inputOtp: string): Promise<boolean> {
    const key = `otp:${mobile}`;
    let record = await this.getRecord(key);

    // 1. Verify existence of OTP request
    if (!record) {
      throw new BadRequestException('No active OTP found for this mobile number. Please request a new OTP.');
    }

    // 2. Verify one-time use (Revoke after enter)
    if (record.used) {
      throw new BadRequestException('This OTP has already been used and revoked. Please request a new OTP.');
    }

    // 3. Verify expiration
    if (Date.now() > record.expiresAt) {
      this.memoryStore.delete(key);
      if (this.redisClient) {
        try {
          await this.redisClient.del(key);
        } catch {
          // ignore
        }
      }
      throw new BadRequestException('This OTP has expired. Please request a new OTP.');
    }

    // 4. Verify code accuracy
    if (record.otp !== inputOtp) {
      throw new BadRequestException('Invalid OTP code. Please check and try again.');
    }

    // 5. Instantly REVOKE the OTP so it cannot be used a second time
    record.used = true;
    this.memoryStore.set(key, record);

    if (this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(record), 'EX', 300);
      } catch {
        // memory already updated
      }
    }

    this.logger.log(`OTP successfully verified and revoked for mobile: ${mobile}`);
    return true;
  }

  private storeInMemory(key: string, record: MemoryOtpRecord) {
    this.memoryStore.set(key, record);
    // Cleanup old records after retention window
    setTimeout(() => {
      const cur = this.memoryStore.get(key);
      if (cur && cur.expiresAt < Date.now()) {
        this.memoryStore.delete(key);
      }
    }, this.RECORD_RETENTION_MS);
  }

  private async getRecord(key: string): Promise<MemoryOtpRecord | null> {
    if (this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) {
          return JSON.parse(raw) as MemoryOtpRecord;
        }
      } catch {
        // fallback to memory
      }
    }

    const memoryRecord = this.memoryStore.get(key);
    if (!memoryRecord) return null;
    return memoryRecord;
  }
}
