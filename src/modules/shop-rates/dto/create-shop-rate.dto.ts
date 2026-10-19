import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShopRateDto {
  @ApiProperty({ example: 'gold', description: 'Metal: gold, silver, platinum' })
  @IsNotEmpty()
  @IsString()
  metal: string;

  @ApiProperty({ example: '24K', description: 'Purity standard: 24K, 22K, 18K, 14K, 999, 925' })
  @IsNotEmpty()
  @IsString()
  purity: string;

  @ApiPropertyOptional({ example: 7520.0, description: 'Store rate per gram' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ratePerGram?: number;

  @ApiPropertyOptional({ example: 500.0, description: 'Base making charge per gram' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  makingChargePerGram?: number;

  @ApiPropertyOptional({ example: '999 Pure Investment Gold', description: 'Customer notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
