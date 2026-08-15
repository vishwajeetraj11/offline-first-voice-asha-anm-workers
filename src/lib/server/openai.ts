import OpenAI, { toFile } from "openai";
import { appDb } from "@/lib/server/app-db";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPEN_AI_API?.trim();
  if (!apiKey || apiKey === "replace-with-your-openai-api-key") {
    throw new Error("OPEN_AI_API is not configured. Add it to .env.local and restart Next.js.");
  }
  return new OpenAI({ apiKey });
}

export async function transcribeAudioBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const openai = getOpenAI();
  const file = await toFile(buffer, filename, { type: mimeType || "audio/webm" });
  const request = {
    file,
    model: "gpt-transcribe",
    prompt: "ASHA ANM household visit. Preserve names, symptoms, medicines, actions, dates, and household numbers.",
  };
  const result = await openai.audio.transcriptions.create(request, {
    body: {
      ...request,
      languages: ["hi", "en"],
    },
  });
  return result.text;
}

export function getStoredTranscript(sessionId: string): string {
  const chunks = appDb
    .prepare("SELECT transcript_text FROM app_audio_chunk WHERE session_id = ? ORDER BY chunk_index")
    .all(sessionId) as Array<{ transcript_text: string | null }>;
  if (chunks.length === 0 || chunks.some((chunk) => !chunk.transcript_text)) {
    throw new Error("Not all audio chunks have been transcribed");
  }
  return chunks.map((chunk) => chunk.transcript_text as string).join("\n");
}

const visitSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    visits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          householdName: { anyOf: [{ type: "string" }, { type: "null" }] },
          symptoms: { type: "array", items: { type: "string" } },
          actionTaken: { anyOf: [{ type: "string" }, { type: "null" }] },
          nextVisitAt: { anyOf: [{ type: "string" }, { type: "null" }] },
          confidence: { type: "number" },
          sourceExcerpt: { type: "string" },
        },
        required: ["householdName", "symptoms", "actionTaken", "nextVisitAt", "confidence", "sourceExcerpt"],
      },
    },
  },
  required: ["visits"],
} as const;

export type ParsedVisit = {
  householdName: string | null;
  symptoms: string[];
  actionTaken: string | null;
  nextVisitAt: string | null;
  confidence: number;
  sourceExcerpt: string;
};

export async function parseVisits(transcript: string): Promise<ParsedVisit[]> {
  const openai = getOpenAI();
  const response = await openai.responses.create({
    model: process.env.OPENAI_PARSER_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content: "You convert an ASHA/ANM field-visit transcript into register-ready household rows. Split rows only at clear household boundaries or explicit household markers. Treat marker hints as boundaries, not as household facts. Never invent missing facts: use null or an empty array. Confidence must be 0 to 1 and reflect evidence in the transcript. Use needs review downstream for confidence below 0.75 or missing household name/action.",
      },
      { role: "user", content: transcript },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "household_visit_register",
        strict: true,
        schema: visitSchema,
      },
    },
  });

  const parsed = JSON.parse(response.output_text) as { visits: ParsedVisit[] };
  return parsed.visits.map((visit) => ({
    ...visit,
    confidence: Math.max(0, Math.min(1, visit.confidence)),
  }));
}
