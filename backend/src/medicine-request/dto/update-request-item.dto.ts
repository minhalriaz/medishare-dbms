import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRequestItemDto {
  @IsOptional()
  @IsInt()
  request_item_id?: number;

  @IsInt()
  @Min(1)
  medicine_id: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
