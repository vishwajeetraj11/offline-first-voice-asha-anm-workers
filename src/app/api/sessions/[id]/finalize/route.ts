import { NextResponse } from "next/server";
import { appDb, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";
import { getStoredTranscript, parseVisits } from "@/lib/server/openai";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = (await request.json()) as { totalChunks: number; totalDurationMs: number };
    const record = appDb.prepare("SELECT id FROM app_session WHERE id = ? AND user_id = ?").get(id, session.user.id);
    if (!record) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    appDb.prepare("UPDATE app_session SET total_duration_ms = ?, processing_status = 'processing', updated_at = ? WHERE id = ?")
      .run(body.totalDurationMs, nowIso(), id);

    const transcript = getStoredTranscript(id);
    const markers = appDb.prepare("SELECT sequence_number as sequenceNumber, offset_ms as offsetMs FROM app_marker WHERE session_id = ? ORDER BY sequence_number").all(id) as Array<{ sequenceNumber: number; offsetMs: number }>;
    const markerGuide = markers.length > 0
      ? `Explicit household markers (use these as boundary hints):\n${markers.map((marker) => `Marker ${marker.sequenceNumber} at ${marker.offsetMs}ms`).join("\n")}\n\n`
      : "No explicit household markers were captured; infer boundaries conservatively.\n\n";
    // A recording can contain only silence and still be uploaded correctly.
    // Complete it with no visit rows instead of asking the parser to infer
    // content from an empty transcript.
    const visits = transcript.trim()
      ? await parseVisits(`${markerGuide}Transcript:\n${transcript}`)
      : [];
    const insert = appDb.prepare("INSERT INTO visit_record (id, session_id, household_name, visit_category, symptoms_json, action_taken, next_visit_at, confidence, status, source_excerpt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const transaction = appDb.transaction(() => {
      appDb.prepare("DELETE FROM visit_record WHERE session_id = ?").run(id);
      for (const visit of visits) {
        const status = visit.confidence < 0.75 || !visit.householdName || !visit.actionTaken ? "needs_review" : "ready";
        insert.run(crypto.randomUUID(), id, visit.householdName, visit.visitCategory, JSON.stringify(visit.symptoms), visit.actionTaken, visit.nextVisitAt, visit.confidence, status, visit.sourceExcerpt, nowIso());
      }
    });
    transaction();
    appDb.prepare("UPDATE app_session SET transcript = ?, processing_status = 'done', updated_at = ? WHERE id = ?")
      .run(transcript, nowIso(), id);
    appDb.prepare("DELETE FROM app_audio_chunk WHERE session_id = ?").run(id);
    return NextResponse.json({ id, processingStatus: "done", visitCount: visits.length });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Processing failed";
    return NextResponse.json({ error: "processing_failed", message }, { status: 500 });
  }
}
