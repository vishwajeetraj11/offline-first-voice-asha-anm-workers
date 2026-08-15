import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

export const CONNECTIVITY_CHANGE_EVENT = "asha:connectivity-change";

// navigator.onLine only reports whether the browser has a network interface;
// it can remain stale after Wi-Fi changes. Probe an uncached API endpoint so
// "online" means the app server is actually reachable.
export async function canReachAppServer(timeoutMs = 4_000): Promise<boolean> {
  if (typeof window === "undefined") return true;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}/auth/get-session`, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (response.status === 401 || response.status === 403) {
      useAuthStore.getState().markAuthExpired();
      return true;
    }
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
