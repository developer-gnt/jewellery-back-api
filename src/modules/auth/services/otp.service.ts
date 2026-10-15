import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service.js';
import { Redis } from 'ioredis';

interface MemoryOtpRecord {
  otp: string;
  expiresAt: number;
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
  private readonly OTP_TTL_SECONDS = 120; // 2 minutes
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
        retryStrategy: () => null, // don't spam retries if redis is not running
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

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:${mobile}`;

    if (this.redisClient) {
      try {
        await this.redisClient.set(key, otp, 'EX', this.OTP_TTL_SECONDS);
      } catch {
        this.storeInMemory(key, otp);
      }
    } else {
      this.storeInMemory(key, otp);
    }

    await this.smsService.sendOtpSms(mobile, otp);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      expiresIn: this.OTP_TTL_SECONDS,
      ...(isDev ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(mobile: string, inputOtp: string): Promise<boolean> {
    const isDev = process.env.NODE_ENV !== 'production';

    // Test bypass for automated QA or local dev
    if (isDev && inputOtp === '123456') {
      return true;
    }

    const key = `otp:${mobile}`;
    let storedOtp: string | null = null;

    if (this.redisClient) {
      try {
        storedOtp = await this.redisClient.get(key);
      } catch {
        storedOtp = this.getFromMemory(key);
      }
    } else {
      storedOtp = this.getFromMemory(key);
    }

    if (!storedOtp) {
      return false;
    }

    if (storedOtp !== inputOtp) {
      return false;
    }

    // Delete once verified
    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {
        this.memoryStore.delete(key);
      }
    } else {
      this.memoryStore.delete(key);
    }

    return true;
  }

  private storeInMemory(key: string, otp: string) {
    this.memoryStore.set(key, {
      otp,
      expiresAt: Date.now() + this.OTP_TTL_SECONDS * 1000,
    });
  }

  private getFromMemory(key: string): string | null {
    const record = this.memoryStore.get(key);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return record.otp;
  }
}
