import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { InventoryService } from './inventory.service';

import { CreateInventoryDto } from './dto/create-inventory.dto';

import { UpdateInventoryDto } from './dto/update-inventory.dto';


@Controller('inventory')
export class InventoryController {

  constructor(
    private readonly inventoryService: InventoryService,
  ) {}


  // ==========================================
  // CREATE
  // ==========================================

  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
  ) {

    return this.inventoryService.create(
      createInventoryDto,
    );

  }


  // ==========================================
  // READ ALL
  // ==========================================

  @Get()
  findAll() {

    return this.inventoryService.findAll();

  }


  // ==========================================
  // JOIN DETAILS
  // ==========================================

  @Get('details')
  findInventoryDetails() {

    return this.inventoryService.findInventoryDetails();

  }


  // ==========================================
  // UNION
  // ==========================================

  @Get('union')
  findInventoryUnion() {

    return this.inventoryService.findInventoryUnion();

  }


  // ==========================================
  // INTERSECT
  // ==========================================

  @Get('intersection')
  findInventoryIntersection() {

    return this.inventoryService.findInventoryIntersection();

  }


  // ==========================================
  // READ ONE
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {

    return this.inventoryService.findOne(id);

  }


  // ==========================================
  // UPDATE
  // ==========================================

  @Patch(':id')
  update(

    @Param('id', ParseIntPipe) id: number,

    @Body() updateInventoryDto: UpdateInventoryDto,

  ) {

    return this.inventoryService.update(
      id,
      updateInventoryDto,
    );

  }


  // ==========================================
  // DELETE
  // ==========================================

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {

    return this.inventoryService.remove(id);

  }

}