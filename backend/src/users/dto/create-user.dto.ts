import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {

@IsString()
full_name!: string;

@IsEmail()
email!: string;

@IsOptional()
@IsString()
phone?: string;

@IsOptional()
@IsString()
address?: string;

@IsString()
password_hash!: string;

@IsString()
user_type!: string;

@IsOptional()
@IsString()
account_status?: string;

}