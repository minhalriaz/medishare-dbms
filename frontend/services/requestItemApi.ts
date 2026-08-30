import { RequestItem, RequestItemOptions, RequestItemPayload } from '@/types/requestItem';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/request-items`;

async function call<T>(path = '', init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const text = await response.text();
  if (!response.ok) {
    let message = text || `Request failed (${response.status})`;
    try { message = JSON.parse(text).message ?? message; } catch {}
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const requestItemApi = {
  getAll: () => call<RequestItem[]>(),
  getOptions: () => call<RequestItemOptions>('/options'),
  getOne: (id: number) => call<RequestItem>(`/${id}`),
  create: (payload: RequestItemPayload) => call<RequestItem>('', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: RequestItemPayload) => call<RequestItem>(`/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: number) => call<{ message: string }>(`/${id}`, { method: 'DELETE' }),
};
