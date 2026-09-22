import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  // ==========================================
  // CREATE
  // ==========================================

  @Post()
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicineService.create(createMedicineDto);
  }

  // ==========================================
  // READ ALL
  // ==========================================

  @Get()
  findAll() {
    return this.medicineService.findAll();
  }

  // ==========================================
  // READ AUDIT HISTORY
  // ==========================================

  @Get('audit')
  getAuditHistory(@Query('medicine_id') medicineId?: string) {
    const parsedMedicineId =
      medicineId === undefined || medicineId === null || medicineId === ''
        ? undefined
        : Number(medicineId);

    return this.medicineService.getAuditHistory(parsedMedicineId);
  }

  // ==========================================
  // READ ONE
  // ==========================================

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.findOne(id);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    return this.medicineService.update(id, updateMedicineDto);
  }

  // ==========================================
  // DELETE
  // ==========================================

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.remove(id);
  }
}
