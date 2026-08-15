import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { Worker } from "@/types/domain";

interface AuthState {
  token: string | null;
  worker: Worker | null;
  authExpired: boolean;
  login: (token: string, worker: Worker) => void;
  setWorker: (worker: Worker) => void;
  logout: () => void;
  markAuthExpired: () => void;
}

// zustand's `createJSONStorage(() => window.localStorage)` default calls
// `window.localStorage` eagerly at store-creation time; on the server that
// throws, which createJSONStorage swallows by returning `undefined`
// storage — and persist() then silently skips attaching `api.persist`
// entirely, breaking `useAuthStore.persist.hasHydrated()` everywhere.
// Returning this inert stand-in instead keeps `api.persist` real in every
// environment; skipHydration below ensures it's never actually read from
// on the server.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      worker: null,
      authExpired: false,
      login: (token, worker) => set({ token, worker, authExpired: false }),
      setWorker: (worker) => set({ worker, authExpired: false }),
      logout: () => set({ token: null, worker: null, authExpired: false }),
      markAuthExpired: () => set({ authExpired: true }),
    }),
    {
      name: "asha-voice-register:auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage
      ),
      // Auto-hydration is also skipped: it's triggered manually, client-side
      // only, from SyncEngineProvider (src/components/SyncEngineProvider.tsx).
      skipHydration: true,
    }
  )
);
