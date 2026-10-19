import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OffersService } from './offers.service.js';
import { Offer } from './entities/offer.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OffersService', () => {
  let service: OffersService;

  const mockOffer: Partial<Offer> = {
    id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Akshaya Tritiya Gold Offer',
    code: 'AKSHAYA',
    discount: '50% off making',
    isActive: true,
    applicableOn: 'All Jewellery',
    categoryId: null,
    productIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let currentOffer = { ...mockOffer };

  const mockOfferRepo = {
    find: vi.fn().mockResolvedValue([mockOffer]),
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => {
      currentOffer = { ...mockOffer, ...dto, id: 'a0000000-0000-0000-0000-000000000001' };
      return currentOffer;
    }),
    save: vi.fn().mockImplementation((offer) => {
      currentOffer = { ...currentOffer, ...offer };
      return Promise.resolve(currentOffer);
    }),
    remove: vi.fn().mockResolvedValue(undefined),
    createQueryBuilder: vi.fn().mockReturnValue({
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([mockOffer]),
      getOne: vi.fn().mockImplementation(() => Promise.resolve(currentOffer)),
    }),
  };

  const sampleProducts: Partial<Product>[] = [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      name: 'Royal Kundan Choker',
      categoryId: 'c0000000-0000-0000-0000-000000000001',
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      name: 'Emerald Solitaire Ring',
      categoryId: 'c0000000-0000-0000-0000-000000000002',
    },
  ];

  const mockProductRepo = {
    findBy: vi.fn().mockImplementation((condition) => {
      const ids: string[] = condition?.id?._value || [];
      return Promise.resolve(sampleProducts.filter((p) => ids.includes(p.id!)));
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: getRepositoryToken(Offer), useValue: mockOfferRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
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
      const result = await service.findOne('a0000000-0000-0000-0000-000000000001');
      expect(result.id).toBe('a0000000-0000-0000-0000-000000000001');
    });

    it('should throw NotFoundException if offer not found', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('applicability validation and create', () => {
    it('should create offer with "All Jewellery" and clear categoryId/productIds', async () => {
      const result = await service.create({
        title: 'Storewide Gold Fest',
        applicableOn: 'All Jewellery',
        categoryId: 'c0000000-0000-0000-0000-000000000001',
        productIds: ['p0000000-0000-0000-0000-000000000001'],
      });
      expect(result.categoryId).toBeNull();
      expect(result.productIds).toEqual([]);
    });

    it('should require categoryId when applicableOn is "Category"', async () => {
      await expect(
        service.create({
          title: 'Necklace Discount',
          applicableOn: 'Category',
          categoryId: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create offer with "Category" and clear productIds', async () => {
      const result = await service.create({
        title: 'Necklace Discount',
        applicableOn: 'Category',
        categoryId: 'c0000000-0000-0000-0000-000000000001',
        productIds: ['p0000000-0000-0000-0000-000000000001'],
      });
      expect(result.categoryId).toBe('c0000000-0000-0000-0000-000000000001');
      expect(result.productIds).toEqual([]);
    });

    it('should require categoryId and productIds for "Specific Pieces"', async () => {
      await expect(
        service.create({
          title: 'Specific Piece Promo',
          applicableOn: 'Specific Pieces',
          categoryId: '',
          productIds: [],
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({
          title: 'Specific Piece Promo',
          applicableOn: 'Specific Pieces',
          categoryId: 'c0000000-0000-0000-0000-000000000001',
          productIds: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if selected product belongs to a different category', async () => {
      await expect(
        service.create({
          title: 'Specific Piece Promo',
          applicableOn: 'Specific Pieces',
          categoryId: 'c0000000-0000-0000-0000-000000000001',
          // p0000000-0000-0000-0000-000000000002 belongs to c0000000-0000-0000-0000-000000000002
          productIds: ['p0000000-0000-0000-0000-000000000002'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create offer with "Specific Pieces" when products match category', async () => {
      const result = await service.create({
        title: 'Specific Piece Promo',
        applicableOn: 'Specific Pieces',
        categoryId: 'c0000000-0000-0000-0000-000000000001',
        productIds: ['p0000000-0000-0000-0000-000000000001'],
      });
      expect(result.categoryId).toBe('c0000000-0000-0000-0000-000000000001');
      expect(result.productIds).toEqual(['p0000000-0000-0000-0000-000000000001']);
    });
  });
});
