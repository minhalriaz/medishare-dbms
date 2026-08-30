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
import { MedicineRequestService } from './medicine-request.service';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { UpdateMedicineRequestDto } from './dto/update-medicine-request.dto';

@Controller('medicine-requests')
export class MedicineRequestController {
  constructor(private readonly medicineRequestService: MedicineRequestService) {}

  @Post()
  create(@Body() createMedicineRequestDto: CreateMedicineRequestDto) {
    return this.medicineRequestService.create(createMedicineRequestDto);
  }

  @Get()
  findAll() {
    return this.medicineRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicineRequestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicineRequestDto: UpdateMedicineRequestDto,
  ) {
    return this.medicineRequestService.update(id, updateMedicineRequestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicineRequestService.remove(id);
  }
}
