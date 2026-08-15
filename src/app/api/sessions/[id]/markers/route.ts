import { NextResponse } from "next/server";
import { appQuery, withAppTransaction } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const { rows: [owned] } = await appQuery(
      "SELECT id FROM app_session WHERE id = $1 AND user_id = $2",
      [id, session.user.id],
    );
    if (!owned) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    const body = (await request.json()) as { markers: Array<{ id: string; offsetMs: number; capturedAt: string; sequenceNumber: number; source: string }> };
    const markers = body.markers || [];
    await withAppTransaction(async (client) => {
      for (const marker of markers) {
        await client.query(
          `INSERT INTO app_marker (id, session_id, offset_ms, captured_at, sequence_number, source)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [marker.id, id, marker.offsetMs, marker.capturedAt, marker.sequenceNumber, marker.source],
        );
      }
    });
    return NextResponse.json({ accepted: markers.length, markerIds: markers.map((marker) => marker.id) });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "marker_upload_failed", message: "Could not upload markers" }, { status: 500 });
  }
}
