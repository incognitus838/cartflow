import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const stats = await getAdminStats();
  return NextResponse.json({ stats });
}