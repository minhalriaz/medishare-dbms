import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationsService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    // CREATE
    async create(createDonationDto: CreateDonationDto): Promise<any> {
        const { donation_items, ...donationFields } = createDonationDto as any;

        const insertDonation = await this.dataSource.query(
            `INSERT INTO donation (donor_user_id, receiving_organization_id, donation_date, donation_status, donor_note)
             OUTPUT inserted.donation_id AS donation_id
             VALUES (@0, @1, @2, @3, @4)`,
            [
                donationFields.donor_user_id,
                donationFields.receiving_organization_id,
                donationFields.donation_date,
                donationFields.donation_status,
                donationFields.donor_note ?? null,
            ],
        );

        const donationId = insertDonation && insertDonation[0] && insertDonation[0].donation_id;

        if (donation_items && Array.isArray(donation_items) && donation_items.length > 0) {
            for (const item of donation_items) {
                await this.dataSource.query(
                    `INSERT INTO donation_item (donation_id, medicine_id, batch_number, quantity, manufacturing_date, expiry_date, packaging_condition, storage_condition)
                     VALUES (@0, @1, @2, @3, @4, @5, @6, @7)`,
                    [
                        donationId,
                        item.medicine_id,
                        item.batch_number,
                        item.quantity,
                        item.manufacturing_date,
                        item.expiry_date,
                        item.packaging_condition,
                        item.storage_condition,
                    ],
                );
            }
        }

        const donations = await this.dataSource.query('SELECT * FROM donation WHERE donation_id = @0', [donationId]);
        const items = await this.dataSource.query('SELECT * FROM donation_item WHERE donation_id = @0', [donationId]);

        const donation = donations[0];
        donation.donation_items = items;

        return donation;
    }

    // READ ALL
    async findAll(): Promise<any[]> {
        const donations = await this.dataSource.query('SELECT * FROM donation');

        const ids = donations.map((d: any) => d.donation_id);

        if (ids.length === 0) {
            return donations.map((d: any) => ({ ...d, donation_items: [] }));
        }

        const placeholders = ids.map((_: any, i: number) => `@${i}`).join(',');
        const items = await this.dataSource.query(
            `SELECT * FROM donation_item WHERE donation_id IN (${placeholders})`,
            ids,
        );

        const itemsByDonation: Record<number, any[]> = {};
        for (const item of items) {
            itemsByDonation[item.donation_id] = itemsByDonation[item.donation_id] || [];
            itemsByDonation[item.donation_id].push(item);
        }

        return donations.map((d: any) => ({ ...d, donation_items: itemsByDonation[d.donation_id] || [] }));
    }

    // READ ONE
    async findOne(id: number): Promise<any> {
        const donations = await this.dataSource.query('SELECT * FROM donation WHERE donation_id = @0', [id]);

        const donation = donations[0];

        if (!donation) {
            throw new NotFoundException(`Donation with ID ${id} not found`);
        }

        const items = await this.dataSource.query('SELECT * FROM donation_item WHERE donation_id = @0', [id]);
        donation.donation_items = items;

        return donation;
    }

    // UPDATE
    async update(id: number, updateDonationDto: UpdateDonationDto): Promise<any> {
        const existing = await this.dataSource.query('SELECT * FROM donation WHERE donation_id = @0', [id]);
        if (!existing || !existing[0]) {
            throw new NotFoundException(`Donation with ID ${id} not found`);
        }

        const { donation_items, ...scalarFields } = updateDonationDto as any;

        const setClauses: string[] = [];
        const params: any[] = [];

        for (const [key, value] of Object.entries(scalarFields)) {
            if (value !== undefined) {
                setClauses.push(`${key} = @${params.length}`);
                params.push(value);
            }
        }

        if (setClauses.length > 0) {
            const idIndex = params.length;
            params.push(id);
            await this.dataSource.query(`UPDATE donation SET ${setClauses.join(', ')} WHERE donation_id = @${idIndex}`, params);
        }

        if (donation_items !== undefined) {
            // Simplest approach: delete existing items and re-insert
            await this.dataSource.query('DELETE FROM donation_item WHERE donation_id = @0', [id]);

            for (const item of donation_items) {
                await this.dataSource.query(
                    `INSERT INTO donation_item (donation_id, medicine_id, batch_number, quantity, manufacturing_date, expiry_date, packaging_condition, storage_condition)
                     VALUES (@0, @1, @2, @3, @4, @5, @6, @7)`,
                    [
                        id,
                        item.medicine_id,
                        item.batch_number,
                        item.quantity,
                        item.manufacturing_date,
                        item.expiry_date,
                        item.packaging_condition,
                        item.storage_condition,
                    ],
                );
            }
        }

        return this.findOne(id);
    }

    // DELETE
    async remove(id: number): Promise<void> {
        const existing = await this.dataSource.query('SELECT * FROM donation WHERE donation_id = @0', [id]);
        if (!existing || !existing[0]) {
            throw new NotFoundException(`Donation with ID ${id} not found`);
        }

        await this.dataSource.query('DELETE FROM donation_item WHERE donation_id = @0', [id]);
        await this.dataSource.query('DELETE FROM donation WHERE donation_id = @0', [id]);
    }
}
