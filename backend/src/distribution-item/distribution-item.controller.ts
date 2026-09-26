import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { DistributionItemService } from './distribution-item.service';
import { CreateDistributionItemDto } from './dto/create-distribution-item.dto';
import { UpdateDistributionItemDto } from './dto/update-distribution-item.dto';

@Controller('distribution-items')
export class DistributionItemController {
  constructor(private readonly items: DistributionItemService) {}
  @Get('options') options() { return this.items.options(); }
  @Get() all() { return this.items.all(); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.items.one(id); }
  @Post() create(@Body() dto: CreateDistributionItemDto) { return this.items.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDistributionItemDto) { return this.items.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.items.remove(id); }
}
