import {
  Verification,
  VerificationDetail,
  VerificationPayload,
  UpdateVerificationPayload,
} from '@/types/verification';

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

export const verificationApi = {

  // ==========================================
  // GET ALL
  // ==========================================

  getAll: () =>
    request<Verification[]>(
      '/verification',
    ),

  // ==========================================
  // GET BY ID
  // ==========================================

  getById: (id: number) =>
    request<Verification>(
      `/verification/${id}`,
    ),

  // ==========================================
  // VIEW DETAILS
  // ==========================================

  getDetails: () =>
    request<VerificationDetail[]>(
      '/verification/details',
    ),

  // ==========================================
  // STORED PROCEDURE
  // ==========================================

  getByResult: (result: string) =>
    request<VerificationDetail[]>(
      `/verification/result?result=${encodeURIComponent(result)}`,
    ),

  // ==========================================
  // CREATE
  // ==========================================

  create: (
    payload: VerificationPayload,
  ) =>
    request<Verification>(
      '/verification',
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
    payload: UpdateVerificationPayload,
  ) =>
    request<Verification>(
      `/verification/${id}`,
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
      `/verification/${id}`,
      {
        method: 'DELETE',
      },
    ),
};