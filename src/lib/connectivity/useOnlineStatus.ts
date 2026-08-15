import { useEffect, useRef, useState } from "react";
import { canReachAppServer, CONNECTIVITY_CHANGE_EVENT } from "@/lib/connectivity/network";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  const lastResultRef = useRef(true);

  useEffect(() => {
    let isActive = true;

    const refresh = async () => {
      const reachable = await canReachAppServer();
      if (!isActive) return;
      setIsOnline(reachable);
      if (lastResultRef.current !== reachable) {
        lastResultRef.current = reachable;
        window.dispatchEvent(new CustomEvent(CONNECTIVITY_CHANGE_EVENT, { detail: { online: reachable } }));
      }
    };

    const handleConnectionChange = () => void refresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    void refresh();
    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(() => void refresh(), 15_000);

    return () => {
      isActive = false;
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}
