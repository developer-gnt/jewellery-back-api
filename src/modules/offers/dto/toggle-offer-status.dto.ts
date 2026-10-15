import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleOfferStatusDto {
  @ApiProperty({ example: true, description: 'Activate or deactivate offer' })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
