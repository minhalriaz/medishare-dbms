import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDonationDto {
  @IsInt()
  donor_user_id: number;

  @IsInt()
  receiving_organization_id: number;

  @IsDateString()
  donation_date: string;

  @IsString()
  @IsNotEmpty()
  donation_status: string;

  @IsOptional()
  @IsString()
  donor_note?: string;
}