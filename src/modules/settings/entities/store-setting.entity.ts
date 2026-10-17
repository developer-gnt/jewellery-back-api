import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store_settings')
export class StoreSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, default: 'general' })
  key: string;

  @Column({ type: 'varchar', length: 50, default: '9930942947' })
  whatsappNumber: string;

  @Column({ type: 'varchar', length: 50, default: '+91 99309 42947' })
  supportPhone: string;

  @Column({ type: 'varchar', length: 100, default: 'concierge@zewarmahal.com' })
  supportEmail: string;

  @Column({
    type: 'text',
    default: 'Zewar Mahal Flagship Store, Bandra West, Mumbai, Maharashtra 400050',
  })
  storeAddress: string;

  @Column({
    type: 'text',
    default: 'Hello Zewar Mahal, I would like to inquire about fine jewellery pieces.',
  })
  welcomeMessage: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
