import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { RequestItemService } from './request-item.service';

@Controller('request-items')
export class RequestItemController {
  constructor(private readonly service: RequestItemService) {}

  @Post()
  create(@Body() dto: CreateRequestItemDto) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('options')
  getFormOptions() { return this.service.getFormOptions(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRequestItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
