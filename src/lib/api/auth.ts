import { apiClient } from "@/lib/api/client";
import type { LoginRequest, LoginResponse } from "@/types/api";

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", request, {
    authenticated: false,
  });
}
