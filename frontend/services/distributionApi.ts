import type { Distribution, CreateDistributionPayload, UpdateDistributionPayload } from '@/types/distribution';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/distributions`;

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

export const distributionApi = {
  async getAll(): Promise<Distribution[]> {
    const raw = await request<Distribution[] | { value?: Distribution[] }>('');
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.value)) return raw.value;
    return [];
  },

  async getById(id: number): Promise<Distribution> {
    return request<Distribution>(`/${id}`);
  },

  async create(payload: CreateDistributionPayload): Promise<Distribution> {
    return request<Distribution>('', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(
    id: number,
    payload: UpdateDistributionPayload,
  ): Promise<Distribution> {
    return request<Distribution>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async remove(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    });
  },

  async getCoverage(): Promise<any[]> {
    return request<any[]>('/coverage');
  },

  async getOutstanding(): Promise<any[]> {
    return request<any[]>('/outstanding');
  },

  async getStatusUnion(): Promise<any[]> {
    return request<any[]>('/status-union');
  },

  async getOrganizationMatrix(): Promise<any[]> {
    return request<any[]>('/organization-match');
  },
};

export default distributionApi;
