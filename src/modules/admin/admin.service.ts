import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { Admin, AdminRole } from './entities/admin.entity.js';
import { RefreshToken } from '../auth/entities/refresh-token.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto.js';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto.js';

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalEnquiries: number;
  activeOffers: number;
  todayEnquiries: number;
}

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  /**
   * Seed default admin account if none exists in database
   */
  async seedDefaultAdmin(): Promise<void> {
    try {
      const count = await this.adminRepository.count();
      if (count === 0) {
        const defaultEmail = 'admin@zewarmahal.com';
        const defaultPassword = 'Admin@123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const admin = this.adminRepository.create({
          name: 'Super Admin',
          email: defaultEmail,
          password: hashedPassword,
          role: AdminRole.SUPER_ADMIN,
          isActive: true,
        });

        await this.adminRepository.save(admin);
        this.logger.log(`Initialized default super admin: ${defaultEmail}`);
      }
    } catch (err) {
      // Safe catch during initial setup before migrations or DB sync runs
      this.logger.warn(
        `Could not seed default admin yet: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Admin email/password login
   */
  async login(dto: AdminLoginDto): Promise<AdminAuthResponse> {
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where('LOWER(admin.email) = LOWER(:email)', { email: dto.email.trim() })
      .getOne();

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException(
        'Account has been deactivated. Please contact support.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: (this.configService.get<string>('jwt.accessExpires') ||
        '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: admin.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: (this.configService.get<string>('jwt.refreshExpires') ||
          '7d') as any,
      },
    );

    // Persist refresh token (valid for 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save({
      adminId: admin.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Admin logout - invalidate refresh tokens
   */
  async logout(
    adminId: string,
    refreshToken?: string,
  ): Promise<{ message: string }> {
    if (refreshToken) {
      await this.refreshTokenRepository.delete({
        adminId,
        token: refreshToken,
      });
    } else {
      await this.refreshTokenRepository.delete({ adminId });
    }
    return { message: 'Successfully logged out' };
  }

  /**
   * Get current authenticated admin details
   */
  async getMe(adminId: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }
    return admin;
  }

  /**
   * Retrieve CMS dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const totalUsers = await this.userRepository.count();

    let totalProducts = 0;
    let totalEnquiries = 0;
    let activeOffers = 0;
    let todayEnquiries = 0;

    // Check optional tables dynamically so query won't fail before later phases are created
    try {
      const hasProductsTable = await this.checkTableExists('products');
      if (hasProductsTable) {
        const result = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM products',
        );
        totalProducts = parseInt(result[0]?.count || '0', 10);
      }

      const hasEnquiriesTable = await this.checkTableExists('enquiries');
      if (hasEnquiriesTable) {
        const totalResult = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM enquiries',
        );
        totalEnquiries = parseInt(totalResult[0]?.count || '0', 10);

        const todayResult = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM enquiries WHERE "createdAt" >= CURRENT_DATE',
        );
        todayEnquiries = parseInt(todayResult[0]?.count || '0', 10);
      }

      const hasOffersTable = await this.checkTableExists('offers');
      if (hasOffersTable) {
        const offersResult = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM offers WHERE "isActive" = true',
        );
        activeOffers = parseInt(offersResult[0]?.count || '0', 10);
      }
    } catch (err) {
      this.logger.debug(
        `Stats auxiliary table check: ${(err as Error).message}`,
      );
    }

    return {
      totalUsers,
      totalProducts,
      totalEnquiries,
      activeOffers,
      todayEnquiries,
    };
  }

  /**
   * List registered customers with filtering, search and pagination
   */
  async getUsers(query: AdminUsersQueryDto): Promise<PaginatedResult<User>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user');

    if (query.search) {
      const search = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.name) LIKE :search OR user.mobile LIKE :search OR LOWER(user.email) LIKE :search)',
        { search },
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return paginate(users, total, page, limit);
  }

  /**
   * Get single customer by ID
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Activate or deactivate customer account
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.getUserById(id);
    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
        [tableName],
      );
      return Boolean(result[0]?.exists);
    } catch {
      return false;
    }
  }
}
