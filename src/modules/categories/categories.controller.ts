import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ToggleCategoryStatusDto } from './dto/toggle-status.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ---------------------------------------------------------------------------
  // Public Endpoints
  // ---------------------------------------------------------------------------

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Retrieve all active categories with product counts' })
  @ApiQuery({ name: 'all', required: false, type: Boolean, description: 'Include inactive categories if true' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll(@Query('all') all?: boolean) {
    const onlyActive = all !== true && all !== ('true' as any);
    return this.categoriesService.findAll(onlyActive);
  }

  @Public()
  @Get('categories/:id')
  @ApiOperation({ summary: 'Retrieve category details by ID with associated products' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // ---------------------------------------------------------------------------
  // Admin Endpoints
  // ---------------------------------------------------------------------------

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new category (Admin)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put('admin/categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an existing category (Admin)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Patch('admin/categories/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Activate or deactivate category (Admin)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  toggleStatus(
    @Param('id') id: string,
    @Body() dto: ToggleCategoryStatusDto,
  ) {
    return this.categoriesService.toggleStatus(id, dto.isActive);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category if no products linked (Admin)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Category has associated products' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
