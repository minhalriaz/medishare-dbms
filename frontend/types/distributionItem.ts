export interface DistributionItem {
  distribution_item_id: number;
  distribution_id: number;
  inventory_id: number;
  distributed_quantity: number;
  request_id: number;
  distribution_status: string;
  organization_id: number;
  available_quantity: number;
  medicine_name: string;
  strength?: string;
  batch_number?: string;
}
export interface DistributionItemPayload {
  distribution_id: number;
  inventory_id: number;
  distributed_quantity: number;
}
export interface DistributionItemOptions {
  distributions: { distribution_id: number; request_id: number; distributed_by_organization_id: number }[];
  inventory: { inventory_id: number; organization_id: number; available_quantity: number; medicine_name: string; strength?: string; batch_number?: string }[];
}
