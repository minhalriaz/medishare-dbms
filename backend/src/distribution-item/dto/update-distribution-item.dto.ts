import { PartialType } from '@nestjs/mapped-types';
import { CreateDistributionItemDto } from './create-distribution-item.dto';
export class UpdateDistributionItemDto extends PartialType(CreateDistributionItemDto) {}
