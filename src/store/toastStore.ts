import { create } from "zustand";

interface ToastState {
  message: string | null;
  show: (message: string) => void;
}

let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    if (hideTimeoutId) clearTimeout(hideTimeoutId);
    hideTimeoutId = setTimeout(() => set({ message: null }), 2000);
  },
}));
