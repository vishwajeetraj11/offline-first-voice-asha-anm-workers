import Dexie, { type EntityTable } from "dexie";
import type {
  AudioChunk,
  Marker,
  Session,
  UploadQueueJob,
} from "@/types/domain";

export class AshaVoiceRegisterDB extends Dexie {
  sessions!: EntityTable<Session, "id">;
  markers!: EntityTable<Marker, "id">;
  audioChunks!: EntityTable<AudioChunk, "id">;
  uploadQueue!: EntityTable<UploadQueueJob, "id">;

  constructor() {
    super("asha-voice-register");

    this.version(1).stores({
      sessions: "id, workerId, status, syncStatus, startedAt",
      markers: "id, sessionId, [sessionId+sequenceNumber]",
      audioChunks: "id, sessionId, [sessionId+chunkIndex], uploaded",
      uploadQueue: "id, sessionId, status, nextRetryAt",
    });
  }
}

// A fresh Dexie instance can't be constructed during server-side rendering
// (no `indexedDB` global), so this module must only ever be imported from
// client components.
export const db = new AshaVoiceRegisterDB();
