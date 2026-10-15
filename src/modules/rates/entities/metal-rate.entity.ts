import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('metal_rates')
export class MetalRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  gold24K: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  gold22K: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  silver: number;

  @Column({ type: 'varchar', length: 20, default: 'gram' })
  unit: string;

  @Column({ type: 'boolean', default: false })
  isManualOverride: boolean;

  @Column({ type: 'varchar', length: 50, default: 'provider' })
  source: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
