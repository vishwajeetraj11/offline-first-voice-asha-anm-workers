import { NextResponse } from "next/server";
import { appQuery, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = (await request.json()) as { endedAt: string; totalDurationMs: number; markerCount: number };
    const result = await appQuery(
      `UPDATE app_session
       SET ended_at = $1, total_duration_ms = $2, marker_count = $3, status = 'ended', updated_at = $4
       WHERE id = $5 AND user_id = $6`,
      [body.endedAt, body.totalDurationMs, body.markerCount, nowIso(), id, session.user.id],
    );
    if (result.rowCount === 0) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    return NextResponse.json({ id, status: "ended" });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "session_end_failed", message: "Could not end session" }, { status: 500 });
  }
}
