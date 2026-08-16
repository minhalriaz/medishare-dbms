export class CreateInventoryDto {
  medicine_name!: string;
  batch_number!: string;
  quantity!: number;
  expiry_date!: string;
  status?: string;
}