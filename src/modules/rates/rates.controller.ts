import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RatesService } from './rates.service.js';
import { UpdateRatesDto } from './dto/update-rates.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('rates')
@Controller()
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Public()
  @Get('rates/current')
  @ApiOperation({ summary: 'Retrieve current market gold and silver rates' })
  @ApiResponse({
    status: 200,
    description: 'Current rates',
    schema: {
      example: {
        statusCode: 200,
        message: 'Success',
        data: {
          gold24K: 7450.0,
          gold22K: 6850.0,
          silver: 92.5,
          unit: 'gram',
          isManualOverride: false,
          source: 'provider',
          updatedAt: '2026-10-15T14:45:00.000Z',
        },
      },
    },
  })
  getCurrentRates() {
    return this.ratesService.getCurrentRates();
  }

  @Public()
  @Get('rates/history')
  @ApiOperation({ summary: 'Retrieve historical gold and silver rate trends' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Rate history list' })
  getRateHistory(@Query('limit') limit?: number) {
    return this.ratesService.getRateHistory(limit ? Number(limit) : 30);
  }

  @Get('admin/rates')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve rates details and override settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Current rates and override metadata' })
  getAdminRates() {
    return this.ratesService.getAdminRates();
  }

  @Put('admin/rates')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Manually override metal rates (Admin)' })
  @ApiResponse({ status: 200, description: 'Rates overridden successfully' })
  updateAdminRates(@Body() dto: UpdateRatesDto) {
    return this.ratesService.updateAdminRates(dto);
  }
}
