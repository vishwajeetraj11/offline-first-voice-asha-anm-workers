"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/lib/connectivity/useOnlineStatus";

export function ConnectivityBanner() {
  const isOnline = useOnlineStatus();
  const [justReconnected, setJustReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      return;
    }
    if (wasOffline) {
      setJustReconnected(true);
      setWasOffline(false);
      const timeoutId = setTimeout(() => setJustReconnected(false), 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="w-full bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
        Offline — recordings are saved on this device
      </div>
    );
  }

  if (justReconnected) {
    return (
      <div className="w-full bg-teal-100 px-4 py-2 text-center text-sm font-medium text-teal-900">
        Back online — syncing…
      </div>
    );
  }

  return null;
}
