import { Donation, CreateDonationDto, UpdateDonationDto } from '../types/donation';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API ${res.status}: ${error}`);
  }

  // DELETE returns 200 with no body
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// ─── Donation CRUD ────────────────────────────────────────────────────────────

export const api = {
  /** GET /donations — fetch all donations (with items) */
  async getDonations(): Promise<Donation[]> {
    return request<Donation[]>('/donations');
  },

  /** GET /donations/:id — fetch a single donation by numeric ID */
  async getDonationById(id: number | string): Promise<Donation> {
    return request<Donation>(`/donations/${id}`);
  },

  /** POST /donations — create a new donation */
  async createDonation(data: CreateDonationDto): Promise<Donation> {
    return request<Donation>('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** PATCH /donations/:id — update an existing donation */
  async updateDonation(
    id: number | string,
    data: UpdateDonationDto,
  ): Promise<Donation> {
    return request<Donation>(`/donations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** DELETE /donations/:id — delete a donation */
  async deleteDonation(id: number | string): Promise<void> {
    return request<void>(`/donations/${id}`, { method: 'DELETE' });
  },
};