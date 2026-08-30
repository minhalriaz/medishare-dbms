import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RequestItemController } from './request-item.controller';
import { RequestItemService } from './request-item.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RequestItemController],
  providers: [RequestItemService],
})
export class RequestItemModule {}
