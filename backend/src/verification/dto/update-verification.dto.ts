import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class UpdateVerificationDto {
  @IsOptional()
  @IsInt()
  donation_item_id?: number;

  @IsOptional()
  @IsInt()
  verified_by_user_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  verification_result?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  verification_remarks?: string;
}