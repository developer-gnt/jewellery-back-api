import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsService } from './settings.service.js';
import { StoreSetting } from './entities/store-setting.entity.js';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockRepo: any;

  const mockSetting: StoreSetting = {
    id: 'setting-uuid-1',
    key: 'general',
    whatsappNumber: '9930942947',
    supportPhone: '+91 99309 42947',
    supportEmail: 'concierge@zewarmahal.com',
    storeAddress: 'Zewar Mahal Flagship Store, Bandra West, Mumbai',
    welcomeMessage: 'Hello Zewar Mahal, I would like to inquire about jewellery.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findOne: vi.fn().mockResolvedValue(mockSetting),
      create: vi.fn().mockImplementation((dto) => ({ ...dto, id: 'setting-uuid-1' })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    service = new SettingsService(mockRepo);
  });

  it('should return store settings', async () => {
    const settings = await service.getSettings();
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { key: 'general' } });
    expect(settings.whatsappNumber).toBe('9930942947');
  });

  it('should return public store settings with sanitized fields', async () => {
    const pub = await service.getPublicSettings();
    expect(pub.whatsappNumber).toBe('9930942947');
    expect(pub.supportPhone).toBe('+91 99309 42947');
  });

  it('should update store WhatsApp number and contacts', async () => {
    const updated = await service.updateSettings({
      whatsappNumber: '8795628359',
      supportPhone: '+91 87956 28359',
    });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(updated.whatsappNumber).toBe('8795628359');
  });
});
