import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { Medicine } from './entities/medicine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine])],
  controllers: [MedicineController],
  providers: [MedicineService],
})
export class MedicineModule {}
