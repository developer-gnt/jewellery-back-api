import {
  Injectable,
  ConflictException,
  NotFoundException,
  Optional,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopRate } from './entities/shop-rate.entity.js';
import { UpdateShopRateDto } from './dto/update-shop-rate.dto.js';
import { CreateShopRateDto } from './dto/create-shop-rate.dto.js';
import { RatesService } from '../rates/rates.service.js';

export interface ShopRateSyncStatus {
  status: 'synced' | 'syncing' | 'failed' | 'never_synced';
  lastUpdated: string;
  source: string;
  count: number;
  error: string | null;
}

@Injectable()
export class ShopRatesService {
  private readonly logger = new Logger(ShopRatesService.name);
  private lastSyncTime: Date = new Date();
  private syncStatus: 'synced' | 'syncing' | 'failed' | 'never_synced' = 'synced';
  private syncSource = 'google-market-feed';
  private syncError: string | null = null;
  private isSyncing = false;

  constructor(
    @InjectRepository(ShopRate)
    private readonly shopRateRepository: Repository<ShopRate>,
    @Optional()
    private readonly ratesService?: RatesService,
  ) {}

  /**
   * Retrieve all active shop rates (ordered by metal ASC, purity DESC)
   */
  async getShopRates() {
    let rates = await this.shopRateRepository.find({
      where: { isActive: true },
      order: { metal: 'ASC', purity: 'DESC' },
    });

    // Seed defaults if empty
    if (rates.length === 0) {
      const defaults = [
        {
          metal: 'gold',
          purity: '24K',
          ratePerGram: 7520.0,
          makingChargePerGram: 500.0,
          notes: '999 Pure Investment Gold',
        },
        {
          metal: 'gold',
          purity: '22K',
          ratePerGram: 6920.0,
          makingChargePerGram: 450.0,
          notes: '916 BIS Hallmarked Jewellery Gold',
        },
        {
          metal: 'gold',
          purity: '18K',
          ratePerGram: 5750.0,
          makingChargePerGram: 400.0,
          notes: '750 Hallmarked Diamond Jewellery Gold',
        },
        {
          metal: 'silver',
          purity: '925',
          ratePerGram: 94.0,
          makingChargePerGram: 50.0,
          notes: 'Sterling Silver 92.5%',
        },
      ];

      const entities = defaults.map((d) => this.shopRateRepository.create(d));
      rates = await this.shopRateRepository.save(entities);
      this.lastSyncTime = new Date();
    }

    return rates.map((r) => ({
      id: r.id,
      metal: r.metal,
      purity: r.purity,
      ratePerGram: Number(r.ratePerGram),
      makingChargePerGram: r.makingChargePerGram
        ? Number(r.makingChargePerGram)
        : null,
      notes: r.notes,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Retrieve current synchronization status metadata
   */
  getSyncStatus(): ShopRateSyncStatus {
    return {
      status: this.syncStatus,
      lastUpdated: this.lastSyncTime.toISOString(),
      source: this.syncSource,
      count: 0,
      error: this.syncError,
    };
  }

  /**
   * Synchronize rates with the live market bullion rate feed
   */
  async syncShopRatesWithLiveFeed() {
    if (this.isSyncing) {
      return {
        message: 'Synchronization already in progress',
        status: this.syncStatus,
        lastUpdated: this.lastSyncTime.toISOString(),
      };
    }

    this.isSyncing = true;
    this.syncStatus = 'syncing';
    this.syncError = null;

    try {
      if (this.ratesService) {
        this.logger.log('Triggering upstream bullion rates synchronization...');
        await this.ratesService.syncRates(true);
      }

      this.lastSyncTime = new Date();
      this.syncStatus = 'synced';
      this.syncError = null;

      const rates = await this.getShopRates();
      return {
        message: 'Store retail rates synchronized successfully',
        status: this.syncStatus,
        lastUpdated: this.lastSyncTime.toISOString(),
        rates,
      };
    } catch (err: any) {
      this.syncStatus = 'failed';
      this.syncError = err?.message || 'Upstream rate synchronization failed';
      this.logger.error('Failed to sync shop rates with live market feed', err);
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Add a new metal/purity rate configuration with duplicate validation
   */
  async createShopRate(dto: CreateShopRateDto) {
    const metal = dto.metal.trim().toLowerCase();
    const purity = dto.purity.trim().toUpperCase();

    // Enforce uniqueness validation: check if metal + purity already exists
    const existing = await this.shopRateRepository.findOne({
      where: { metal, purity, isActive: true },
    });

    if (existing) {
      throw new ConflictException(
        `A retail rate configuration for ${metal.charAt(0).toUpperCase() + metal.slice(1)} ${purity} already exists. Please edit the existing entry or choose a different purity.`,
      );
    }

    let ratePerGram = dto.ratePerGram;
    if (ratePerGram === undefined || ratePerGram === null || ratePerGram <= 0) {
      // Lookup latest live market rate if available
      if (this.ratesService) {
        try {
          const currentRates = await this.ratesService.getCurrentRates();
          if (metal === 'gold') {
            if (purity === '24K') ratePerGram = Number(currentRates.gold24K);
            else if (purity === '22K') ratePerGram = Number(currentRates.gold22K);
            else if (purity === '18K') ratePerGram = Number(currentRates.gold18K || Math.round(Number(currentRates.gold24K) * (18 / 24)));
            else if (purity === '14K') ratePerGram = Number(currentRates.gold14K || Math.round(Number(currentRates.gold24K) * (14 / 24)));
            else ratePerGram = Number(currentRates.gold24K);
          } else if (metal === 'silver') {
            ratePerGram = Number(currentRates.silver);
          }
        } catch (_) {}
      }
      if (!ratePerGram) ratePerGram = 0;
    }

    const newRate = this.shopRateRepository.create({
      metal,
      purity,
      ratePerGram: Math.max(0, ratePerGram),
      makingChargePerGram: dto.makingChargePerGram !== undefined && dto.makingChargePerGram !== null
        ? Math.max(0, dto.makingChargePerGram)
        : null,
      notes: dto.notes?.trim() || null,
      isActive: true,
    });

    const saved = await this.shopRateRepository.save(newRate);
    this.lastSyncTime = new Date();

    return {
      message: 'Retail rate configuration added successfully',
      rate: {
        id: saved.id,
        metal: saved.metal,
        purity: saved.purity,
        ratePerGram: Number(saved.ratePerGram),
        makingChargePerGram: saved.makingChargePerGram
          ? Number(saved.makingChargePerGram)
          : null,
        notes: saved.notes,
        updatedAt: saved.updatedAt,
      },
    };
  }

  /**
   * Update existing shop rate by ID or metal/purity
   */
  async updateSingleShopRate(id: string, dto: UpdateShopRateDto) {
    let rate = await this.shopRateRepository.findOne({ where: { id } });
    if (!rate && dto.metal && dto.purity) {
      rate = await this.shopRateRepository.findOne({
        where: {
          metal: dto.metal.toLowerCase(),
          purity: dto.purity.toUpperCase(),
        },
      });
    }

    if (!rate) {
      throw new NotFoundException('Shop rate configuration not found');
    }

    if (dto.ratePerGram !== undefined && !isNaN(dto.ratePerGram)) {
      rate.ratePerGram = Math.max(0, dto.ratePerGram);
    }

    if (dto.makingChargePerGram !== undefined) {
      rate.makingChargePerGram = Math.max(0, dto.makingChargePerGram);
    }

    if (dto.notes !== undefined) {
      rate.notes = dto.notes?.trim() || null;
    }

    rate.isActive = true;
    const saved = await this.shopRateRepository.save(rate);
    this.lastSyncTime = new Date();

    return {
      message: 'Shop rate updated successfully',
      rate: {
        id: saved.id,
        metal: saved.metal,
        purity: saved.purity,
        ratePerGram: Number(saved.ratePerGram),
        makingChargePerGram: saved.makingChargePerGram
          ? Number(saved.makingChargePerGram)
          : null,
        notes: saved.notes,
        updatedAt: saved.updatedAt,
      },
    };
  }

  /**
   * Bulk update shop rates
   */
  async updateShopRates(ratesDto: UpdateShopRateDto[]) {
    const updatedRates: ShopRate[] = [];

    for (const dto of ratesDto) {
      let rate = await this.shopRateRepository.findOne({
        where: {
          metal: dto.metal.toLowerCase(),
          purity: dto.purity.toUpperCase(),
        },
      });

      if (!rate) {
        rate = this.shopRateRepository.create({
          metal: dto.metal.toLowerCase(),
          purity: dto.purity.toUpperCase(),
          ratePerGram: Math.max(0, dto.ratePerGram),
          makingChargePerGram: dto.makingChargePerGram !== undefined ? Math.max(0, dto.makingChargePerGram) : null,
          notes: dto.notes ?? null,
          isActive: true,
        });
      } else {
        rate.ratePerGram = Math.max(0, dto.ratePerGram);
        if (dto.makingChargePerGram !== undefined) {
          rate.makingChargePerGram = Math.max(0, dto.makingChargePerGram);
        }
        if (dto.notes !== undefined) {
          rate.notes = dto.notes;
        }
        rate.isActive = true;
      }

      const saved = await this.shopRateRepository.save(rate);
      updatedRates.push(saved);
    }

    this.lastSyncTime = new Date();

    return {
      message: 'Shop rates updated successfully',
      rates: updatedRates.map((r) => ({
        id: r.id,
        metal: r.metal,
        purity: r.purity,
        ratePerGram: Number(r.ratePerGram),
        makingChargePerGram: r.makingChargePerGram
          ? Number(r.makingChargePerGram)
          : null,
        notes: r.notes,
        updatedAt: r.updatedAt,
      })),
    };
  }

  /**
   * Soft-delete or deactivate shop rate
   */
  async deleteShopRate(id: string) {
    const rate = await this.shopRateRepository.findOne({ where: { id } });
    if (!rate) {
      throw new NotFoundException('Shop rate not found');
    }
    rate.isActive = false;
    await this.shopRateRepository.save(rate);
    return { message: 'Shop rate removed successfully' };
  }

  /**
   * Retrieve supported metadata (metals, purities, live benchmarks)
   */
  async getShopRatesMeta() {
    let goldBenchmark = 7520;
    let silverBenchmark = 94;

    try {
      const activeGold = await this.shopRateRepository.findOne({
        where: { metal: 'gold', purity: '24K', isActive: true },
      });
      if (activeGold) {
        goldBenchmark = Number(activeGold.ratePerGram);
      }

      const activeSilver = await this.shopRateRepository.findOne({
        where: { metal: 'silver', purity: '925', isActive: true },
      });
      if (activeSilver) {
        silverBenchmark = Number(activeSilver.ratePerGram);
      }
    } catch (_) {}

    return {
      metals: [
        {
          name: 'gold',
          label: 'Gold',
          purities: ['24K', '22K', '20K', '18K', '14K', '10K'],
          benchmarkRate: goldBenchmark,
        },
        {
          name: 'silver',
          label: 'Silver',
          purities: ['999', '925', '800'],
          benchmarkRate: silverBenchmark,
        },
        {
          name: 'platinum',
          label: 'Platinum',
          purities: ['950'],
          benchmarkRate: 3450,
        },
      ],
      syncStatus: this.getSyncStatus(),
    };
  }

  async getShareCard() {
    const rates = await this.getShopRates();
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let messageText = `✨ *ZEWAR MAHAL — TODAY'S RATES* ✨\n📅 Date: ${today}\n\n`;

    for (const r of rates) {
      messageText += `🔹 *${r.metal.toUpperCase()} ${r.purity}*: ₹${r.ratePerGram}/gm\n`;
    }

    messageText += `\n📍 Visit: Zewar Mahal Jewellers\n📞 Call/WhatsApp: +91 98765 43210\n⚡ Rates subject to market variation.`;

    return {
      storeName: 'Zewar Mahal',
      date: today,
      rates,
      shareText: messageText,
    };
  }
}
