import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
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
  @ApiResponse({ status: 200, description: 'Paginated customer list with counts' })
  async getUsers(
    @Query() query: AdminUsersQueryDto,
  ): Promise<any> {
    return this.adminService.getUsers(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Post('users')
  @ApiOperation({ summary: 'Register a new customer account from admin portal' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(@Body() dto: CreateCustomerDto): Promise<User> {
    return this.adminService.createCustomer(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Get('users/:id')
  @ApiOperation({ summary: 'Retrieve details for a single customer by UUID or customerCode' })
  @ApiParam({ name: 'id', description: 'Customer UUID or customerCode' })
  @ApiResponse({ status: 200, description: 'Customer profile details' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.adminService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Put('users/:id')
  @ApiOperation({ summary: 'Update customer details' })
  @ApiParam({ name: 'id', description: 'Customer UUID or customerCode' })
  @ApiResponse({ status: 200, description: 'Customer profile updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<User> {
    return this.adminService.updateCustomer(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Delete('users/:id')
  @ApiOperation({ summary: 'Soft-delete customer account respecting data retention' })
  @ApiParam({ name: 'id', description: 'Customer UUID or customerCode' })
  @ApiResponse({ status: 200, description: 'Customer account deactivated and deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async deleteCustomer(@Param('id') id: string): Promise<{ message: string; id: string }> {
    return this.adminService.deleteCustomer(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a customer account' })
  @ApiParam({ name: 'id', description: 'Customer UUID or customerCode' })
  @ApiResponse({ status: 200, description: 'Customer account status updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: AdminUserStatusDto,
  ): Promise<User> {
    return this.adminService.updateUserStatus(id, dto.isActive);
  }
}

