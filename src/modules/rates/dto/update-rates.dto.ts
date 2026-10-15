import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRatesDto {
  @ApiProperty({ example: 7450.0, description: 'Gold 24 Karat rate per gram' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gold24K: number;

  @ApiProperty({ example: 6850.0, description: 'Gold 22 Karat rate per gram' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gold22K: number;

  @ApiProperty({ example: 92.5, description: 'Silver rate per gram' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  silver: number;

  @ApiPropertyOptional({ example: 'gram', description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: true, description: 'Enable manual override' })
  @IsOptional()
  @IsBoolean()
  isManualOverride?: boolean;
}
