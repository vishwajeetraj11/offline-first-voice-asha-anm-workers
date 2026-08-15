import type { Worker } from "./domain";

export interface ApiErrorBody {
  error: string;
  message: string;
}

export interface LoginRequest {
  phoneNumber: string;
  pin: string;
}

export interface LoginResponse {
  token: string;
  worker: Worker;
}

export interface CreateSessionRequest {
  id: string;
  workerId: string;
  startedAt: string;
  deviceId: string;
}

export interface CreateSessionResponse {
  id: string;
  status: string;
  createdAt: string;
}

export interface EndSessionRequest {
  endedAt: string;
  totalDurationMs: number;
  markerCount: number;
}

export interface EndSessionResponse {
  id: string;
  status: string;
}

export interface MarkerPayload {
  id: string;
  offsetMs: number;
  capturedAt: string;
  sequenceNumber: number;
  source: string;
}

export interface UploadMarkersRequest {
  markers: MarkerPayload[];
}

export interface UploadMarkersResponse {
  accepted: number;
  markerIds: string[];
}

export interface UploadAudioChunkResponse {
  chunkIndex: number;
  received: boolean;
  sizeBytes?: number;
  duplicate?: boolean;
}

export interface FinalizeSessionRequest {
  totalChunks: number;
  totalDurationMs: number;
}

export interface FinalizeSessionResponse {
  id: string;
  processingStatus: string;
}

export interface SessionStatusResponse {
  id: string;
  uploadStatus: "complete" | "partial" | "not_started";
  receivedChunks: number;
  expectedChunks: number;
  processingStatus: "queued" | "processing" | "done" | "failed";
}
