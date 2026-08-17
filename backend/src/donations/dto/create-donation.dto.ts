import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateDonationItemDto } from './create-donation-item.dto';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDonationItemDto)
  donation_items?: CreateDonationItemDto[];
}