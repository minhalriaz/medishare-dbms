import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medicine } from './entities/medicine.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Medicine]),
    ],
    exports: [
        TypeOrmModule,
    ],
})
export class MedicineModule {}
