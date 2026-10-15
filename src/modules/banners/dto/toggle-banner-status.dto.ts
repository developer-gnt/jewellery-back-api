import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleBannerStatusDto {
  @ApiProperty({ example: true, description: 'Activate or deactivate banner' })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
