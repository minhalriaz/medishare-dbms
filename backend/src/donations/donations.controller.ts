import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';

import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Controller('donations')
export class DonationsController {
    constructor(private readonly donationsService: DonationsService) { }

    @Post()
    create(@Body() createDonationDto: CreateDonationDto) {
        return this.donationsService.create(createDonationDto);
    }

    @Get()
    findAll() {
        return this.donationsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.donationsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDonationDto: UpdateDonationDto,
    ) {
        return this.donationsService.update(id, updateDonationDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.donationsService.remove(id);
    }
}
