import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Worker } from "@/types/domain";

interface AuthState {
  token: string | null;
  worker: Worker | null;
  authExpired: boolean;
  login: (token: string, worker: Worker) => void;
  logout: () => void;
  markAuthExpired: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      worker: null,
      authExpired: false,
      login: (token, worker) => set({ token, worker, authExpired: false }),
      logout: () => set({ token: null, worker: null, authExpired: false }),
      markAuthExpired: () => set({ authExpired: true }),
    }),
    { name: "asha-voice-register:auth" }
  )
);
