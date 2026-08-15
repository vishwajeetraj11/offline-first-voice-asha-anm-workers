import { create } from "zustand";

export type RecordingState = "idle" | "recording" | "interrupted";

interface RecordingStoreState {
  recordingState: RecordingState;
  activeSessionId: string | null;
  sessionStartTimestamp: number | null;
  elapsedMs: number;
  markerCount: number;
  startRecording: (sessionId: string) => void;
  stopRecording: () => void;
  tickElapsed: (elapsedMs: number) => void;
  incrementMarkerCount: () => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingStoreState>((set) => ({
  recordingState: "idle",
  activeSessionId: null,
  sessionStartTimestamp: null,
  elapsedMs: 0,
  markerCount: 0,
  startRecording: (sessionId) =>
    set({
      recordingState: "recording",
      activeSessionId: sessionId,
      sessionStartTimestamp: Date.now(),
      elapsedMs: 0,
      markerCount: 0,
    }),
  stopRecording: () => set({ recordingState: "idle" }),
  tickElapsed: (elapsedMs) => set({ elapsedMs }),
  incrementMarkerCount: () =>
    set((state) => ({ markerCount: state.markerCount + 1 })),
  reset: () =>
    set({
      recordingState: "idle",
      activeSessionId: null,
      sessionStartTimestamp: null,
      elapsedMs: 0,
      markerCount: 0,
    }),
}));
