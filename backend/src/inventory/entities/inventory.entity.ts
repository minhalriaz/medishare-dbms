import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn({ name: 'inventory_id' })
  inventory_id!: number;

  @Column({ name: 'organization_id' })
  organization_id!: number;

  @Column({ name: 'donation_item_id', unique: true })
  donation_item_id!: number;

  @Column({ name: 'received_quantity' })
  received_quantity!: number;

  @Column({ name: 'available_quantity' })
  available_quantity!: number;

  @Column({ name: 'storage_location', length: 255 })
  storage_location!: string;

  @Column({
    name: 'inventory_status',
    length: 50,
    default: 'Available',
  })
  inventory_status!: string;

  @CreateDateColumn({ name: 'added_date' })
  added_date!: Date;
}