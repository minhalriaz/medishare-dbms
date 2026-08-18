export type InventoryStatus = 'Available' | 'Low Stock' | 'Out of Stock';

export interface Inventory {
  inventory_id: number;
  organization_id: number;
  donation_item_id: number;
  received_quantity: number;
  available_quantity: number;
  storage_location: string;
  inventory_status: string;
  added_date: string;
}

export interface InventoryPayload {
  organization_id: number;
  donation_item_id: number;
  received_quantity: number;
  available_quantity: number;
  storage_location: string;
  inventory_status: string;
}

export type UpdateInventoryPayload = Partial<InventoryPayload>;
