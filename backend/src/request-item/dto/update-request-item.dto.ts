import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestItemDto } from './create-request-item.dto';

export class UpdateRequestItemDto extends PartialType(CreateRequestItemDto) {}
