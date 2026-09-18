import {
  Inventory,
  InventoryPayload,
  UpdateInventoryPayload,
} from '@/types/inventory';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');


async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },

      cache: 'no-store',
    },
  );


  if (!response.ok) {

    let message =
      `Request failed with status ${response.status}`;

    try {

      const body = await response.json();

      if (Array.isArray(body?.message)) {

        message = body.message.join(', ');

      } else if (
        typeof body?.message === 'string'
      ) {

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


export interface InventorySetResult {

  inventory_id: number;

  organization_id: number;

  donation_item_id: number;

  received_quantity: number;

  available_quantity: number;

  storage_location: string;

  inventory_status: string;

}

export interface InventoryDetailResult {
  organization_name: string;
  medicine_name: string;
  batch_number: string;
  received_quantity: number;
  available_quantity: number;
  storage_location: string;
}


export const inventoryApi = {

  // ==========================================
  // GET ALL
  // ==========================================

  getAll: () =>
    request<Inventory[]>('/inventory'),


  // ==========================================
  // GET BY ID
  // ==========================================

  getById: (id: number) =>
    request<Inventory>(
      `/inventory/${id}`,
    ),


  // ==========================================
  // JOIN DETAILS
  // ==========================================

  getDetails: () =>
    request<InventoryDetailResult[]>(
      '/inventory/details',
    ),


  // ==========================================
  // UNION
  // ==========================================

  getUnion: () =>
    request<InventorySetResult[]>(
      '/inventory/union',
    ),


  // ==========================================
  // INTERSECT
  // ==========================================

  getIntersection: () =>
    request<InventorySetResult[]>(
      '/inventory/intersection',
    ),


  // ==========================================
  // CREATE
  // ==========================================

  create: (
    payload: InventoryPayload,
  ) =>
    request<Inventory>(
      '/inventory',
      {
        method: 'POST',

        body: JSON.stringify(payload),
      },
    ),


  // ==========================================
  // UPDATE
  // ==========================================

  update: (
    id: number,
    payload: UpdateInventoryPayload,
  ) =>
    request<Inventory>(
      `/inventory/${id}`,
      {
        method: 'PATCH',

        body: JSON.stringify(payload),
      },
    ),


  // ==========================================
  // DELETE
  // ==========================================

  remove: (id: number) =>
    request<{ message: string }>(
      `/inventory/${id}`,
      {
        method: 'DELETE',
      },
    ),

};