export interface Medicine {
  medicine_id: number;
  medicine_name: string;
  generic_name?: string | null;
  manufacturer?: string | null;
  dosage_form?: string | null;
  strength?: string | null;
  medicine_category?: string | null;
  prescription_required: boolean;
}

export interface CreateMedicinePayload {
  medicine_name: string;
  generic_name?: string;
  manufacturer?: string;
  dosage_form?: string;
  strength?: string;
  medicine_category?: string;
  prescription_required?: boolean;
}

export type UpdateMedicinePayload = Partial<CreateMedicinePayload>;
