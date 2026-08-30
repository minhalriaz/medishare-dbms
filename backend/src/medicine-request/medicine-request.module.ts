import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineRequestController } from './medicine-request.controller';
import { MedicineRequestService } from './medicine-request.service';
import { MedicineRequest } from './entities/medicine-request.entity';
import { RequestItem } from './entities/request-item.entity';
import { Medicine } from '../medicine/entities/medicine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicineRequest, RequestItem, Medicine])],
  controllers: [MedicineRequestController],
  providers: [MedicineRequestService],
})
export class MedicineRequestModule {}
