import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { DonationItem } from './donation-item.entity';

@Entity('donation')
export class Donation {
    @PrimaryGeneratedColumn({ name: 'donation_id' })
    donation_id: number;

    @Column({ name: 'donor_user_id' })
    donor_user_id: number;

    @Column({ name: 'receiving_organization_id' })
    receiving_organization_id: number;

    @Column({ name: 'donation_date', type: 'date' })
    donation_date: Date;

    @Column({ name: 'donation_status', length: 50 })
    donation_status: string;

    @Column({ name: 'donor_note', type: 'text', nullable: true })
    donor_note: string;

    
    @OneToMany(() => DonationItem, (item) => item.donation, { cascade: true })
    donation_items: DonationItem[];
}