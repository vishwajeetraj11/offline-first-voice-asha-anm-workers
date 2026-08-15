import { NextResponse } from "next/server";
import { appDb, nowIso } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";
import { transcribeAudioBuffer } from "@/lib/server/openai";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const owned = appDb.prepare("SELECT id FROM app_session WHERE id = ? AND user_id = ?").get(id, session.user.id);
    if (!owned) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    const form = await request.formData();
    const file = form.get("file");
    const chunkIndex = Number(form.get("chunkIndex"));
    if (!(file instanceof File) || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
      return NextResponse.json({ error: "invalid_request", message: "Audio file and chunkIndex are required" }, { status: 400 });
    }
    const existing = appDb.prepare("SELECT size_bytes as sizeBytes FROM app_audio_chunk WHERE session_id = ? AND chunk_index = ?").get(id, chunkIndex) as { sizeBytes: number } | undefined;
    if (existing) return NextResponse.json({ chunkIndex, received: true, sizeBytes: existing.sizeBytes, duplicate: true }, { status: 409 });
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "audio_too_large", message: "Audio chunks must be smaller than 25 MB" }, { status: 413 });
    }
    const transcript = await transcribeAudioBuffer(buffer, `session-${id}-${chunkIndex}.webm`, file.type || "audio/webm");
    appDb.prepare("INSERT INTO app_audio_chunk (session_id, chunk_index, file_path, mime_type, size_bytes, start_offset_ms, captured_at, transcript_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, chunkIndex, "", file.type || "audio/webm", buffer.byteLength, Number(form.get("startOffsetMs") || 0), String(form.get("capturedAt") || nowIso()), transcript);
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
