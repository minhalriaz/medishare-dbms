import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MedicineRequest } from './medicine-request.entity';

@Entity('request_item')
export class RequestItem {
  @PrimaryGeneratedColumn({ name: 'request_item_id' })
  request_item_id: number;

  @Column({ name: 'request_id' })
  request_id: number;

  @Column({ name: 'medicine_id' })
  medicine_id: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @ManyToOne(() => MedicineRequest, (request) => request.request_items)
  @JoinColumn({ name: 'request_id' })
  request: MedicineRequest;
}
