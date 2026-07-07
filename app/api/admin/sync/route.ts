import { NextResponse } from "next/server";
import { countPendingStoreApprovals } from "@/lib/admin/store-approval";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const [pendingCount, users, businesses] = await Promise.all([
    countPendingStoreApprovals(),
    prisma.user.count(),
    prisma.business.count(),
  ]);

  return NextResponse.json(
    {
      pendingCount,
      users,
      businesses,
      syncedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}