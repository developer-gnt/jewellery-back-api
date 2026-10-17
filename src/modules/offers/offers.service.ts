import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  async findAll(onlyActive = true, type?: string) {
    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.category', 'category');

    if (onlyActive) {
      const now = new Date();
      qb.where('offer.isActive = true')
        .andWhere('offer.isDraft = false')
        .andWhere('(offer.startDate IS NULL OR offer.startDate <= :now)', { now })
        .andWhere('(offer.endDate IS NULL OR offer.endDate >= :now)', { now });
    }

    if (type) {
      qb.andWhere('offer.type = :type', { type });
    }

    qb.orderBy('offer.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.category', 'category')
      .where('offer.id = :id', { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }

    return offer;
  }

  async getSummary(type?: string) {
    const now = new Date();

    const qb = this.offerRepository.createQueryBuilder('offer');
    if (type) {
      qb.where('offer.type = :type', { type });
    }

    const allRecords = await qb.getMany();

    let total = allRecords.length;
    let active = 0;
    let upcoming = 0;
    let expired = 0;
    let draft = 0;

    for (const record of allRecords) {
      if (record.isDraft) {
        draft++;
        continue;
      }

      const start = record.startDate ? new Date(record.startDate) : null;
      const end = record.endDate ? new Date(record.endDate) : null;

      if (end && end < now) {
        expired++;
      } else if (start && start > now) {
        upcoming++;
      } else if (record.isActive) {
        active++;
      }
    }

    return {
      total,
      active,
      upcoming,
      expired,
      draft,
    };
  }

  async create(dto: CreateOfferDto) {
    const offer = this.offerRepository.create({
      ...dto,
      type: dto.type || 'offer',
      isDraft: dto.isDraft ?? false,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.offerRepository.save(offer);

    if (!saved.isDraft && saved.isActive && this.notificationsService) {
      this.notificationsService
        .broadcast(
          'offers',
          `New Offer: ${saved.title}`,
          saved.description || `Special promotion code: ${saved.code}. Don't miss out!`,
          { offerId: saved.id, code: saved.code },
        )
        .catch(() => {});
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.findOne(id);

    Object.assign(offer, dto);

    await this.offerRepository.save(offer);
    return this.findOne(id);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const offer = await this.findOne(id);
    offer.isActive = isActive;
    const saved = await this.offerRepository.save(offer);

    if (!saved.isDraft && isActive && this.notificationsService) {
      this.notificationsService
        .broadcast(
          'offers',
          `Offer Active: ${saved.title}`,
          saved.description || `Exclusive deal is now active: ${saved.code}!`,
          { offerId: saved.id, code: saved.code },
        )
        .catch(() => {});
    }

    return saved;
  }

  async delete(id: string) {
    const offer = await this.findOne(id);
    await this.offerRepository.remove(offer);
    return { message: 'Offer deleted successfully' };
  }
}
