import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleProductStatusDto {
  @ApiProperty({ example: true, description: 'Publish or unpublish product' })
  @IsNotEmpty()
  @IsBoolean()
  isPublished: boolean;
}
