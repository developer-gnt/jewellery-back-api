import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service.js';
import { Category } from './entities/category.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategory: Partial<Category> = {
    id: 'cat-uuid-1',
    name: 'Necklaces',
    slug: 'necklaces',
    image: 'https://cdn.example.com/necklaces.jpg',
    description: 'Gold necklaces',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryRepo = {
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'cat-uuid-1' })),
    save: vi.fn().mockImplementation((cat) => Promise.resolve(cat)),
    remove: vi.fn().mockResolvedValue(undefined),
    createQueryBuilder: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([mockCategory]),
    }),
  };

  const mockProductRepo = {
    count: vi.fn().mockResolvedValue(0),
    createQueryBuilder: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      getRawMany: vi.fn().mockResolvedValue([{ categoryId: 'cat-uuid-1', count: '5' }]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return categories with product counts', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('productCount', 5);
      expect(result[0].name).toBe('Necklaces');
    });
  });

  describe('findOne', () => {
    it('should return category by ID', async () => {
      mockCategoryRepo.findOne.mockResolvedValueOnce(mockCategory);
      const result = await service.findOne('cat-uuid-1');
      expect(result.id).toBe('cat-uuid-1');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create category with slugified name', async () => {
      mockCategoryRepo.findOne.mockResolvedValueOnce(null);
      const result = await service.create({ name: 'Bridal Sets' });
      expect(result.slug).toBe('bridal-sets');
    });
  });

  describe('delete', () => {
    it('should prevent deletion if products are linked', async () => {
      mockCategoryRepo.findOne.mockResolvedValueOnce(mockCategory);
      mockProductRepo.count.mockResolvedValueOnce(3);

      await expect(service.delete('cat-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('should delete category if no products linked', async () => {
      mockCategoryRepo.findOne.mockResolvedValueOnce(mockCategory);
      mockProductRepo.count.mockResolvedValueOnce(0);

      const result = await service.delete('cat-uuid-1');
      expect(result).toHaveProperty('message', 'Category deleted successfully');
    });
  });
});
