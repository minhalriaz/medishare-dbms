export interface RequestItem {
  request_item_id: number;
  request_id: number;
  medicine_id: number;
  quantity: number;
  notes?: string | null;
  request_status?: string;
  priority_level?: string;
  medicine_name?: string;
  generic_name?: string;
  manufacturer?: string;
  dosage_form?: string;
  strength?: string;
}

export type RequestItemPayload = Pick<RequestItem, 'request_id' | 'medicine_id' | 'quantity'> & {
  notes?: string;
};

export interface RequestItemOptions {
  requests: Array<{
    request_id: number;
    request_status: string;
    priority_level: string;
  }>;
  medicines: Array<{
    medicine_id: number;
    medicine_name: string;
    generic_name?: string | null;
    strength?: string | null;
    dosage_form?: string | null;
  }>;
}
