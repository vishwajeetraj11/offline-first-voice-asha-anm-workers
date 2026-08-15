import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { ApiError, AuthExpiredError } from "@/lib/api/client";
import type { AudioChunk } from "@/types/domain";
import type { ApiErrorBody, UploadAudioChunkResponse } from "@/types/api";

// A 409 here means the backend already has this (sessionId, chunkIndex) pair
// from a prior attempt — that's a successful outcome for our idempotent
// retry logic, not an error, so it's handled separately from apiClient.
export async function uploadAudioChunkRemote(
  sessionId: string,
  chunk: AudioChunk
): Promise<UploadAudioChunkResponse> {
  const formData = new FormData();
  formData.append("chunkIndex", String(chunk.chunkIndex));
  formData.append("mimeType", chunk.mimeType);
  formData.append("startOffsetMs", String(chunk.startOffsetMs));
  formData.append("capturedAt", chunk.capturedAt);
  formData.append("file", chunk.blob, `${chunk.id}.webm`);

  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/audio-chunks`,
    { method: "POST", headers, body: formData }
  );

  if (response.status === 401) {
    useAuthStore.getState().markAuthExpired();
    const errorBody = await safeParseError(response);
    throw new AuthExpiredError(errorBody?.message ?? "Session expired");
  }

  if (response.ok || response.status === 409) {
    return (await response.json()) as UploadAudioChunkResponse;
  }

  const errorBody = await safeParseError(response);
  throw new ApiError(
    errorBody?.message ?? `Chunk upload failed with status ${response.status}`,
    response.status,
    errorBody?.error ?? "unknown_error"
  );
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
