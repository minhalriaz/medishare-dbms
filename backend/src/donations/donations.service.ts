import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Donation } from './entities/donation.entity';
import { DonationItem } from './entities/donation-item.entity';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationsService {
    constructor(
        @InjectRepository(Donation)
        private readonly donationRepository: Repository<Donation>,

        @InjectRepository(DonationItem)
        private readonly donationItemRepository: Repository<DonationItem>,
    ) { }

    // ─── CREATE ───────────────────────────────────────────────────────────────

    async create(createDonationDto: CreateDonationDto): Promise<Donation> {
        const donation = this.donationRepository.create(createDonationDto);
        return this.donationRepository.save(donation);
    }

    // ─── READ ALL ─────────────────────────────────────────────────────────────

    async findAll(): Promise<Donation[]> {
        return this.donationRepository.find({
            relations: { donation_items: true },
        });
    }

    // ─── READ ONE ─────────────────────────────────────────────────────────────

    async findOne(id: number): Promise<Donation> {
        const donation = await this.donationRepository.findOne({
            where: { donation_id: id },
            relations: { donation_items: true },
        });

        if (!donation) {
            throw new NotFoundException(`Donation with ID ${id} not found`);
        }

        return donation;
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    async update(id: number, updateDonationDto: UpdateDonationDto): Promise<Donation> {
        const donation = await this.findOne(id);

        // Separate items from scalar fields so we handle them explicitly
        const { donation_items, ...scalarFields } = updateDonationDto;

        // Update scalar fields on the existing entity
        Object.assign(donation, scalarFields);

        // Rebuild the items array if the frontend sent one
        if (donation_items !== undefined) {
            donation.donation_items = donation_items.map((itemDto) => {
                // Re-use existing entity instance if donation_item_id is provided,
                // otherwise create a fresh instance (TypeORM will INSERT it)
                const item = itemDto.donation_item_id
                    ? this.donationItemRepository.create({ donation_item_id: itemDto.donation_item_id })
                    : this.donationItemRepository.create();

                item.medicine_id          = itemDto.medicine_id;
                item.batch_number         = itemDto.batch_number;
                item.quantity             = itemDto.quantity;
                item.manufacturing_date   = itemDto.manufacturing_date as any;
                item.expiry_date          = itemDto.expiry_date as any;
                item.packaging_condition  = itemDto.packaging_condition;
                item.storage_condition    = itemDto.storage_condition;
                item.donation_id          = id;

                return item;
            });
        }

        return this.donationRepository.save(donation);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    async remove(id: number): Promise<void> {
        const donation = await this.findOne(id);
        await this.donationRepository.remove(donation);
    }
}
