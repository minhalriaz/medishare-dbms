import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateDonationItemDto {
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
