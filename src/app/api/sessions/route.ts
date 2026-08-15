import { NextResponse } from "next/server";
import { appQuery, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = (await request.json()) as { id: string; workerId: string; deviceId: string; startedAt: string };
    if (!body.id || body.workerId !== session.user.id || !body.deviceId || !body.startedAt) {
      return NextResponse.json({ error: "invalid_request", message: "Invalid session payload" }, { status: 400 });
    }
    const now = nowIso();
    await appQuery(
      `INSERT INTO app_session (id, user_id, device_id, started_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [body.id, session.user.id, body.deviceId, body.startedAt, now, now],
    );
    const { rows: [row] } = await appQuery<{ id: string; status: string; createdAt: string }>(
      `SELECT id, status, created_at AS "createdAt" FROM app_session WHERE id = $1`,
      [body.id],
    );
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "session_create_failed", message: "Could not create session" }, { status: 500 });
  }
}
