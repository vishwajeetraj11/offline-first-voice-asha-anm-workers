import { toNextJsHandler } from "better-auth/next-js";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);
const databaseReady = getMigrations(auth.options).then(({ runMigrations }) => runMigrations());

export async function GET(request: Request) {
  await databaseReady;
  return handler.GET(request);
}

export async function POST(request: Request) {
  await databaseReady;
  return handler.POST(request);
}
