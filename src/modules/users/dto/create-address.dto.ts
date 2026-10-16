import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: 'Flat 402, Royal Palms, Hill Road, Bandra West' })
  @IsNotEmpty()
  @IsString()
  addressLine: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '400050' })
  @IsNotEmpty()
  @IsString()
  pincode: string;

  @ApiPropertyOptional({ example: 'Sameer Shaikh' })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
