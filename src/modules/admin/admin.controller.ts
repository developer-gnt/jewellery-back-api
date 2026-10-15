import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  AdminService,
  AdminAuthResponse,
  DashboardStats,
} from './admin.service.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { AdminUserStatusDto } from './dto/admin-user-status.dto.js';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/roles.decorator.js';
import { Admin } from './entities/admin.entity.js';
import { User } from '../users/entities/user.entity.js';
import { PaginatedResult } from '../../common/dto/pagination.dto.js';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful with JWT access & refresh tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() dto: AdminLoginDto): Promise<AdminAuthResponse> {
    return this.adminService.login(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin logout / session invalidation' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @CurrentUser('sub') adminId: string,
    @Body('refreshToken') refreshToken?: string,
  ): Promise<{ message: string }> {
    return this.adminService.logout(adminId, refreshToken);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Get('auth/me')
  @ApiOperation({ summary: 'Retrieve authenticated admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile returned' })
  async getMe(@CurrentUser('sub') adminId: string): Promise<Admin> {
    return this.adminService.getMe(adminId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Get('dashboard')
  @ApiOperation({ summary: 'Retrieve CMS dashboard metrics & statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics object' })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Get('users')
  @ApiOperation({
    summary: 'List customer accounts with search, status filter & pagination',
  })
  @ApiResponse({ status: 200, description: 'Paginated customer list' })
  async getUsers(
    @Query() query: AdminUsersQueryDto,
  ): Promise<PaginatedResult<User>> {
    return this.adminService.getUsers(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Get('users/:id')
  @ApiOperation({ summary: 'Retrieve details for a single customer by UUID' })
  @ApiParam({ name: 'id', description: 'Customer UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Customer profile details' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.adminService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a customer account' })
  @ApiParam({ name: 'id', description: 'Customer UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Customer account status updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUserStatusDto,
  ): Promise<User> {
    return this.adminService.updateUserStatus(id, dto.isActive);
  }
}
