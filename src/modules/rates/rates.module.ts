import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatesController } from './rates.controller.js';
import { RatesService } from './rates.service.js';
import { MetalRate } from './entities/metal-rate.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([MetalRate])],
  controllers: [RatesController],
  providers: [RatesService, JwtAuthGuard, AdminGuard],
  exports: [RatesService],
})
export class RatesModule {}
