import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, RefreshToken, User]), JwtModule],
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard, AdminGuard],
  exports: [AdminService],
})
export class AdminModule {}
