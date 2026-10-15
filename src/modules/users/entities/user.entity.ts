import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface NotificationPreferences {
  offers?: boolean;
  rates?: boolean;
  enquiries?: boolean;
  general?: boolean;
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  mobile: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: () =>
      '\'{"offers":true,"rates":true,"enquiries":true,"general":true}\'',
  })
  notificationPreferences: NotificationPreferences | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
