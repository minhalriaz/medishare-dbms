import { Module } from '@nestjs/common';
import { DistributionItemController } from './distribution-item.controller';
import { DistributionItemService } from './distribution-item.service';
@Module({ controllers: [DistributionItemController], providers: [DistributionItemService] })
export class DistributionItemModule {}
