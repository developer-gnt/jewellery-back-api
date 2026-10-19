import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreSettingsDto {
  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Store WhatsApp mobile phone number (digits only or formatted)',
  })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({
    example: '+91 98765 43210',
    description: 'Customer concierge support voice telephone line',
  })
  @IsOptional()
  @IsString()
  supportPhone?: string;

  @ApiPropertyOptional({
    example: 'concierge@zewarmahal.com',
    description: 'Store and concierge email contact address',
  })
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiPropertyOptional({
    example: 'Zewar Mahal Flagship Store, Bandra West, Mumbai',
    description: 'Physical flagship boutique address',
  })
  @IsOptional()
  @IsString()
  storeAddress?: string;

  @ApiPropertyOptional({
    example: 'Hello Zewar Mahal, I would like to inquire about jewellery pieces.',
    description: 'Default greeting message used when opening WhatsApp',
  })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;
}
