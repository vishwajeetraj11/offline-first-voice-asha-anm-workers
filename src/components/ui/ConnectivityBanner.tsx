"use client";

import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/lib/connectivity/useOnlineStatus";

export function ConnectivityBanner() {
  const isOnline = useOnlineStatus();
  const [justReconnected, setJustReconnected] = useState(false);
  const previousOnlineRef = useRef(isOnline);

  useEffect(() => {
    const wasOffline = !previousOnlineRef.current;
    previousOnlineRef.current = isOnline;
    if (!isOnline || !wasOffline) return;

    const showTimeoutId = setTimeout(() => setJustReconnected(true), 0);
    const hideTimeoutId = setTimeout(() => setJustReconnected(false), 4000);
    return () => {
      clearTimeout(showTimeoutId);
      clearTimeout(hideTimeoutId);
    };
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div data-connectivity-banner role="status" className="w-full bg-[#f4dba9] px-4 py-2.5 text-center text-sm font-semibold text-[#653f0e]">
        You&apos;re offline · recordings stay safe on this device
      </div>
    );
  }

  if (justReconnected) {
    return (
      <div data-connectivity-banner role="status" className="w-full bg-[#dceee7] px-4 py-2.5 text-center text-sm font-semibold text-[#0c5146]">
        Back online · sending saved recordings…
      </div>
    );
  }

  return null;
}
