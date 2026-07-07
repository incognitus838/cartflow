import { NextResponse } from "next/server";
import {
  countPendingStoreApprovals,
  listPendingStoreApprovals,
  listRecentApprovalDecisions,
} from "@/lib/admin/store-approval";
import { requireApiAdmin } from "@/lib/api/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const [pending, recent, pendingCount] = await Promise.all([
    listPendingStoreApprovals(100),
    listRecentApprovalDecisions(15),
    countPendingStoreApprovals(),
  ]);

  return NextResponse.json(
    { pending, recent, pendingCount },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}