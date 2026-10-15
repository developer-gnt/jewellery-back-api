import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne('User', 'notificationPreferences', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column({ type: 'boolean', default: true })
  offers: boolean;

  @Column({ type: 'boolean', default: true })
  rates: boolean;

  @Column({ type: 'boolean', default: true })
  enquiries: boolean;

  @Column({ type: 'boolean', default: true })
  general: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
