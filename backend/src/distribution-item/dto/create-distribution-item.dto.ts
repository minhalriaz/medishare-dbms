import { IsInt, Min } from 'class-validator';

export class CreateDistributionItemDto {
  @IsInt() @Min(1) distribution_id: number;
  @IsInt() @Min(1) inventory_id: number;
  @IsInt() @Min(1) distributed_quantity: number;
}
