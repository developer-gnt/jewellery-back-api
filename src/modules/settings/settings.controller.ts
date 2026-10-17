import {
  Controller,
  Get,
  Put,
  Patch,
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
import { SettingsService, PublicStoreSettings } from './settings.service.js';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto.js';
import { StoreSetting } from './entities/store-setting.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Retrieve public store settings (root)',
  })
  async getRootSettings(): Promise<PublicStoreSettings> {
    return this.settingsService.getPublicSettings();
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Retrieve public store settings including WhatsApp concierge number',
  })
  @ApiResponse({
    status: 200,
    description: 'Public store settings returned',
  })
  async getPublicSettings(): Promise<PublicStoreSettings> {
    return this.settingsService.getPublicSettings();
  }

  @Public()
  @Get('whatsapp')
  @ApiOperation({
    summary: 'Retrieve active WhatsApp phone number for concierge',
  })
  @ApiResponse({
    status: 200,
    description: 'WhatsApp number and message returned',
  })
  async getWhatsAppInfo(): Promise<{ whatsappNumber: string; welcomeMessage: string }> {
    return this.settingsService.getWhatsAppInfo();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Get('admin')
  @ApiOperation({
    summary: 'Admin: Retrieve full store settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Full store settings returned',
  })
  async getAdminSettings(): Promise<StoreSetting> {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Put('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin: Update store settings (WhatsApp number, contacts, address)',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated store settings returned',
  })
  async updateAdminSettingsPut(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSetting> {
    return this.settingsService.updateSettings(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @Patch('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin: Partially update store settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated store settings returned',
  })
  async updateAdminSettingsPatch(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSetting> {
    return this.settingsService.updateSettings(dto);
  }
}

@ApiTags('admin')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Admin: Retrieve store settings via /admin/settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Store settings returned',
  })
  async getSettings(): Promise<StoreSetting> {
    return this.settingsService.getSettings();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin: Update store settings via PUT /admin/settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Store settings updated',
  })
  async updateSettingsPut(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSetting> {
    return this.settingsService.updateSettings(dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin: Update store settings via PATCH /admin/settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Store settings updated',
  })
  async updateSettingsPatch(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSetting> {
    return this.settingsService.updateSettings(dto);
  }
}
