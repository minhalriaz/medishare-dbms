import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateDonationItemDto {
  /** Present when updating an existing item; absent when adding a brand-new item */
  @IsOptional()
  @IsInt()
  donation_item_id?: number;

  @IsInt()
  medicine_id: number;

  @IsString()
  @IsNotEmpty()
  batch_number: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  manufacturing_date: string;

  @IsDateString()
  expiry_date: string;

  @IsString()
  @IsNotEmpty()
  packaging_condition: string;

  @IsString()
  @IsNotEmpty()
  storage_condition: string;
}
