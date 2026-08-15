import { NextResponse } from "next/server";
import { appQuery, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";
import { transcribeAudioBuffer } from "@/lib/server/openai";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const { rows: [owned] } = await appQuery(
      "SELECT id FROM app_session WHERE id = $1 AND user_id = $2",
      [id, session.user.id],
    );
    if (!owned) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    const form = await request.formData();
    const file = form.get("file");
    const chunkIndex = Number(form.get("chunkIndex"));
    if (!(file instanceof File) || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
      return NextResponse.json({ error: "invalid_request", message: "Audio file and chunkIndex are required" }, { status: 400 });
    }
    const { rows: [existing] } = await appQuery<{ sizeBytes: number; transcriptText: string | null }>(
      `SELECT size_bytes AS "sizeBytes", transcript_text AS "transcriptText"
       FROM app_audio_chunk WHERE session_id = $1 AND chunk_index = $2`,
      [id, chunkIndex],
    );
    if (existing && existing.transcriptText !== null) {
      return NextResponse.json({ chunkIndex, received: true, sizeBytes: existing.sizeBytes, duplicate: true }, { status: 409 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "audio_too_large", message: "Audio chunks must be smaller than 25 MB" }, { status: 413 });
    }
    const transcript = await transcribeAudioBuffer(buffer, `session-${id}-${chunkIndex}.webm`, file.type || "audio/webm");
    await appQuery(`
      INSERT INTO app_audio_chunk (session_id, chunk_index, file_path, mime_type, size_bytes, start_offset_ms, captured_at, transcript_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (session_id, chunk_index) DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        size_bytes = EXCLUDED.size_bytes,
        start_offset_ms = EXCLUDED.start_offset_ms,
        captured_at = EXCLUDED.captured_at,
        transcript_text = EXCLUDED.transcript_text
    `, [id, chunkIndex, "", file.type || "audio/webm", buffer.byteLength, Number(form.get("startOffsetMs") || 0), String(form.get("capturedAt") || nowIso()), transcript]);
    return NextResponse.json({ chunkIndex, received: true, sizeBytes: buffer.byteLength });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Could not upload audio chunk";
    const isConfigError = message.startsWith("OPEN_AI_API is not configured");
    console.error("Audio chunk transcription failed", error);
    return NextResponse.json(
      {
        error: isConfigError ? "openai_not_configured" : "audio_upload_failed",
        message,
      },
      { status: isConfigError ? 503 : 500 },
    );
  }
}
