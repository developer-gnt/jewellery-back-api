import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../banners/entities/banner.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { ProductsService } from '../products/products.service.js';
import { RatesService } from '../rates/rates.service.js';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);
  private homeCache: CacheItem<any> | null = null;
  private readonly CACHE_TTL_MS = 2000; // 2 seconds (ensures newly added products show up immediately)

  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly productsService: ProductsService,
    @Optional()
    private readonly ratesService?: RatesService,
  ) {}

  async getBanners() {
    return this.bannerRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getActiveOffers() {
    const now = new Date();
    return this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.isActive = true')
      .andWhere('(offer.startDate IS NULL OR offer.startDate <= :now)', { now })
      .andWhere('(offer.endDate IS NULL OR offer.endDate >= :now)', { now })
      .orderBy('offer.createdAt', 'DESC')
      .getMany();
  }

  async getHomeAggregate() {
    const now = Date.now();
    if (this.homeCache && now < this.homeCache.expiresAt) {
      return this.homeCache.data;
    }

    const [banners, featuredProducts, latestProducts, activeOffers, rates] =
      await Promise.all([
        this.getBanners(),
        this.productsService.getFeatured(8),
        this.productsService.getLatest(8),
        this.getActiveOffers(),
        this.ratesService
          ? this.ratesService.getCurrentRates()
          : Promise.resolve(null),
      ]);

    const currentRates = rates ?? {
      gold24K: 7450.0,
      gold22K: 6850.0,
      silver: 92.5,
      unit: 'gram',
      updatedAt: new Date().toISOString(),
    };

    const result = {
      banners,
      featuredProducts,
      latestProducts,
      activeOffers,
      currentRates,
    };

    this.homeCache = {
      data: result,
      expiresAt: now + this.CACHE_TTL_MS,
    };

    return result;
  }

  clearCache() {
    this.homeCache = null;
  }
}
