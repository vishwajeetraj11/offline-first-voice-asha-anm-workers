import { NextResponse } from "next/server";
import { appDb, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = (await request.json()) as { endedAt: string; totalDurationMs: number; markerCount: number };
    const result = appDb.prepare(`UPDATE app_session SET ended_at = ?, total_duration_ms = ?, marker_count = ?, status = 'ended', updated_at = ? WHERE id = ? AND user_id = ?`)
      .run(body.endedAt, body.totalDurationMs, body.markerCount, nowIso(), id, session.user.id);
    if (result.changes === 0) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    return NextResponse.json({ id, status: "ended" });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "session_end_failed", message: "Could not end session" }, { status: 500 });
  }
}
