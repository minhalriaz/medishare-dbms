import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRequestItemDto {
  @IsInt()
  @Min(1)
  request_id: number;

  @IsInt()
  @Min(1)
  medicine_id: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
