import { NextResponse } from "next/server";
import type { MemberAccessPreset } from "@prisma/client";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { createStaffInvite } from "@/lib/team/invites";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { parseMemberPermissions } from "@/lib/team/permissions-shared";

export const runtime = "nodejs";

const VALID_PRESETS = new Set<MemberAccessPreset>([
  "STAFF",
  "MANAGER",
  "FULFILLMENT",
  "CATALOG",
  "CUSTOM",
]);

function parseInviteBody(body: unknown) {
  if (!body || typeof body !== "object") return "Invalid request body." as const;
  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim() : undefined;
  const accessPreset =
    typeof data.accessPreset === "string" ? (data.accessPreset as MemberAccessPreset) : "STAFF";

  if (!email) return "Email is required." as const;
  if (!VALID_PRESETS.has(accessPreset)) return "Invalid access preset." as const;

  let permissions: MemberPermissions | null = null;
  if (accessPreset === "CUSTOM") {
    const parsed = parseMemberPermissions(data.permissions);
    if (!parsed) return "Select at least one permission for custom access." as const;
    permissions = { ...parsed } as MemberPermissions;
  }

  return { email, name, accessPreset, permissions };
}

export async function POST(request: Request) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseInviteBody(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  try {
    const result = await createStaffInvite({
      businessId: auth.business.id,
      email: parsed.email,
      name: parsed.name,
      accessPreset: parsed.accessPreset,
      permissions: parsed.permissions,
      invitedById: auth.session.userId,
      invitedByName: auth.session.name,
      storeName: auth.business.name,
      appUrl,
    });

    return NextResponse.json({
      ok: true,
      invite: {
        id: result.invite.id,
        email: result.invite.email,
        accessPreset: result.invite.accessPreset,
        expiresAt: result.invite.expiresAt.toISOString(),
      },
      inviteUrl: result.inviteUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send invite." },
      { status: 400 },
    );
  }
}