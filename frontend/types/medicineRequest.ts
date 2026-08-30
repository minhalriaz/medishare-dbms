export interface MedicineRequestItem {
  request_item_id?: number;
  request_id?: number;
  medicine_id: number;
  quantity: number;
  notes?: string | null;
  medicine_name?: string;
  generic_name?: string;
  manufacturer?: string;
  dosage_form?: string;
  strength?: string;
}

export interface MedicineRequest {
  request_id: number;
  requester_user_id: number;
  requested_from_organization_id: number;
  priority_level: string;
  reason: string;
  request_status: string;
  request_date: string;
  requested_from_org?: string;
  requester_name?: string;
  total_requested_items?: number;
  request_items?: MedicineRequestItem[];
}

export interface CreateMedicineRequestItemPayload {
  medicine_id: number;
  quantity: number;
  notes?: string;
}

export interface CreateMedicineRequestPayload {
  requester_user_id: number;
  requested_from_organization_id: number;
  priority_level: string;
  reason: string;
  request_status?: string;
  request_date?: string;
  request_items: CreateMedicineRequestItemPayload[];
}

export type UpdateMedicineRequestPayload = Partial<CreateMedicineRequestPayload>;