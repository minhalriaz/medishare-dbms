import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateVerificationDto {
  @IsInt()
  donation_item_id!: number;

  @IsInt()
  verified_by_user_id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  verification_result!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  verification_remarks?: string;
}