import {
  Controller,
  Get,
  Put,
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
    schema: {
      example: {
        statusCode: 200,
        message: 'Success',
        data: [
          {
            metal: 'gold',
            purity: '22K',
            ratePerGram: 6920.0,
            makingChargePerGram: 450.0,
            notes: '916 BIS Hallmarked Jewellery Gold',
            updatedAt: '2026-10-15T14:45:00.000Z',
          },
        ],
      },
    },
  })
  getShopRates() {
    return this.shopRatesService.getShopRates();
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
}
