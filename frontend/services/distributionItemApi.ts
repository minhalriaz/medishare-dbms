import type { DistributionItem, DistributionItemOptions, DistributionItemPayload } from '@/types/distributionItem';
const base = `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/distribution-items`;
async function send<T>(path = '', init?: RequestInit): Promise<T> {
  const response = await fetch(base + path, { ...init, headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}
export const distributionItemApi = {
  all: () => send<DistributionItem[]>(),
  options: () => send<DistributionItemOptions>('/options'),
  create: (payload: DistributionItemPayload) => send<DistributionItem>('', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: DistributionItemPayload) => send<DistributionItem>(`/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: number) => send<{ message: string }>(`/${id}`, { method: 'DELETE' }),
};
