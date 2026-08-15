import { NextResponse } from "next/server";
import { appDb, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = (await request.json()) as { id: string; workerId: string; deviceId: string; startedAt: string };
    if (!body.id || body.workerId !== session.user.id || !body.deviceId || !body.startedAt) {
      return NextResponse.json({ error: "invalid_request", message: "Invalid session payload" }, { status: 400 });
    }
    const now = nowIso();
    appDb.prepare(`INSERT OR IGNORE INTO app_session (id, user_id, device_id, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(body.id, session.user.id, body.deviceId, body.startedAt, now, now);
    const row = appDb.prepare("SELECT id, status, created_at as createdAt FROM app_session WHERE id = ?").get(body.id);
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "session_create_failed", message: "Could not create session" }, { status: 500 });
  }
}
