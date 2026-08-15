import { NextResponse } from "next/server";
import { appDb } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const owned = appDb.prepare("SELECT id FROM app_session WHERE id = ? AND user_id = ?").get(id, session.user.id);
    if (!owned) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    const body = (await request.json()) as { markers: Array<{ id: string; offsetMs: number; capturedAt: string; sequenceNumber: number; source: string }> };
    const insert = appDb.prepare("INSERT OR IGNORE INTO app_marker (id, session_id, offset_ms, captured_at, sequence_number, source) VALUES (?, ?, ?, ?, ?, ?)");
    const transaction = appDb.transaction((markers: typeof body.markers) => {
      for (const marker of markers) insert.run(marker.id, id, marker.offsetMs, marker.capturedAt, marker.sequenceNumber, marker.source);
    });
    transaction(body.markers || []);
    return NextResponse.json({ accepted: body.markers?.length ?? 0, markerIds: (body.markers || []).map((marker) => marker.id) });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "marker_upload_failed", message: "Could not upload markers" }, { status: 500 });
  }
}
