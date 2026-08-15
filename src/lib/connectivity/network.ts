import { API_BASE_URL } from "@/lib/constants";

export const CONNECTIVITY_CHANGE_EVENT = "asha:connectivity-change";

// navigator.onLine only reports whether the browser has a network interface;
// it can remain stale after Wi-Fi changes. Probe an uncached API endpoint so
// "online" means the app server is actually reachable.
export async function canReachAppServer(timeoutMs = 4_000): Promise<boolean> {
  if (typeof window === "undefined") return true;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(`${API_BASE_URL}/auth/get-session?connectivity=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
