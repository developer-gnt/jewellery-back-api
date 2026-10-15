import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleCategoryStatusDto {
  @ApiProperty({ example: true, description: 'Set active or inactive state' })
  @IsNotEmpty()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive: boolean;
}
