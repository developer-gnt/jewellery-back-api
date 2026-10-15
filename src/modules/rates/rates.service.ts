import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MetalRate } from './entities/metal-rate.entity.js';
import { UpdateRatesDto } from './dto/update-rates.dto.js';

interface CachedRate {
  data: any;
  expiresAt: number;
}

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);
  private cache: CachedRate | null = null;
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    @InjectRepository(MetalRate)
    private readonly metalRateRepository: Repository<MetalRate>,
    private readonly configService: ConfigService,
  ) {}

  async getCurrentRates() {
    const now = Date.now();
    if (this.cache && now < this.cache.expiresAt) {
      return this.cache.data;
    }

    // Check if latest entry in DB is an active manual override
    const latestRate = await this.metalRateRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    if (latestRate && latestRate.isManualOverride) {
      const result = {
        gold24K: Number(latestRate.gold24K),
        gold22K: Number(latestRate.gold22K),
        silver: Number(latestRate.silver),
        unit: latestRate.unit,
        isManualOverride: true,
        source: 'admin-override',
        updatedAt: latestRate.createdAt,
      };

      this.cache = { data: result, expiresAt: now + this.CACHE_TTL_MS };
      return result;
    }

    // Try fetching from external rate provider if URL configured
    let fetchedRate: any = null;
    const providerUrl = this.configService.get<string>('RATE_PROVIDER_URL');
    const providerKey = this.configService.get<string>('RATE_PROVIDER_KEY');

    if (
      providerUrl &&
      providerUrl !== 'https://your-rate-provider.com/api' &&
      providerKey &&
      providerKey !== 'your_rate_provider_key'
    ) {
      try {
        const res = await fetch(`${providerUrl}/rates`, {
          headers: { Authorization: `Bearer ${providerKey}` },
        });
        if (res.ok) {
          const json = await res.json();
          fetchedRate = json;
        }
      } catch (err) {
        this.logger.warn('Failed to fetch from live rate provider, using fallback baseline', err);
      }
    }

    const gold24K = fetchedRate?.gold24K ?? (latestRate ? Number(latestRate.gold24K) : 7450.0);
    const gold22K = fetchedRate?.gold22K ?? (latestRate ? Number(latestRate.gold22K) : 6850.0);
    const silver = fetchedRate?.silver ?? (latestRate ? Number(latestRate.silver) : 92.5);

    // Save baseline snapshot if no rate exists
    if (!latestRate) {
      const newRate = this.metalRateRepository.create({
        gold24K,
        gold22K,
        silver,
        unit: 'gram',
        isManualOverride: false,
        source: 'provider',
      });
      await this.metalRateRepository.save(newRate);
    }

    const result = {
      gold24K,
      gold22K,
      silver,
      unit: 'gram',
      isManualOverride: false,
      source: 'provider',
      updatedAt: latestRate?.createdAt ?? new Date(),
    };

    this.cache = { data: result, expiresAt: now + this.CACHE_TTL_MS };
    return result;
  }

  async getRateHistory(limit = 30) {
    const history = await this.metalRateRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return history.map((h) => ({
      id: h.id,
      gold24K: Number(h.gold24K),
      gold22K: Number(h.gold22K),
      silver: Number(h.silver),
      unit: h.unit,
      isManualOverride: h.isManualOverride,
      source: h.source,
      createdAt: h.createdAt,
    }));
  }

  async getAdminRates() {
    return this.getCurrentRates();
  }

  async updateAdminRates(dto: UpdateRatesDto) {
    const rate = this.metalRateRepository.create({
      gold24K: dto.gold24K,
      gold22K: dto.gold22K,
      silver: dto.silver,
      unit: dto.unit ?? 'gram',
      isManualOverride: dto.isManualOverride ?? true,
      source: 'admin',
    });

    const saved = await this.metalRateRepository.save(rate);
    this.cache = null; // Invalidate cache immediately

    return {
      message: 'Metal rates updated successfully',
      data: {
        id: saved.id,
        gold24K: Number(saved.gold24K),
        gold22K: Number(saved.gold22K),
        silver: Number(saved.silver),
        unit: saved.unit,
        isManualOverride: saved.isManualOverride,
        updatedAt: saved.createdAt,
      },
    };
  }
}
