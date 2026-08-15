import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Donation } from './entities/donation.entity';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationsService {
    constructor(
        @InjectRepository(Donation)
        private readonly donationRepository: Repository<Donation>,
    ) { }

    // CREATE
    async create(createDonationDto: CreateDonationDto): Promise<Donation> {
        const donation = this.donationRepository.create(createDonationDto);

        return this.donationRepository.save(donation);
    }

    // READ ALL
    async findAll(): Promise<Donation[]> {
        return this.donationRepository.find({
            relations: {
                donation_items: true,
            },
        });
    }

    // READ ONE
    async findOne(id: number): Promise<Donation> {
        const donation = await this.donationRepository.findOne({
            where: { donation_id: id },
            relations: {
                donation_items: true,
            },
        });

        if (!donation) {
            throw new NotFoundException(`Donation with ID ${id} not found`);
        }

        return donation;
    }

    // UPDATE
    async update(
        id: number,
        updateDonationDto: UpdateDonationDto,
    ): Promise<Donation> {
        const donation = await this.findOne(id);

        Object.assign(donation, updateDonationDto);

        return this.donationRepository.save(donation);
    }

    // DELETE
    async remove(id: number): Promise<void> {
        const donation = await this.findOne(id);

        await this.donationRepository.remove(donation);
    }
}
