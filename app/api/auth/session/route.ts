import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { validateActiveSession } from "@/lib/auth/validate-session";

export const runtime = "nodejs";

export async function GET() {
  const result = await validateActiveSession();

  if (!result.ok) {
    await clearSession();
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}