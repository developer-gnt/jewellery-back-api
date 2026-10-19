import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSetting } from './entities/store-setting.entity.js';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto.js';

export interface PublicStoreSettings {
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  storeAddress: string;
  welcomeMessage: string;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(StoreSetting)
    private readonly settingsRepo: Repository<StoreSetting>,
  ) {}

  /**
   * Fetch the active store settings row (key = 'general'),
   * or initialize with defaults if not yet created.
   */
  async getSettings(): Promise<StoreSetting> {
    let setting = await this.settingsRepo.findOne({
      where: { key: 'general' },
    });

    if (!setting) {
      setting = this.settingsRepo.create({
        key: 'general',
        whatsappNumber: '9930942947',
        supportPhone: '+91 99309 42947',
        supportEmail: 'concierge@zewarmahal.com',
        storeAddress:
          'Zewar Mahal Flagship Store, Bandra West, Mumbai, Maharashtra 400050',
        welcomeMessage:
          'Hello Zewar Mahal, I would like to inquire about fine jewellery pieces.',
      });
      setting = await this.settingsRepo.save(setting);
      this.logger.log('Initialized default store settings in database.');
    }

    return setting;
  }

  /**
   * Return sanitized public store settings for customer apps.
   */
  async getPublicSettings(): Promise<PublicStoreSettings> {
    const setting = await this.getSettings();
    return {
      whatsappNumber: setting.whatsappNumber,
      supportPhone: setting.supportPhone,
      supportEmail: setting.supportEmail,
      storeAddress: setting.storeAddress,
      welcomeMessage: setting.welcomeMessage,
    };
  }

  /**
   * Return WhatsApp contact info specifically.
   */
  async getWhatsAppInfo(): Promise<{ whatsappNumber: string; welcomeMessage: string }> {
    const setting = await this.getSettings();
    return {
      whatsappNumber: setting.whatsappNumber,
      welcomeMessage: setting.welcomeMessage,
    };
  }

  /**
   * Admin: Update store settings (WhatsApp number, contacts, address).
   */
  async updateSettings(dto: UpdateStoreSettingsDto): Promise<StoreSetting> {
    let setting = await this.getSettings();

    if (dto.whatsappNumber !== undefined) {
      const raw = dto.whatsappNumber.trim();
      const digits = raw.replace(/\D/g, '');
      const clean10 = digits.length === 12 && digits.startsWith('91')
        ? digits.slice(2)
        : (digits.length >= 10 ? digits.slice(-10) : digits);
      setting.whatsappNumber = clean10 || raw;
    }
    if (dto.supportPhone !== undefined) {
      setting.supportPhone = dto.supportPhone.trim();
    }
    if (dto.supportEmail !== undefined) {
      setting.supportEmail = dto.supportEmail.trim();
    }
    if (dto.storeAddress !== undefined) {
      setting.storeAddress = dto.storeAddress.trim();
    }
    if (dto.welcomeMessage !== undefined) {
      setting.welcomeMessage = dto.welcomeMessage.trim();
    }

    const updated = await this.settingsRepo.save(setting);
    this.logger.log(`Store settings updated. Active WhatsApp: ${updated.whatsappNumber}`);
    return updated;
  }
}
