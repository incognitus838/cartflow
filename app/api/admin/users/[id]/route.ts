import { NextResponse } from "next/server";
import { getAdminUserDetail, suspendAdminUser, unsuspendAdminUser } from "@/lib/admin/user-detail";
import { requireApiAdmin } from "@/lib/api/require-admin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const user = await getAdminUserDetail(id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const action = (body as { action?: string }).action;
  const reason = typeof (body as { reason?: string }).reason === "string"
    ? (body as { reason: string }).reason
    : undefined;

  try {
    if (action === "suspend") {
      await suspendAdminUser(id, reason);
    } else if (action === "unsuspend") {
      await unsuspendAdminUser(id);
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const user = await getAdminUserDetail(id);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}