import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RatesService } from './rates.service.js';
import { MetalRate } from './entities/metal-rate.entity.js';

describe('RatesService', () => {
  let service: RatesService;

  const mockRate: Partial<MetalRate> = {
    id: 'rate-uuid-1',
    gold24K: 7450.0,
    gold22K: 6850.0,
    silver: 92.5,
    unit: 'gram',
    isManualOverride: false,
    source: 'provider',
    createdAt: new Date(),
  };

  const mockMetalRateRepo = {
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([mockRate]),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'rate-uuid-1', createdAt: new Date() })),
    save: vi.fn().mockImplementation((rate) => Promise.resolve(rate)),
  };

  const mockConfigService = {
    get: vi.fn().mockReturnValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatesService,
        { provide: getRepositoryToken(MetalRate), useValue: mockMetalRateRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RatesService>(RatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentRates', () => {
    it('should return live/baseline rates', async () => {
      mockMetalRateRepo.find.mockResolvedValueOnce([mockRate]);
      const rates = await service.getCurrentRates();
      expect(rates).toHaveProperty('gold24K', 7450.0);
      expect(rates).toHaveProperty('silver', 92.5);
    });
  });

  describe('updateAdminRates', () => {
    it('should update rates with manual override', async () => {
      mockMetalRateRepo.find.mockResolvedValue([
        {
          ...mockRate,
          gold24K: 7500,
          gold22K: 6875,
          silver: 95,
        },
      ]);
      const result = await service.updateAdminRates({
        gold24K: 7500,
        gold22K: 6875,
        silver: 95,
      });

      expect(result).toHaveProperty('gold24K', 7500);
      expect(mockMetalRateRepo.save).toHaveBeenCalled();
    });
  });
});
