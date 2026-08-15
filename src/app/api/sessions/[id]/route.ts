import { NextResponse } from "next/server";
import { appQuery, withAppTransaction } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const owned = await appQuery("SELECT id FROM app_session WHERE id = $1 AND user_id = $2", [id, session.user.id]);
    if (owned.rowCount === 0) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    await withAppTransaction(async (client) => {
      await client.query("DELETE FROM app_session WHERE id = $1", [id]);
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "session_delete_failed", message: "Could not delete recording" }, { status: 500 });
  }
}
