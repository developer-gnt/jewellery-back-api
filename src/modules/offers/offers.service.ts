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

  async findAll(onlyActive = true) {
    const qb = this.offerRepository.createQueryBuilder('offer');

    if (onlyActive) {
      const now = new Date();
      qb.where('offer.isActive = true')
        .andWhere('(offer.startDate IS NULL OR offer.startDate <= :now)', { now })
        .andWhere('(offer.endDate IS NULL OR offer.endDate >= :now)', { now });
    }

    qb.orderBy('offer.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const offer = await this.offerRepository.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }

    return offer;
  }

  async create(dto: CreateOfferDto) {
    const offer = this.offerRepository.create({
       ...dto,
       isActive: dto.isActive ?? true,
    });

    const saved = await this.offerRepository.save(offer);

    if (saved.isActive && this.notificationsService) {
      this.notificationsService
        .broadcast(
          'offers',
          `New Offer: ${saved.title}`,
          saved.description || `Special promotion code: ${saved.code}. Don't miss out!`,
          { offerId: saved.id, code: saved.code },
        )
        .catch(() => {});
    }

    return saved;
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.findOne(id);

    Object.assign(offer, dto);

    return this.offerRepository.save(offer);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const offer = await this.findOne(id);
    offer.isActive = isActive;
    const saved = await this.offerRepository.save(offer);

    if (isActive && this.notificationsService) {
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
