export interface Verification {
  verification_id: number;
  donation_item_id: number;
  verified_by_user_id: number;
  verification_date: string;
  verification_result: string;
  verification_remarks?: string;
}

export interface VerificationDetail {
  verification_id: number;
  donation_item_id: number;
  verified_by_user_id: number;
  verified_by: string;
  verifier_email: string;
  donation_id: number;
  medicine_id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  manufacturing_date: string;
  expiry_date: string;
  packaging_condition: string;
  storage_condition: string;
  donation_date: string;
  donation_status: string;
  receiving_organization_id: number;
  organization_name: string;
  verification_date: string;
  verification_result: string;
  verification_remarks?: string;
}

export interface VerificationPayload {
  donation_item_id: number;
  verified_by_user_id: number;
  verification_result: string;
  verification_remarks?: string;
}

export type UpdateVerificationPayload =
  Partial<VerificationPayload>;