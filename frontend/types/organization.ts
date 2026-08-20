export interface OrganizationDirectoryItem {
  organization_id: number;
  organization_name: string;
  organization_type: string;
  licence_number: string;
  organization_address: string | null;
  verification_status: string;

  user_id: number;
  representative_name: string;
  representative_email: string;
  representative_phone: string | null;
}

export interface OrganizationStatistics {
  organization_id: number;
  organization_name: string;
  organization_type: string;
  verification_status: string;

  total_inventory_records: number;
  total_received_quantity: string | number;
  total_available_quantity: string | number;
  average_available_quantity: string | number;
}

export interface InventoryOverviewItem {
  organization_id: number;
  organization_name: string;
  organization_type: string;

  inventory_id: number | null;
  received_quantity: number | null;
  available_quantity: number | null;
  storage_location: string | null;
  inventory_status: string | null;
}

export interface MedicineInventoryItem {
  organization_id: number;
  organization_name: string;
  organization_type: string;

  inventory_id: number;
  received_quantity: number;
  available_quantity: number;
  storage_location: string | null;
  inventory_status: string | null;

  donation_item_id: number;
  batch_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;

  medicine_id: number;
  medicine_name: string;
  generic_name: string | null;
  manufacturer: string | null;
  dosage_form: string | null;
  strength: string | null;
}

export interface UserOrganizationRelationship {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  account_status: string;

  organization_id: number | null;
  organization_name: string | null;
  organization_type: string | null;
  licence_number: string | null;
  verification_status: string | null;
}

export interface CompleteDirectoryItem {
  user_id: number | null;
  full_name: string | null;
  email: string | null;
  user_type: string | null;

  organization_id: number | null;
  organization_name: string | null;
  organization_type: string | null;
  verification_status: string | null;
}

export interface StockSummaryItem {
  organization_id: number;
  organization_name: string;
  organization_type: string;
  inventory_records?: number;
  total_available_quantity: string | number;
}

export interface OrganizationDetails {
  organization_id: number;
  user_id: number;

  organization_name: string;
  organization_type: string;
  licence_number: string;
  organization_address: string | null;
  verification_status: string;

  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
}