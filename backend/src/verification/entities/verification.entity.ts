import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('verification')
export class Verification {
  @PrimaryGeneratedColumn({
    name: 'verification_id',
  })
  verification_id!: number;

  @Column({
    name: 'donation_item_id',
    type: 'int',
  })
  donation_item_id!: number;

  @Column({
    name: 'verified_by_user_id',
    type: 'int',
  })
  verified_by_user_id!: number;

  @Column({
    name: 'verification_date',
    type: 'datetime2',
  })
  verification_date!: Date;

  @Column({
    name: 'verification_result',
    type: 'varchar',
    length: 50,
  })
  verification_result!: string;

  @Column({
    name: 'verification_remarks',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  verification_remarks?: string;
}