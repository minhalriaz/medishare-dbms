import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  medicine_name!: string;

  @Column()
  batch_number!: string;

  @Column()
  quantity!: number;

  @Column({ type: 'date' })
  expiry_date!: string;

  @Column({ default: 'Available' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}