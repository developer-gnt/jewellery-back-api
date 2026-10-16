import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: '9876543210',
    description: '10-digit Indian mobile number',
  })
  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsString({ message: 'Mobile number must be a string' })
  @Matches(/^[0-9]{10}$/, {
    message: 'Mobile number must be a valid 10-digit mobile number',
  })
  mobile: string;
}
