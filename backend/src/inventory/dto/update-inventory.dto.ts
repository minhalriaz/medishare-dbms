import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  organization_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  donation_item_id?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  received_quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  available_quantity?: number;

  @IsOptional()
  @IsString()
  storage_location?: string;

  @IsOptional()
  @IsString()
  inventory_status?: string;
}