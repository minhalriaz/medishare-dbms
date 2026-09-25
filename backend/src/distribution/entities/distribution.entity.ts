import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('distribution')
export class Distribution {
  @PrimaryGeneratedColumn({ name: 'distribution_id' })
  distribution_id: number;

  @Column({ name: 'request_id' })
  request_id: number;

  @Column({ name: 'distributed_by_organization_id' })
  distributed_by_organization_id: number;

  @Column({ name: 'distribution_date', type: 'datetime', default: () => 'GETDATE()' })
  distribution_date: Date;

  @Column({ name: 'distribution_status', length: 50, default: 'Pending' })
  distribution_status: string;

  @Column({ name: 'received_by', length: 150, nullable: true })
  received_by?: string | null;

  @Column({ name: 'delivery_note', type: 'text', nullable: true })
  delivery_note?: string | null;
}
