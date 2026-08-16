import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicine')
export class Medicine {
    @PrimaryGeneratedColumn()
    medicine_id: number;

    @Column({ length: 150 })
    medicine_name: string;

    @Column({ length: 100, nullable: true })
    generic_name: string;

    @Column({ length: 100, nullable: true })
    manufacturer: string;

    @Column({ length: 100, nullable: true })
    dosage_form: string;

    @Column({ length: 100, nullable: true })
    strength: string;
}