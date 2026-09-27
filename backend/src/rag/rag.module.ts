import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { DatabaseModule } from '../database/database.module';
import { RagDataService } from './rag-data.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [TypeOrmModule, DatabaseModule, ReportsModule],
  controllers: [RagController],
  providers: [RagService, RagDataService],
  exports: [RagService],
})
export class RagModule {}
