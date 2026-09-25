import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDistributionDto {
  @IsInt()
  request_id: number;

  @IsInt()
  distributed_by_organization_id: number;

  @IsOptional()
  @IsDateString()
  distribution_date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  distribution_status?: string;

  @IsOptional()
  @IsString()
  received_by?: string;

  @IsOptional()
  @IsString()
  delivery_note?: string;
}
