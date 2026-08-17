import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  @Min(1)
  organization_id!: number;

  @IsInt()
  @Min(1)
  donation_item_id!: number;

  @IsInt()
  @Min(0)
  received_quantity!: number;

  @IsInt()
  @Min(0)
  available_quantity!: number;

  @IsString()
  @IsNotEmpty()
  storage_location!: string;

  @IsOptional()
  @IsString()
  inventory_status?: string;
}