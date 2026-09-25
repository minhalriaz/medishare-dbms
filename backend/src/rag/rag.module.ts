import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [TypeOrmModule],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
