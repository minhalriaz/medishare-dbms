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
import { DistributionService } from './distribution.service';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { UpdateDistributionDto } from './dto/update-distribution.dto';

@Controller('distributions')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Post()
  create(@Body() createDistributionDto: CreateDistributionDto) {
    return this.distributionService.create(createDistributionDto);
  }

  @Get()
  findAll() {
    return this.distributionService.findAll();
  }

  @Get('coverage')
  getDistributionCoverage() {
    return this.distributionService.getDistributionCoverage();
  }

  @Get('outstanding')
  getOutstandingRequests() {
    return this.distributionService.getOutstandingRequests();
  }

  @Get('status-union')
  getStatusUnion() {
    return this.distributionService.getStatusUnion();
  }

  @Get('organization-match')
  getOrganizationDistributionMatrix() {
    return this.distributionService.getOrganizationDistributionMatrix();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.distributionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistributionDto: UpdateDistributionDto,
  ) {
    return this.distributionService.update(id, updateDistributionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.distributionService.remove(id);
  }
}
