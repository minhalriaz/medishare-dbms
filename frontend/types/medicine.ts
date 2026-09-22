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

export interface MedicineAuditRecord {
  audit_id: number;
  medicine_id: number;
  action_type: string;
  changed_at: string | Date | null;
  changed_by: string | null;
  medicine_name_old: string | null;
  medicine_name_new: string | null;
  generic_name_old: string | null;
  generic_name_new: string | null;
  manufacturer_old: string | null;
  manufacturer_new: string | null;
  dosage_form_old: string | null;
  dosage_form_new: string | null;
  strength_old: string | null;
  strength_new: string | null;
  medicine_category_old: string | null;
  medicine_category_new: string | null;
  prescription_required_old: boolean | null;
  prescription_required_new: boolean | null;
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
