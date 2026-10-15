import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BannersService } from './banners.service.js';
import { Banner } from './entities/banner.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('BannersService', () => {
  let service: BannersService;

  const mockBanner: Partial<Banner> = {
    id: 'banner-1',
    title: 'Wedding Collection 2026',
    image: 'https://cdn.example.com/banner.jpg',
    link: '/categories/wedding',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBannerRepo = {
    find: vi.fn().mockResolvedValue([mockBanner]),
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'banner-1' })),
    save: vi.fn().mockImplementation((b) => Promise.resolve(b)),
    remove: vi.fn().mockResolvedValue(undefined),
    createQueryBuilder: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([mockBanner]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannersService,
        { provide: getRepositoryToken(Banner), useValue: mockBannerRepo },
      ],
    }).compile();

    service = module.get<BannersService>(BannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return banners', async () => {
      const banners = await service.findAll();
      expect(banners).toHaveLength(1);
      expect(banners[0].title).toBe('Wedding Collection 2026');
    });
  });

  describe('findOne', () => {
    it('should return banner by ID', async () => {
      mockBannerRepo.findOne.mockResolvedValueOnce(mockBanner);
      const banner = await service.findOne('banner-1');
      expect(banner.id).toBe('banner-1');
    });

    it('should throw NotFoundException if banner not found', async () => {
      mockBannerRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save banner', async () => {
      const result = await service.create({
        title: 'New Banner',
        image: 'https://cdn.example.com/new.jpg',
      });
      expect(result.title).toBe('New Banner');
    });
  });
});
