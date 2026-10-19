import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopRatesController } from './shop-rates.controller.js';
import { ShopRatesService } from './shop-rates.service.js';
import { ShopRate } from './entities/shop-rate.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

import { RatesModule } from '../rates/rates.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([ShopRate]), RatesModule],
  controllers: [ShopRatesController],
  providers: [ShopRatesService, JwtAuthGuard, AdminGuard],
  exports: [ShopRatesService],
})
export class ShopRatesModule {}
