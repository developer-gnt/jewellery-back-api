import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { Product } from './entities/product.entity.js';
import { ProductImage } from './entities/product-image.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Category])],
  controllers: [ProductsController],
  providers: [ProductsService, JwtAuthGuard, AdminGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
