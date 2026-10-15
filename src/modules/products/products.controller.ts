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
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { AddProductImageDto } from './dto/add-image.dto.js';
import { ToggleProductStatusDto } from './dto/toggle-product-status.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ---------------------------------------------------------------------------
  // Public Catalogue Endpoints
  // ---------------------------------------------------------------------------

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Paginated catalogue with filters (category, metal, purity, price)' })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query, true);
  }

  @Public()
  @Get('products/search')
  @ApiOperation({ summary: 'Search products by name or keyword' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated search results' })
  search(
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.search(q, page, limit);
  }

  @Public()
  @Get('products/featured')
  @ApiOperation({ summary: 'Retrieve featured jewellery products' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max items to return' })
  @ApiResponse({ status: 200, description: 'List of featured products' })
  getFeatured(@Query('limit') limit?: number) {
    return this.productsService.getFeatured(limit ?? 10);
  }

  @Public()
  @Get('products/latest')
  @ApiOperation({ summary: 'Retrieve latest arrival products' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max items to return' })
  @ApiResponse({ status: 200, description: 'List of latest products' })
  getLatest(@Query('limit') limit?: number) {
    return this.productsService.getLatest(limit ?? 10);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Retrieve product details with full gallery and category' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ---------------------------------------------------------------------------
  // Admin Management Endpoints
  // ---------------------------------------------------------------------------

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new product (Admin)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid category or input' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put('admin/products/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update product details (Admin)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch('admin/products/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Publish or unpublish product (Admin)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  toggleStatus(
    @Param('id') id: string,
    @Body() dto: ToggleProductStatusDto,
  ) {
    return this.productsService.toggleStatus(id, dto.isPublished);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product and associated gallery images (Admin)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post('admin/products/:id/images')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add an image to product gallery (Admin)' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addImage(
    @Param('id') productId: string,
    @Body() dto: AddProductImageDto,
  ) {
    return this.productsService.addImage(productId, dto);
  }

  @Delete('admin/products/:id/images/:imageId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an image from product gallery (Admin)' })
  @ApiResponse({ status: 200, description: 'Image removed successfully' })
  @ApiResponse({ status: 404, description: 'Image or product not found' })
  removeImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.removeImage(productId, imageId);
  }
}
