import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnquiriesService } from './enquiries.service.js';
import { Enquiry } from './entities/enquiry.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('EnquiriesService', () => {
  let service: EnquiriesService;

  const mockEnquiry: Partial<Enquiry> = {
    id: 'enq-uuid-1',
    referenceNumber: 'ZM-ENQ-20261015-ABCD',
    userId: 'user-uuid-1',
    name: 'Rohan Sharma',
    mobile: '9876543210',
    message: 'Looking for 22K necklace',
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEnquiryRepo = {
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([mockEnquiry]),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'enq-uuid-1', createdAt: new Date() })),
    save: vi.fn().mockImplementation((enq) => Promise.resolve(enq)),
    createQueryBuilder: vi.fn().mockReturnValue({
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[mockEnquiry], 1]),
    }),
  };

  const mockProductRepo = {
    findOne: vi.fn().mockResolvedValue({ id: 'prod-1', name: 'Gold Necklace' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiriesService,
        { provide: getRepositoryToken(Enquiry), useValue: mockEnquiryRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<EnquiriesService>(EnquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submit', () => {
    it('should create enquiry with generated reference number', async () => {
      const result = await service.submit(
        {
          name: 'Rohan Sharma',
          mobile: '9876543210',
          message: 'Interested in bridal collection',
        },
        'user-uuid-1',
      );

      expect(result).toHaveProperty('id', 'enq-uuid-1');
      expect(result).toHaveProperty('referenceNumber');
      expect(result.referenceNumber).toContain('ZM-ENQ-');
      expect(result.status).toBe('new');
    });
  });

  describe('getMyEnquiries', () => {
    it('should return user submitted enquiries', async () => {
      const result = await service.getMyEnquiries('user-uuid-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Rohan Sharma');
    });
  });

  describe('updateStatus', () => {
    it('should update enquiry status', async () => {
      mockEnquiryRepo.findOne.mockResolvedValueOnce(mockEnquiry);
      const result = await service.updateStatus('enq-uuid-1', {
        status: 'contacted',
        adminNotes: 'Called customer',
      });

      expect(result.status).toBe('contacted');
      expect(result.adminNotes).toBe('Called customer');
      expect(mockEnquiryRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if enquiry not found', async () => {
      mockEnquiryRepo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.updateStatus('invalid-id', { status: 'closed' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
