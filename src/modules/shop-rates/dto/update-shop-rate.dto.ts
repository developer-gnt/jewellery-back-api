import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateShopRateDto {
  @ApiProperty({ example: 'gold', description: 'Metal: gold, silver, etc.' })
  @IsNotEmpty()
  @IsString()
  metal: string;

  @ApiProperty({ example: '22K', description: 'Purity standard: 24K, 22K, 18K, 925' })
  @IsNotEmpty()
  @IsString()
  purity: string;

  @ApiProperty({ example: 6920.0, description: 'Store rate per gram' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ratePerGram: number;

  @ApiPropertyOptional({ example: 450.0, description: 'Base making charge per gram' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  makingChargePerGram?: number;

  @ApiPropertyOptional({ example: 'Hallmarked 916 gold with hallmark certification', description: 'Customer notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkUpdateShopRatesDto {
  @ApiProperty({ type: [UpdateShopRateDto] })
  rates: UpdateShopRateDto[];
}
