import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequestItem } from './request-item.entity';

@Entity('medicine_request')
export class MedicineRequest {
  @PrimaryGeneratedColumn({ name: 'request_id' })
  request_id: number;

  @Column({ name: 'requester_user_id' })
  requester_user_id: number;

  @Column({ name: 'requested_from_organization_id' })
  requested_from_organization_id: number;

  @Column({ name: 'priority_level', length: 50 })
  priority_level: string;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'request_status', length: 50, default: 'Pending' })
  request_status: string;

  @Column({ name: 'request_date', type: 'datetime', default: () => 'GETDATE()' })
  request_date: Date;

  @OneToMany(() => RequestItem, (item) => item.request)
  request_items: RequestItem[];
}
