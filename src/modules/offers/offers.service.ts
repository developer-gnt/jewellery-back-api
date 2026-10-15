import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
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

    return this.offerRepository.save(offer);
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.findOne(id);

    Object.assign(offer, dto);

    return this.offerRepository.save(offer);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const offer = await this.findOne(id);
    offer.isActive = isActive;
    return this.offerRepository.save(offer);
  }

  async delete(id: string) {
    const offer = await this.findOne(id);
    await this.offerRepository.remove(offer);
    return { message: 'Offer deleted successfully' };
  }
}
