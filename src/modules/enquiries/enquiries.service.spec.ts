import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnquiriesService } from './enquiries.service.js';
import { Enquiry } from './entities/enquiry.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { NotFoundException } from '@nestjs/common';

import { EnquiryItem } from './entities/enquiry-item.entity.js';
import { UserWishlist } from '../users/entities/user-wishlist.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';

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
    manager: {
      getRepository: vi.fn().mockReturnValue({
        findOne: vi.fn().mockResolvedValue({ id: 'user-uuid-1', name: 'Rohan Sharma', mobile: '9876543210' }),
      }),
    },
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

  const mockEnquiryItemRepo = {
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'item-uuid-1' })),
    save: vi.fn().mockImplementation((items) => Promise.resolve(items)),
  };

  const mockProductRepo = {
    findOne: vi.fn().mockResolvedValue({ id: 'prod-1', name: 'Gold Necklace' }),
  };

  const mockWishlistRepo = {
    find: vi.fn().mockResolvedValue([
      {
        id: 'wish-1',
        productId: 'prod-1',
        productName: 'Designer Gold Bangle',
        price: 89000,
        weight: 28,
        purity: '22K Filigree Gold',
        sku: 'SKU-DGB-028',
      },
    ]),
  };

  const mockNotificationsService = {
    sendToUser: vi.fn().mockResolvedValue(true),
    notifyAdminEnquiry: vi.fn().mockResolvedValue(true),
    notifyEnquiryUpdate: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiriesService,
        { provide: getRepositoryToken(Enquiry), useValue: mockEnquiryRepo },
        { provide: getRepositoryToken(EnquiryItem), useValue: mockEnquiryItemRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(UserWishlist), useValue: mockWishlistRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
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

  describe('submitBulk', () => {
    it('should create a bulk wishlist enquiry with associated items and no prices in message', async () => {
      const result = await service.submitBulk(
        {
          name: 'Rohan Sharma',
          mobile: '9876543210',
          message: 'Interested in all wishlist items',
        },
        'user-uuid-1',
      );

      expect(result).toHaveProperty('id', 'enq-uuid-1');
      expect(result).toHaveProperty('referenceNumber');
      expect(result.referenceNumber).toContain('ZM-ENQ-');
      expect(result.isBulkWishlist).toBe(true);
      expect(result.itemCount).toBe(1);
      expect(mockEnquiryItemRepo.save).toHaveBeenCalled();
      expect(mockEnquiryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.not.stringContaining('₹'),
        }),
      );
    });
  });
});
