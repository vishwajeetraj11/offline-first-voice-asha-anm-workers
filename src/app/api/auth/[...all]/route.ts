import { toNextJsHandler } from "better-auth/next-js";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);
let databaseReady: Promise<void> | undefined;

function ensureAuthDatabase(): Promise<void> {
  databaseReady ??= getMigrations(auth.options).then(({ runMigrations }) => runMigrations());
  return databaseReady;
}

export async function GET(request: Request) {
  await ensureAuthDatabase();
  return handler.GET(request);
}

export async function POST(request: Request) {
  await ensureAuthDatabase();
  return handler.POST(request);
}
