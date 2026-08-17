import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateDonationDto } from './create-donation.dto';
import { UpdateDonationItemDto } from './update-donation-item.dto';

export class UpdateDonationDto extends PartialType(CreateDonationDto) {
  /**
   * Override the inherited donation_items so that each item is validated
   * against UpdateDonationItemDto (which allows donation_item_id) rather
   * than CreateDonationItemDto (which forbids it).
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDonationItemDto)
  donation_items?: UpdateDonationItemDto[];
}