import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateMedicineRequestDto } from './create-medicine-request.dto';
import { UpdateRequestItemDto } from './update-request-item.dto';

export class UpdateMedicineRequestDto extends PartialType(CreateMedicineRequestDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRequestItemDto)
  request_items?: UpdateRequestItemDto[];
}
