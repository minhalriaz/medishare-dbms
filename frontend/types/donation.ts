// ─── Backend entity shapes (snake_case matches DB columns) ──────────────────

export interface DonationItem {
  donation_item_id?: number;
  donation_id?: number;
  medicine_id: number;
  batch_number: string;
  quantity: number;
  manufacturing_date: string; 
  expiry_date: string;        
  packaging_condition: string;
  storage_condition: string;
}

export interface Donation {
  donation_id: number;
  donor_user_id: number;
  receiving_organization_id: number;
  donation_date: string; // ISO date string "YYYY-MM-DD"
  donation_status: string;
  donor_note?: string;
  donation_items: DonationItem[];
}

// ─── DTOs sent to the backend ────────────────────────────────────────────────

export interface CreateDonationDto {
  donor_user_id: number;
  receiving_organization_id: number;
  donation_date: string;
  donation_status: string;
  donor_note?: string;
  donation_items: Omit<DonationItem, 'donation_item_id' | 'donation_id'>[];
}

export type UpdateDonationDto = Partial<CreateDonationDto>;