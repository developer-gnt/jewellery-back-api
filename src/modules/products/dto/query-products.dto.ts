import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class QueryProductsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by category UUID' })
  @IsOptional()
  @IsUUID('4')
  category?: string;

  @ApiPropertyOptional({ example: 'gold', description: 'Filter by metal type' })
  @IsOptional()
  @IsString()
  metal?: string;

  @ApiPropertyOptional({ example: '22K', description: 'Filter by purity standard' })
  @IsOptional()
  @IsString()
  purity?: string;

  @ApiPropertyOptional({ example: 10000, description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 250000, description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: true, description: 'Filter featured items only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter latest items only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isLatest?: boolean;

  @ApiPropertyOptional({
    example: 'newest',
    enum: ['price_asc', 'price_desc', 'newest'],
    description: 'Sorting criteria',
  })
  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest'])
  sort?: 'price_asc' | 'price_desc' | 'newest';
}
