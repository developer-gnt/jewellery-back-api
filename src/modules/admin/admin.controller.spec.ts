import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminRole } from './entities/admin.entity.js';

describe('AdminController', () => {
  let controller: AdminController;
  let service: Partial<Record<keyof AdminService, any>>;

  beforeEach(() => {
    service = {
      login: vi.fn(),
      logout: vi.fn(),
      getMe: vi.fn(),
      getDashboardStats: vi.fn(),
      getUsers: vi.fn(),
      getUserById: vi.fn(),
      updateUserStatus: vi.fn(),
    };

    controller = new AdminController(service as unknown as AdminService);
  });

  it('should call login on service', async () => {
    const mockResponse = {
      accessToken: 'access_jwt',
      refreshToken: 'refresh_jwt',
      admin: {
        id: 'uuid-1',
        name: 'Admin User',
        email: 'admin@zewarmahal.com',
        role: AdminRole.ADMIN,
      },
    };
    service.login.mockResolvedValue(mockResponse);

    const dto = { email: 'admin@zewarmahal.com', password: 'password123' };
    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockResponse);
  });

  it('should call logout on service', async () => {
    service.logout.mockResolvedValue({ message: 'Successfully logged out' });
    const result = await controller.logout('uuid-1', 'refresh_jwt');

    expect(service.logout).toHaveBeenCalledWith('uuid-1', 'refresh_jwt');
    expect(result.message).toBe('Successfully logged out');
  });

  it('should return admin profile on getMe', async () => {
    const mockAdmin = {
      id: 'uuid-1',
      name: 'Super Admin',
      email: 'admin@zewarmahal.com',
      role: AdminRole.SUPER_ADMIN,
    };
    service.getMe.mockResolvedValue(mockAdmin);

    const result = await controller.getMe('uuid-1');
    expect(service.getMe).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual(mockAdmin);
  });

  it('should return dashboard metrics on getDashboardStats', async () => {
    const mockStats = {
      totalUsers: 10,
      totalProducts: 50,
      totalEnquiries: 12,
      activeOffers: 3,
      todayEnquiries: 2,
    };
    service.getDashboardStats.mockResolvedValue(mockStats);

    const result = await controller.getDashboardStats();
    expect(service.getDashboardStats).toHaveBeenCalled();
    expect(result).toEqual(mockStats);
  });

  it('should return paginated users list on getUsers', async () => {
    const mockPaginated = {
      data: [{ id: 'u1', mobile: '9876543210' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    service.getUsers.mockResolvedValue(mockPaginated);

    const result = await controller.getUsers({ page: 1, limit: 20 });
    expect(service.getUsers).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(result).toEqual(mockPaginated);
  });

  it('should return user details on getUserById', async () => {
    const mockUser = { id: 'u1', name: 'Rohan', mobile: '9876543210' };
    service.getUserById.mockResolvedValue(mockUser);

    const result = await controller.getUserById('u1');
    expect(service.getUserById).toHaveBeenCalledWith('u1');
    expect(result).toEqual(mockUser);
  });

  it('should update user status on updateUserStatus', async () => {
    const mockUser = { id: 'u1', name: 'Rohan', isActive: false };
    service.updateUserStatus.mockResolvedValue(mockUser);

    const result = await controller.updateUserStatus('u1', { isActive: false });
    expect(service.updateUserStatus).toHaveBeenCalledWith('u1', false);
    expect(result.isActive).toBe(false);
  });
});
