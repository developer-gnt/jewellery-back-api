import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service.js';
import { UserDevice } from './entities/user-device.entity.js';
import { Notification } from './entities/notification.entity.js';
import { NotificationPreference } from '../users/entities/notification-preference.entity.js';
import { FcmService } from './services/fcm.service.js';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockDevice: Partial<UserDevice> = {
    id: 'device-1',
    userId: 'user-1',
    fcmToken: 'mock-fcm-token',
    platform: 'android',
    lastActiveAt: new Date(),
    createdAt: new Date(),
  };

  const mockNotification: Partial<Notification> = {
    id: 'notif-1',
    userId: 'user-1',
    title: 'New Offer Live',
    body: 'Check out our festive jewellery discounts!',
    isRead: false,
    createdAt: new Date(),
  };

  const mockDeviceRepo = {
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([mockDevice]),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'device-1' })),
    save: vi.fn().mockImplementation((d) => Promise.resolve(d)),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  const mockNotificationRepo = {
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'notif-1' })),
    save: vi.fn().mockImplementation((n) => Promise.resolve(n)),
    findAndCount: vi.fn().mockResolvedValue([[mockNotification], 1]),
    createQueryBuilder: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[mockNotification], 1]),
      getCount: vi.fn().mockResolvedValue(1),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 1 }),
    }),
  };

  const mockFcmService = {
    sendPushNotification: vi.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
  };

  const mockPrefRepo = {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue({ offers: true, rates: true, enquiries: true, general: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(UserDevice), useValue: mockDeviceRepo },
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
        { provide: getRepositoryToken(NotificationPreference), useValue: mockPrefRepo },
        { provide: FcmService, useValue: mockFcmService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerDevice', () => {
    it('should register or update user device FCM token', async () => {
      mockDeviceRepo.findOne.mockResolvedValueOnce(null);
      const result = await service.registerDevice('user-1', {
        fcmToken: 'mock-fcm-token',
        platform: 'android',
      });

      expect(result).toHaveProperty('message', 'Device registered successfully');
      expect(result).toHaveProperty('deviceId', 'device-1');
      expect(mockDeviceRepo.save).toHaveBeenCalled();
    });
  });

  describe('getMyNotifications', () => {
    it('should return in-app notifications with unread count', async () => {
      const result = await service.getMyNotifications('user-1');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result).toHaveProperty('unreadCount', 1);
    });
  });

  describe('sendNotification', () => {
    it('should broadcast push notification to all devices', async () => {
      const result = await service.sendNotification({
        title: 'Diwali Sale',
        body: 'Flat 50% off on making charges',
        targetAll: true,
      });

      expect(result).toHaveProperty('message', 'Push notification dispatched');
      expect(mockFcmService.sendPushNotification).toHaveBeenCalled();
    });
  });
});
