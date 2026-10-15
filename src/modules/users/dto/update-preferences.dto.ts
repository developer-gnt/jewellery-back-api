import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Receive exclusive offers and promotional notifications',
  })
  @IsOptional()
  @IsBoolean({ message: 'offers must be a boolean value' })
  offers?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive real-time gold and silver rate update alerts',
  })
  @IsOptional()
  @IsBoolean({ message: 'rates must be a boolean value' })
  rates?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive status updates on submitted product enquiries',
  })
  @IsOptional()
  @IsBoolean({ message: 'enquiries must be a boolean value' })
  enquiries?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive general announcements and store updates',
  })
  @IsOptional()
  @IsBoolean({ message: 'general must be a boolean value' })
  general?: boolean;
}
