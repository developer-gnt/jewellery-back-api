import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopRatesService } from './shop-rates.service.js';
import { ShopRate } from './entities/shop-rate.entity.js';

describe('ShopRatesService', () => {
  let service: ShopRatesService;

  const mockShopRate: Partial<ShopRate> = {
    id: 'shop-rate-1',
    metal: 'gold',
    purity: '22K',
    ratePerGram: 6920.0,
    makingChargePerGram: 450.0,
    notes: '916 Hallmark',
    isActive: true,
    updatedAt: new Date(),
  };

  const mockShopRateRepo = {
    find: vi.fn().mockResolvedValue([mockShopRate]),
    findOne: vi.fn().mockResolvedValue(mockShopRate),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'shop-rate-1' })),
    save: vi.fn().mockImplementation((rate) => Promise.resolve(rate)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopRatesService,
        { provide: getRepositoryToken(ShopRate), useValue: mockShopRateRepo },
      ],
    }).compile();

    service = module.get<ShopRatesService>(ShopRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getShopRates', () => {
    it('should return store rates', async () => {
      const rates = await service.getShopRates();
      expect(rates).toHaveLength(1);
      expect(rates[0].ratePerGram).toBe(6920.0);
    });
  });

  describe('updateShopRates', () => {
    it('should update shop rates in bulk', async () => {
      const result = await service.updateShopRates([
        {
          metal: 'gold',
          purity: '22K',
          ratePerGram: 6950,
          makingChargePerGram: 450,
        },
      ]);

      expect(result).toHaveProperty('message', 'Shop rates updated successfully');
      expect(result.rates[0].ratePerGram).toBe(6950);
    });
  });

  describe('getShareCard', () => {
    it('should return formatted share card with WhatsApp text', async () => {
      const card = await service.getShareCard();
      expect(card).toHaveProperty('storeName', 'Zewar Mahal');
      expect(card).toHaveProperty('shareText');
      expect(card.shareText).toContain('ZEWAR MAHAL');
    });
  });
});
