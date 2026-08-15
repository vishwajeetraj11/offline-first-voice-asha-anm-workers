import {
  addAudioChunk,
  checkpointSessionDuration,
} from "@/lib/db/queries";
import {
  CHECKPOINT_EVERY_N_CHUNKS,
  RECORDING_TIMESLICE_MS,
} from "@/lib/constants";

const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
];

export function getSupportedMimeType(): string {
  for (const mimeType of CANDIDATE_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
  }
  // Let the browser choose its default if none of our candidates match.
  return "";
}

export class ShiftRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private wakeLock: WakeLockSentinel | null = null;
  private chunkIndex = 0;
  private chunksSinceCheckpoint = 0;
  // MediaRecorder's "stop" event fires right after the final "dataavailable"
  // event, but that final chunk's IndexedDB write is async and not awaited
  // by the browser — without tracking it, stop() could resolve and the
  // upload queue could be enqueued before the last chunk is persisted.
  private pendingWrites: Promise<void>[] = [];

  constructor(
    private readonly sessionId: string,
    private readonly sessionStartTimestamp: number
  ) {}

  async start(): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mimeType = getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: 32_000,
    });

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size === 0) return;
      const writePromise = this.handleChunk(event.data);
      this.pendingWrites.push(writePromise);
    };

    this.mediaRecorder.start(RECORDING_TIMESLICE_MS);

    if ("wakeLock" in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request("screen");
      } catch {
        // Wake lock is best-effort — recording continues without it.
      }
    }
  }

  private async handleChunk(blob: Blob): Promise<void> {
    const startOffsetMs =
      this.chunkIndex * RECORDING_TIMESLICE_MS;

    await addAudioChunk({
      sessionId: this.sessionId,
      chunkIndex: this.chunkIndex,
      blob,
      mimeType: blob.type || "audio/webm",
      startOffsetMs,
    });

    this.chunkIndex += 1;
    this.chunksSinceCheckpoint += 1;

    if (this.chunksSinceCheckpoint >= CHECKPOINT_EVERY_N_CHUNKS) {
      this.chunksSinceCheckpoint = 0;
      await checkpointSessionDuration(
        this.sessionId,
        Date.now() - this.sessionStartTimestamp
      );
    }
  }

  async stop(): Promise<void> {
    const recorder = this.mediaRecorder;
    if (!recorder || recorder.state === "inactive") {
      await this.releaseResources();
      return;
    }

    await new Promise<void>((resolve) => {
      recorder.addEventListener(
        "stop",
        () => resolve(),
        { once: true }
      );
      recorder.stop();
    });

    // Flush any chunk writes still in flight (including the final one
    // triggered just before "stop") before the caller treats recording as
    // fully persisted.
    await Promise.all(this.pendingWrites);

    await this.releaseResources();
  }

  private async releaseResources(): Promise<void> {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;

    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {
        // Ignore — the lock is released implicitly on tab hide/close anyway.
      }
      this.wakeLock = null;
    }
  }

  getElapsedMs(): number {
    return Date.now() - this.sessionStartTimestamp;
  }
}
