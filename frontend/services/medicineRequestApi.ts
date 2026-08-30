import type {
  CreateMedicineRequestPayload,
  MedicineRequest,
  UpdateMedicineRequestPayload,
} from '@/types/medicineRequest';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/medicine-requests`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export const medicineRequestApi = {
  async getAll(): Promise<MedicineRequest[]> {
    const raw = await request<MedicineRequest[] | { value?: MedicineRequest[] }>('');
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.value)) return raw.value;
    return [];
  },

  async create(payload: CreateMedicineRequestPayload): Promise<MedicineRequest> {
    return request<MedicineRequest>('', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(
    id: number,
    payload: UpdateMedicineRequestPayload,
  ): Promise<MedicineRequest> {
    return request<MedicineRequest>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async remove(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    });
  },
};

export default medicineRequestApi;