import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthExpiredError extends ApiError {
  constructor(message: string) {
    super(message, 401, "auth_expired");
    this.name = "AuthExpiredError";
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
  authenticated?: boolean;
}

async function request<T>(
  path: string,
  { method = "GET", body, isFormData = false, authenticated = true }: RequestOptions = {}
): Promise<T> {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";

  if (authenticated) {
    const token = useAuthStore.getState().token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    useAuthStore.getState().markAuthExpired();
    const errorBody = await safeParseError(response);
    throw new AuthExpiredError(errorBody?.message ?? "Session expired");
  }

  if (!response.ok) {
    const errorBody = await safeParseError(response);
    throw new ApiError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.error ?? "unknown_error"
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function safeParseError(
  response: Response
): Promise<ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Partial<RequestOptions>) =>
    request<T>(path, { method: "POST", body, ...options }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
