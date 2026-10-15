import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopRate } from './entities/shop-rate.entity.js';
import { UpdateShopRateDto } from './dto/update-shop-rate.dto.js';

@Injectable()
export class ShopRatesService {
  constructor(
    @InjectRepository(ShopRate)
    private readonly shopRateRepository: Repository<ShopRate>,
  ) {}

  async getShopRates() {
    let rates = await this.shopRateRepository.find({
      where: { isActive: true },
      order: { metal: 'ASC', purity: 'DESC' },
    });

    // Seed defaults if empty
    if (rates.length === 0) {
      const defaults = [
        {
          metal: 'gold',
          purity: '24K',
          ratePerGram: 7520.0,
          makingChargePerGram: 500.0,
          notes: '999 Pure Investment Gold',
        },
        {
          metal: 'gold',
          purity: '22K',
          ratePerGram: 6920.0,
          makingChargePerGram: 450.0,
          notes: '916 BIS Hallmarked Jewellery Gold',
        },
        {
          metal: 'gold',
          purity: '18K',
          ratePerGram: 5750.0,
          makingChargePerGram: 400.0,
          notes: '750 Hallmarked Diamond Jewellery Gold',
        },
        {
          metal: 'silver',
          purity: '925',
          ratePerGram: 94.0,
          makingChargePerGram: 50.0,
          notes: 'Sterling Silver 92.5%',
        },
      ];

      const entities = defaults.map((d) => this.shopRateRepository.create(d));
      rates = await this.shopRateRepository.save(entities);
    }

    return rates.map((r) => ({
      id: r.id,
      metal: r.metal,
      purity: r.purity,
      ratePerGram: Number(r.ratePerGram),
      makingChargePerGram: r.makingChargePerGram
        ? Number(r.makingChargePerGram)
        : null,
      notes: r.notes,
      updatedAt: r.updatedAt,
    }));
  }

  async updateShopRates(ratesDto: UpdateShopRateDto[]) {
    const updatedRates: ShopRate[] = [];

    for (const dto of ratesDto) {
      let rate = await this.shopRateRepository.findOne({
        where: {
          metal: dto.metal.toLowerCase(),
          purity: dto.purity.toUpperCase(),
        },
      });

      if (!rate) {
        rate = this.shopRateRepository.create({
          metal: dto.metal.toLowerCase(),
          purity: dto.purity.toUpperCase(),
          ratePerGram: dto.ratePerGram,
          makingChargePerGram: dto.makingChargePerGram ?? null,
          notes: dto.notes ?? null,
          isActive: true,
        });
      } else {
        rate.ratePerGram = dto.ratePerGram;
        if (dto.makingChargePerGram !== undefined) {
          rate.makingChargePerGram = dto.makingChargePerGram;
        }
        if (dto.notes !== undefined) {
          rate.notes = dto.notes;
        }
        rate.isActive = true;
      }

      const saved = await this.shopRateRepository.save(rate);
      updatedRates.push(saved);
    }

    return {
      message: 'Shop rates updated successfully',
      rates: updatedRates.map((r) => ({
        id: r.id,
        metal: r.metal,
        purity: r.purity,
        ratePerGram: Number(r.ratePerGram),
        makingChargePerGram: r.makingChargePerGram
          ? Number(r.makingChargePerGram)
          : null,
        notes: r.notes,
        updatedAt: r.updatedAt,
      })),
    };
  }

  async getShareCard() {
    const rates = await this.getShopRates();
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let messageText = `✨ *ZEWAR MAHAL — TODAY'S RATES* ✨\n📅 Date: ${today}\n\n`;

    for (const r of rates) {
      messageText += `🔹 *${r.metal.toUpperCase()} ${r.purity}*: ₹${r.ratePerGram}/gm\n`;
    }

    messageText += `\n📍 Visit: Zewar Mahal Jewellers\n📞 Call/WhatsApp: +91 98765 43210\n⚡ Rates subject to market variation.`;

    return {
      storeName: 'Zewar Mahal',
      date: today,
      rates,
      shareText: messageText,
    };
  }
}
