import {
  CreateMedicinePayload,
  Medicine,
  MedicineAuditRecord,
  UpdateMedicinePayload,
} from '@/types/medicine';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (Array.isArray(body?.message)) {
        message = body.message.join(', ');
      } else if (typeof body?.message === 'string') {
        message = body.message;
      }
    } catch {
      // Keep generic HTTP error
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const medicineApi = {
  getAll: () => request<Medicine[]>('/medicine'),

  getById: (id: number) => request<Medicine>(`/medicine/${id}`),

  getAuditHistory: (medicineId?: number) => {
    const query = medicineId !== undefined ? `?medicine_id=${encodeURIComponent(String(medicineId))}` : '';
    return request<MedicineAuditRecord[]>(`/medicine/audit${query}`);
  },

  create: (payload: CreateMedicinePayload) =>
    request<Medicine>('/medicine', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateMedicinePayload) =>
    request<Medicine>(`/medicine/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    request<{ message: string }>(`/medicine/${id}`, {
      method: 'DELETE',
    }),
};
