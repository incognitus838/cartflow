import { NextResponse } from "next/server";
import { getAdminJob } from "@/lib/admin/jobs";
import { requireApiAdmin } from "@/lib/api/require-admin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const job = await getAdminJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  if (job.createdById !== auth.session.userId && auth.session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const percent =
    job.total > 0 ? Math.min(100, Math.round((job.processed / job.total) * 100)) : 0;

  return NextResponse.json({
    job: {
      id: job.id,
      type: job.type,
      status: job.status,
      total: job.total,
      processed: job.processed,
      success: job.success,
      failed: job.failed,
      errors: job.errors,
      percent,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
  });
}
