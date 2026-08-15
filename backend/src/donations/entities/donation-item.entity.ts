import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Donation } from './donation.entity';

@Entity('donation_item')
export class DonationItem {
    @PrimaryGeneratedColumn({ name: 'donation_item_id' })
    donation_item_id: number;

    @Column({ name: 'donation_id' })
    donation_id: number;

    @Column({ name: 'medicine_id' })
    medicine_id: number;

    @Column({ name: 'batch_number', length: 100 })
    batch_number: string;

    @Column({ name: 'quantity' })
    quantity: number;

    @Column({ name: 'manufacturing_date', type: 'date' })
    manufacturing_date: Date;

    @Column({ name: 'expiry_date', type: 'date' })
    expiry_date: Date;

    @Column({ name: 'packaging_condition', length: 255 })
    packaging_condition: string;

    @Column({ name: 'storage_condition', length: 255 })
    storage_condition: string;

    @ManyToOne(() => Donation, (donation) => donation.donation_items)
    @JoinColumn({ name: 'donation_id' })
    donation: Donation;
}
