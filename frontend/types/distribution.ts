export interface Distribution {
  distribution_id: number;
  request_id: number;
  distributed_by_organization_id: number;
  distribution_date?: string | null;
  distribution_status: string;
  received_by?: string | null;
  delivery_note?: string | null;
  request_status?: string;
  priority_level?: string;
  reason?: string;
  requested_from_organization_name?: string;
  distributed_by_organization_name?: string;
}

export interface CreateDistributionPayload {
  request_id: number;
  distributed_by_organization_id: number;
  distribution_date?: string;
  distribution_status?: string;
  received_by?: string;
  delivery_note?: string;
}

export type UpdateDistributionPayload = Partial<CreateDistributionPayload>;
