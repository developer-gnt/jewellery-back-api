import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HomeService } from './home.service.js';
import { Banner } from '../banners/entities/banner.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { ProductsService } from '../products/products.service.js';

describe('HomeService', () => {
  let service: HomeService;

  const mockBanner = {
    id: 'banner-1',
    title: 'Diwali Gold Sale',
    image: 'https://cdn.example.com/banner1.jpg',
    order: 0,
    isActive: true,
  };

  const mockOffer = {
    id: 'offer-1',
    title: 'Zero Making Charges',
    code: 'ZEROMAKE',
    discount: '100% off making',
    isActive: true,
  };

  const mockBannerRepo = {
    find: vi.fn().mockResolvedValue([mockBanner]),
  };

  const mockOfferRepo = {
    createQueryBuilder: vi.fn().mockReturnValue({
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([mockOffer]),
    }),
  };

  const mockProductsService = {
    getFeatured: vi.fn().mockResolvedValue([]),
    getLatest: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        { provide: getRepositoryToken(Banner), useValue: mockBannerRepo },
        { provide: getRepositoryToken(Offer), useValue: mockOfferRepo },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBanners', () => {
    it('should return active banners', async () => {
      const banners = await service.getBanners();
      expect(banners).toHaveLength(1);
      expect(banners[0].title).toBe('Diwali Gold Sale');
    });
  });

  describe('getActiveOffers', () => {
    it('should return active promotional offers', async () => {
      const offers = await service.getActiveOffers();
      expect(offers).toHaveLength(1);
      expect(offers[0].code).toBe('ZEROMAKE');
    });
  });

  describe('getHomeAggregate', () => {
    it('should return combined home payload with current rates', async () => {
      const home = await service.getHomeAggregate();
      expect(home).toHaveProperty('banners');
      expect(home).toHaveProperty('featuredProducts');
      expect(home).toHaveProperty('latestProducts');
      expect(home).toHaveProperty('activeOffers');
      expect(home).toHaveProperty('currentRates');
      expect(home.currentRates).toHaveProperty('gold24K');
    });
  });
});
