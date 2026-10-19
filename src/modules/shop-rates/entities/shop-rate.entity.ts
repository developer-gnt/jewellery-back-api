import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Index('UQ_shop_rates_metal_purity_active', ['metal', 'purity', 'isActive'], { unique: true })
@Entity('shop_rates')
export class ShopRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, default: 'gold' })
  metal: string;

  @Index()
  @Column({ type: 'varchar', length: 30, default: '22K' })
  purity: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  ratePerGram: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  makingChargePerGram: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
