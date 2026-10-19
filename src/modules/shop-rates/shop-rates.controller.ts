import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ShopRatesService } from './shop-rates.service.js';
import { UpdateShopRateDto } from './dto/update-shop-rate.dto.js';
import { CreateShopRateDto } from './dto/create-shop-rate.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('shop-rates')
@Controller()
export class ShopRatesController {
  constructor(private readonly shopRatesService: ShopRatesService) {}

  @Public()
  @Get('shop/rates')
  @ApiOperation({ summary: 'Retrieve Zewar Mahal custom store rates' })
  @ApiResponse({
    status: 200,
    description: 'Current shop rates list',
  })
  getShopRates() {
    return this.shopRatesService.getShopRates();
  }

  @Public()
  @Get('shop/rates/meta')
  @ApiOperation({ summary: 'Retrieve supported metals, purities and benchmarks' })
  getShopRatesMeta() {
    return this.shopRatesService.getShopRatesMeta();
  }

  @Public()
  @Get('shop/rates/sync-status')
  @ApiOperation({ summary: 'Retrieve store rates sync status' })
  getSyncStatus() {
    return this.shopRatesService.getSyncStatus();
  }

  @Post('admin/shop/rates/sync')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Trigger synchronization with market rates feed (Admin)' })
  syncShopRatesAdmin() {
    return this.shopRatesService.syncShopRatesWithLiveFeed();
  }

  @Public()
  @Get('shop/rates/sync')
  @ApiOperation({ summary: 'Trigger synchronization with market rates feed' })
  syncShopRates() {
    return this.shopRatesService.syncShopRatesWithLiveFeed();
  }

  @Post('admin/shop/rates')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a new store retail rate configuration (Admin)' })
  @ApiResponse({ status: 201, description: 'Store rate created successfully' })
  createShopRate(@Body() dto: CreateShopRateDto) {
    return this.shopRatesService.createShopRate(dto);
  }

  @Put('admin/shop/rates/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a specific store rate by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Store rate updated successfully' })
  updateSingleShopRate(
    @Param('id') id: string,
    @Body() dto: UpdateShopRateDto,
  ) {
    return this.shopRatesService.updateSingleShopRate(id, dto);
  }

  @Put('admin/shop/rates')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update Zewar Mahal store rates (Admin)' })
  @ApiBody({ type: [UpdateShopRateDto] })
  @ApiResponse({ status: 200, description: 'Store rates updated successfully' })
  updateShopRates(@Body() rates: UpdateShopRateDto[]) {
    return this.shopRatesService.updateShopRates(rates);
  }

  @Public()
  @Get('shop/rates/share')
  @ApiOperation({ summary: 'Generate share-ready rate information card and WhatsApp text' })
  @ApiResponse({
    status: 200,
    description: 'Formatted share payload',
  })
  getShareCard() {
    return this.shopRatesService.getShareCard();
  }

  @Delete('admin/shop/rates/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete or deactivate a shop rate' })
  @ApiResponse({ status: 200, description: 'Shop rate deleted successfully' })
  deleteShopRate(@Param('id') id: string) {
    return this.shopRatesService.deleteShopRate(id);
  }
}

