import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
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

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  @Length(4, 6, { message: 'OTP must be between 4 and 6 characters' })
  otp: string;
}
