import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Retrieve customer profile' })
  @ApiResponse({
    status: 200,
    description: 'Customer profile details',
    schema: {
      example: {
        statusCode: 200,
        message: 'Success',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Ayesha Khan',
          mobile: '9876543210',
          email: 'ayesha.khan@example.com',
          avatar: null,
          role: 'customer',
          createdAt: '2026-10-15T14:00:00.000Z',
          notificationPreferences: {
            offers: true,
            rates: true,
            enquiries: true,
            general: true,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update customer profile details (name, email, avatar)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed or email already in use' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request account deletion (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Account marked as deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteAccount(@CurrentUser('sub') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  @Get('notification-preferences')
  @ApiOperation({ summary: 'Retrieve customer notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Current notification preferences',
    schema: {
      example: {
        statusCode: 200,
        message: 'Success',
        data: {
          offers: true,
          rates: true,
          enquiries: true,
          general: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getNotificationPreferences(@CurrentUser('sub') userId: string) {
    return this.usersService.getNotificationPreferences(userId);
  }

  @Put('notification-preferences')
  @ApiOperation({ summary: 'Update customer notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Updated notification preferences',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateNotificationPreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.usersService.updateNotificationPreferences(userId, dto);
  }
}
