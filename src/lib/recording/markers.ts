import { addMarker, countMarkers } from "@/lib/db/queries";
import type { Marker } from "@/types/domain";

export async function markHouseholdBoundary(
  sessionId: string,
  sessionStartTimestamp: number
): Promise<Marker> {
  const existingCount = await countMarkers(sessionId);
  const offsetMs = Date.now() - sessionStartTimestamp;

  const marker = await addMarker({
    sessionId,
    offsetMs,
    sequenceNumber: existingCount + 1,
  });

  if (navigator.vibrate) navigator.vibrate(50);

  return marker;
}
