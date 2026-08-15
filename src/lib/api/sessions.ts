import { apiClient } from "@/lib/api/client";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  EndSessionRequest,
  EndSessionResponse,
  FinalizeSessionRequest,
  FinalizeSessionResponse,
  SessionStatusResponse,
  UploadMarkersRequest,
  UploadMarkersResponse,
} from "@/types/api";

export function createSessionRemote(
  request: CreateSessionRequest
): Promise<CreateSessionResponse> {
  return apiClient.post<CreateSessionResponse>("/sessions", request);
}

export function endSessionRemote(
  sessionId: string,
  request: EndSessionRequest
): Promise<EndSessionResponse> {
  return apiClient.patch<EndSessionResponse>(
    `/sessions/${sessionId}/end`,
    request
  );
}

export function uploadMarkersRemote(
  sessionId: string,
  request: UploadMarkersRequest
): Promise<UploadMarkersResponse> {
  return apiClient.post<UploadMarkersResponse>(
    `/sessions/${sessionId}/markers`,
    request
  );
}

export function finalizeSessionRemote(
  sessionId: string,
  request: FinalizeSessionRequest
): Promise<FinalizeSessionResponse> {
  return apiClient.post<FinalizeSessionResponse>(
    `/sessions/${sessionId}/finalize`,
    request
  );
}

export function getSessionStatusRemote(
  sessionId: string
): Promise<SessionStatusResponse> {
  return apiClient.get<SessionStatusResponse>(`/sessions/${sessionId}/status`);
}

export function deleteSessionRemote(sessionId: string): Promise<void> {
  return apiClient.delete<void>(`/sessions/${sessionId}`);
}
