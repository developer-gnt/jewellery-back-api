import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminUserStatusDto {
  @ApiProperty({
    example: true,
    description: 'Set user active (true) or suspended/blocked (false)',
  })
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive: boolean;
}
