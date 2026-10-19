import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Royal Kundan Gold Choker', description: 'Name of the jewellery piece' })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'royal-kundan-gold-choker',
    description: 'Unique URL slug (auto-generated if omitted)',
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MaxLength(250, { message: 'Slug cannot exceed 250 characters' })
  slug?: string;

  @ApiPropertyOptional({
    example: 'ZM0001',
    description: 'Article Code (common sequence across all categories, e.g. ZM0001)',
  })
  @IsOptional()
  @IsString({ message: 'Article Code must be a string' })
  @MaxLength(50, { message: 'Article Code cannot exceed 50 characters' })
  sku?: string;

  @ApiPropertyOptional({
    example: 'Handmade 22K gold choker necklace with certified uncut polki diamonds.',
    description: 'Detailed description and craftmanship info',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: 145000.0, description: 'Price in INR' })
  @IsNotEmpty({ message: 'Price is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiPropertyOptional({ example: 'gold', description: 'Metal type: gold, silver, platinum' })
  @IsOptional()
  @IsString({ message: 'Metal must be a string' })
  metal?: string;

  @ApiPropertyOptional({ example: '22K', description: 'Purity standard: 24K, 22K, 18K, 925' })
  @IsOptional()
  @IsString({ message: 'Purity must be a string' })
  purity?: string;

  @ApiProperty({ example: 28.45, description: 'Gross weight in grams' })
  @IsNotEmpty({ message: 'Gross weight in grams is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(0.01, { message: 'Weight must be greater than 0' })
  weight: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Category UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @ApiPropertyOptional({ example: true, description: 'Published status for catalog' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Featured on homepage' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Latest arrivals flag' })
  @IsOptional()
  @IsBoolean()
  isLatest?: boolean;

  @ApiPropertyOptional({
    example: ['https://cdn.zewarmahal.com/products/choker-1.jpg'],
    description: 'Initial gallery image URLs',
  })
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];
}
