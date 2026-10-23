import type { Category } from './options';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type Requirement = {
  _id: string;
  category: Category;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
  status: string;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.fields);
  return body as T;
}

export function createRequirement(payload: unknown) {
  return request<{ data: Requirement }>('/api/requirements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listRequirements(params: { category?: Category; page?: number }) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.page) qs.set('page', String(params.page));
  return request<{ data: Requirement[]; total: number; page: number; limit: number }>(
    `/api/requirements?${qs}`,
  );
}
