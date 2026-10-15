import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HomeService } from './home.service.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('home')
@Public()
@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('home')
  @ApiOperation({
    summary:
      'Aggregate homepage data (banners, featured & latest products, active offers, current rates)',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated home dashboard payload for app launch',
    schema: {
      example: {
        statusCode: 200,
        message: 'Success',
        data: {
          banners: [],
          featuredProducts: [],
          latestProducts: [],
          activeOffers: [],
          currentRates: {
            gold24K: 7450.0,
            gold22K: 6850.0,
            silver: 92.5,
            unit: 'gram',
            updatedAt: '2026-10-15T14:30:00.000Z',
          },
        },
      },
    },
  })
  getHome() {
    return this.homeService.getHomeAggregate();
  }

  @Get('banners')
  @ApiOperation({ summary: 'Retrieve active promotional banners' })
  @ApiResponse({ status: 200, description: 'List of active banners' })
  getBanners() {
    return this.homeService.getBanners();
  }

  @Get('offers/active')
  @ApiOperation({ summary: 'Retrieve currently active offers and promotions' })
  @ApiResponse({ status: 200, description: 'List of active offers' })
  getActiveOffers() {
    return this.homeService.getActiveOffers();
  }
}
