import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateRequestItemDto } from './create-request-item.dto';

export class CreateMedicineRequestDto {
  @IsInt()
  requester_user_id: number;

  @IsInt()
  requested_from_organization_id: number;

  @IsString()
  @IsNotEmpty()
  priority_level: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  request_status?: string;

  @IsOptional()
  @IsDateString()
  request_date?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  request_items?: CreateRequestItemDto[];
}
