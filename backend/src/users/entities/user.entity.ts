import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';


@Entity('user')
export class User {

  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  user_id!: number;


  @Column({
    name: 'full_name',
    length: 150,
  })
  full_name!: string;


  @Column({
    name: 'email',
    length: 150,
    unique: true,
  })
  email!: string;


  @Column({
    name: 'phone',
    length: 30,
    nullable: true,
  })
  phone?: string;


  @Column({
    name: 'address',
    length: 255,
    nullable: true,
  })
  address?: string;


  @Column({
    name: 'password_hash',
    length: 255,
  })
  password_hash!: string;


  @Column({
    name: 'user_type',
    length: 50,
  })
  user_type!: string;


  @Column({
    name: 'account_status',
    length: 50,
    default: 'Active',
  })
  account_status!: string;


  @CreateDateColumn({
    name: 'created_at',
  })
  created_at!: Date;
}