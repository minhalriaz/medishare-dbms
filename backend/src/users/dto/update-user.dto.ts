import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  password_hash?: string;

  @IsOptional()
  @IsString()
  user_type?: string;

  @IsOptional()
  @IsString()
  account_status?: string;

}