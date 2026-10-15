import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { NotificationPreference } from './entities/notification-preference.entity.js';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: Partial<User> = {
    id: 'user-uuid-1234',
    name: 'Ayesha Khan',
    mobile: '9876543210',
    email: 'ayesha@example.com',
    avatar: null,
    role: 'customer',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreferences: Partial<NotificationPreference> = {
    id: 'pref-uuid-1234',
    userId: 'user-uuid-1234',
    offers: true,
    rates: true,
    enquiries: true,
    general: true,
  };

  const mockUserRepository = {
    findOne: vi.fn(),
    save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  const mockPrefRepository = {
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => dto),
    save: vi.fn().mockImplementation((pref) => Promise.resolve(pref)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(NotificationPreference), useValue: mockPrefRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile of the user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({
        ...mockUser,
        notificationPreferences: mockPreferences,
      });

      const profile = await service.getProfile('user-uuid-1234');
      expect(profile).toHaveProperty('id', 'user-uuid-1234');
      expect(profile).toHaveProperty('name', 'Ayesha Khan');
      expect(profile).toHaveProperty('mobile', '9876543210');
      expect(profile.notificationPreferences).toHaveProperty('offers', true);
    });
  });

  describe('updateProfile', () => {
    it('should update user name and email', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ ...mockUser });

      const updated = await service.updateProfile('user-uuid-1234', {
        name: 'Ayesha Updated',
      });

      expect(updated.name).toBe('Ayesha Updated');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete user account', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ ...mockUser });

      const result = await service.deleteAccount('user-uuid-1234');
      expect(result).toHaveProperty('message', 'Account deleted successfully');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return user preferences', async () => {
      mockPrefRepository.findOne.mockResolvedValueOnce(mockPreferences);

      const prefs = await service.getNotificationPreferences('user-uuid-1234');
      expect(prefs).toHaveProperty('offers', true);
      expect(prefs).toHaveProperty('rates', true);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update user preferences', async () => {
      mockPrefRepository.findOne.mockResolvedValueOnce({ ...mockPreferences });

      const result = await service.updateNotificationPreferences('user-uuid-1234', {
        offers: false,
      });

      expect(result.offers).toBe(false);
      expect(mockPrefRepository.save).toHaveBeenCalled();
    });
  });
});
