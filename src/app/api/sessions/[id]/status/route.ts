import { NextResponse } from "next/server";
import { appDb } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const record = appDb.prepare(`SELECT s.id, CASE WHEN (SELECT COUNT(*) FROM app_audio_chunk c WHERE c.session_id = s.id) = 0 THEN 'not_started' WHEN s.processing_status = 'done' THEN 'complete' ELSE 'partial' END as uploadStatus, (SELECT COUNT(*) FROM app_audio_chunk c WHERE c.session_id = s.id) as receivedChunks, (SELECT COUNT(*) FROM app_audio_chunk c WHERE c.session_id = s.id) as expectedChunks, s.processing_status as processingStatus, (SELECT COUNT(*) FROM visit_record v WHERE v.session_id = s.id) as visitCount FROM app_session s WHERE s.id = ? AND s.user_id = ?`).get(id, session.user.id);
    if (!record) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "status_failed", message: "Could not read session status" }, { status: 500 });
  }
}
