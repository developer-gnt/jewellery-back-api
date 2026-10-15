import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service.js';
import { OtpService } from './services/otp.service.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { NotificationPreference } from '../users/entities/notification-preference.entity.js';

describe('AuthService', () => {
  let service: AuthService;
  let otpService: OtpService;

  const mockUser = {
    id: 'user-uuid-1234',
    mobile: '9876543210',
    name: null,
    email: null,
    avatar: null,
    role: 'customer',
    isActive: true,
    isDeleted: false,
    notificationPreferences: {
      offers: true,
      rates: true,
      enquiries: true,
      general: true,
    },
  };

  const mockUserRepository = {
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'user-uuid-1234' })),
    save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  const mockPrefRepository = {
    create: vi.fn().mockImplementation((dto) => dto),
    save: vi.fn().mockImplementation((pref) => Promise.resolve(pref)),
  };

  const mockRefreshTokenRepository = {
    findOne: vi.fn(),
    create: vi.fn().mockImplementation((dto) => dto),
    save: vi.fn().mockImplementation((token) => Promise.resolve(token)),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockOtpService = {
    sendOtp: vi.fn().mockResolvedValue({ expiresIn: 120, devOtp: '123456' }),
    verifyOtp: vi.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('mock-jwt-token'),
    verifyAsync: vi.fn().mockResolvedValue({
      sub: 'user-uuid-1234',
      mobile: '9876543210',
      role: 'customer',
    }),
  };

  const mockConfigService = {
    get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
      const map: Record<string, any> = {
        'jwt.accessSecret': 'mock-access-secret',
        'jwt.refreshSecret': 'mock-refresh-secret',
        'jwt.accessExpires': '15m',
        'jwt.refreshExpires': '7d',
      };
      return map[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(NotificationPreference), useValue: mockPrefRepository },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepository },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    otpService = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should send OTP and return expiry info', async () => {
      const result = await service.sendOtp({ mobile: '9876543210' });
      expect(result).toHaveProperty('message', 'OTP sent successfully');
      expect(result).toHaveProperty('expiresIn', 120);
      expect(otpService.sendOtp).toHaveBeenCalledWith('9876543210');
    });
  });

  describe('verifyOtp', () => {
    it('should authenticate user and return tokens when OTP is valid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.verifyOtp({
        mobile: '9876543210',
        otp: '123456',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'mock-jwt-token');
      expect(result.user).toHaveProperty('id', mockUser.id);
      expect(result.user).toHaveProperty('mobile', mockUser.mobile);
    });

    it('should auto-register new user if not found in db', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.verifyOtp({
        mobile: '9876543210',
        otp: '123456',
      });

      expect(result.isNewUser).toBe(true);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke active tokens for user', async () => {
      const result = await service.logout('user-uuid-1234');
      expect(result).toHaveProperty('message', 'Logged out successfully');
      expect(mockRefreshTokenRepository.update).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return user details', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.getMe('user-uuid-1234');
      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('mobile', mockUser.mobile);
    });
  });
});
