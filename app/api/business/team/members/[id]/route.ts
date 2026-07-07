import { NextResponse } from "next/server";
import type { MemberAccessPreset } from "@prisma/client";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { removeTeamMember, setMemberSuspended, updateMemberAccess } from "@/lib/team/members";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { parseMemberPermissions } from "@/lib/team/permissions-shared";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_PRESETS = new Set<MemberAccessPreset>([
  "STAFF",
  "MANAGER",
  "FULFILLMENT",
  "CATALOG",
  "CUSTOM",
]);

function parseMemberPatch(body: unknown) {
  if (!body || typeof body !== "object") return "Invalid request body." as const;
  const data = body as Record<string, unknown>;

  if (data.action === "suspend") {
    return { action: "suspend" as const };
  }
  if (data.action === "restore") {
    return { action: "restore" as const };
  }

  const accessPreset =
    typeof data.accessPreset === "string" ? (data.accessPreset as MemberAccessPreset) : null;
  if (!accessPreset || !VALID_PRESETS.has(accessPreset)) {
    return "accessPreset is required." as const;
  }

  let permissions: MemberPermissions | null = null;
  if (accessPreset === "CUSTOM") {
    const parsed = parseMemberPermissions(data.permissions);
    if (!parsed) return "Select at least one permission for custom access." as const;
    permissions = { ...parsed } as MemberPermissions;
  }

  return { action: "update" as const, accessPreset, permissions };
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = parseMemberPatch(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const actor = { userId: auth.session.userId, name: auth.session.name };

  try {
    if (parsed.action === "suspend") {
      await setMemberSuspended(auth.business.id, id, true, actor);
    } else if (parsed.action === "restore") {
      await setMemberSuspended(auth.business.id, id, false, actor);
    } else {
      await updateMemberAccess(
        auth.business.id,
        id,
        { accessPreset: parsed.accessPreset, permissions: parsed.permissions },
        actor,
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update member." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await removeTeamMember(auth.business.id, id, {
      userId: auth.session.userId,
      name: auth.session.name,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove member." },
      { status: 400 },
    );
  }
}