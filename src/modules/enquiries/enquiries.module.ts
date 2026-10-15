import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnquiriesController } from './enquiries.controller.js';
import { EnquiriesService } from './enquiries.service.js';
import { Enquiry } from './entities/enquiry.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry, Product])],
  controllers: [EnquiriesController],
  providers: [EnquiriesService, JwtAuthGuard, AdminGuard],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
