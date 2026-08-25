import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { CreateDonationItemDto } from './create-donation-item.dto';

export class CreateStandaloneDonationItemDto extends CreateDonationItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  donation_id: number;
}
