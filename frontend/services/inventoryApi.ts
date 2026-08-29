import {
  Inventory,
  InventoryPayload,
  UpdateInventoryPayload,
} from '@/types/inventory';

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
      // Keep the generic HTTP error if the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const inventoryApi = {
  getAll: () => request<Inventory[]>('/inventory'),

  getById: (id: number) => request<Inventory>(`/inventory/${id}`),

  create: (payload: InventoryPayload) =>
    request<Inventory>('/inventory', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateInventoryPayload) =>
    request<Inventory>(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    request<{ message: string }>(`/inventory/${id}`, {
      method: 'DELETE',
    }),
};
