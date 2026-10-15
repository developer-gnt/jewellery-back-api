import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OffersService } from './offers.service.js';
import { Offer } from './entities/offer.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('OffersService', () => {
  let service: OffersService;

  const mockOffer: Partial<Offer> = {
    id: 'offer-1',
    title: 'Akshaya Tritiya Gold Offer',
    code: 'AKSHAYA',
    discount: '50% off making',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOfferRepo = {
    find: vi.fn().mockResolvedValue([mockOffer]),
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'offer-1' })),
    save: vi.fn().mockImplementation((offer) => Promise.resolve(offer)),
    remove: vi.fn().mockResolvedValue(undefined),
    createQueryBuilder: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([mockOffer]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: getRepositoryToken(Offer), useValue: mockOfferRepo },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return active offers', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Akshaya Tritiya Gold Offer');
    });
  });

  describe('findOne', () => {
    it('should return offer by ID', async () => {
      mockOfferRepo.findOne.mockResolvedValueOnce(mockOffer);
      const result = await service.findOne('offer-1');
      expect(result.id).toBe('offer-1');
    });

    it('should throw NotFoundException if offer not found', async () => {
      mockOfferRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save offer', async () => {
      const result = await service.create({ title: 'New Offer' });
      expect(result.title).toBe('New Offer');
    });
  });
});
