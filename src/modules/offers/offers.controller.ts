import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OffersService } from './offers.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { ToggleOfferStatusDto } from './dto/toggle-offer-status.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('offers')
@Controller()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public()
  @Get('offers')
  @ApiOperation({ summary: 'Retrieve promotional offers and announcements' })
  @ApiQuery({ name: 'all', required: false, type: Boolean, description: 'Include inactive/expired offers' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type: offer or announcement' })
  @ApiResponse({ status: 200, description: 'List of offers' })
  findAll(
    @Query('all') all?: boolean,
    @Query('type') type?: string,
  ) {
    const onlyActive = all !== true && all !== ('true' as any);
    return this.offersService.findAll(onlyActive, type);
  }

  @Public()
  @Get('offers/summary')
  @ApiOperation({ summary: 'Retrieve summary counts for offers/announcements' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type: offer or announcement' })
  @ApiResponse({ status: 200, description: 'Summary counts' })
  getSummary(@Query('type') type?: string) {
    return this.offersService.getSummary(type);
  }

  @Public()
  @Get('offers/:id')
  @ApiOperation({ summary: 'Retrieve offer details by ID' })
  @ApiResponse({ status: 200, description: 'Offer details' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post('admin/offers')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new promotional offer or announcement (Admin)' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Put('admin/offers/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update promotional offer or announcement (Admin)' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @Patch('admin/offers/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Activate or deactivate offer (Admin)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  toggleStatus(
    @Param('id') id: string,
    @Body() dto: ToggleOfferStatusDto,
  ) {
    return this.offersService.toggleStatus(id, dto.isActive);
  }

  @Delete('admin/offers/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete promotional offer (Admin)' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  delete(@Param('id') id: string) {
    return this.offersService.delete(id);
  }
}
