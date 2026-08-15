"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Headphones } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/schema";

function AudioClip({ blob }: { blob: Blob }) {
  const [url] = useState(() => URL.createObjectURL(blob));

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return <audio controls preload="metadata" src={url} className="h-9 min-w-0 flex-1" />;
}

export function LocalRecordingPreview({ sessionId }: { sessionId: string }) {
  const chunks = useLiveQuery(
    () => db.audioChunks.where("sessionId").equals(sessionId).sortBy("chunkIndex"),
    [sessionId],
  );
  if (!chunks || chunks.length === 0) return null;

  return (
    <details className="mt-1 rounded-xl bg-[#f0ede4] p-3.5">
      <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#526762]">
        <Headphones aria-hidden="true" className="size-4 text-[#176b5b]" />
        Preview saved audio ({chunks.length} clip{chunks.length === 1 ? "" : "s"})
      </summary>
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-xs font-semibold leading-5 text-[#7b8a85]">
          Audio is stored locally on this device until processing succeeds.
        </p>
        {chunks.map((chunk, index) => (
          <div key={chunk.id} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs font-bold text-[#7b8a85]">
              Clip {index + 1}
            </span>
            <AudioClip blob={chunk.blob} />
          </div>
        ))}
      </div>
    </details>
  );
}
