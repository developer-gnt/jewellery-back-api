import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service.js';
import { Product } from './entities/product.entity.js';
import { ProductImage } from './entities/product-image.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct: Partial<Product> = {
    id: 'prod-uuid-1',
    name: 'Gold Bangle',
    slug: 'gold-bangle',
    price: 45000,
    metal: 'gold',
    purity: '22K',
    categoryId: 'cat-uuid-1',
    isPublished: true,
    isFeatured: true,
    isLatest: true,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductRepo = {
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([mockProduct]),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'prod-uuid-1' })),
    save: vi.fn().mockImplementation((prod) => Promise.resolve(prod)),
    remove: vi.fn().mockResolvedValue(undefined),
    createQueryBuilder: vi.fn().mockReturnValue({
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[mockProduct], 1]),
    }),
  };

  const mockImageRepo = {
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'img-uuid-1' })),
    save: vi.fn().mockImplementation((img) => Promise.resolve(img)),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    findOne: vi.fn(),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  const mockCategoryRepo = {
    findOne: vi.fn().mockResolvedValue({ id: 'cat-uuid-1', name: 'Bangles' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(ProductImage), useValue: mockImageRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = await service.findAll({});
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('findOne', () => {
    it('should return product by ID', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(mockProduct);
      const result = await service.findOne('prod-uuid-1');
      expect(result.id).toBe('prod-uuid-1');
      expect(result.name).toBe('Gold Bangle');
    });

    it('should throw NotFoundException if not found', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFeatured', () => {
    it('should return featured products', async () => {
      const result = await service.getFeatured(5);
      expect(result).toHaveLength(1);
      expect(result[0].isFeatured).toBe(true);
    });
  });

  describe('addImage', () => {
    it('should add image to product gallery', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(mockProduct);
      const result = await service.addImage('prod-uuid-1', {
        url: 'https://cdn.example.com/bangle.jpg',
      });
      expect(result.url).toBe('https://cdn.example.com/bangle.jpg');
    });
  });
});
