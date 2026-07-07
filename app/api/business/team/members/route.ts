import { NextResponse } from "next/server";
import type { MemberAccessPreset } from "@prisma/client";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { createTeamMemberWithPassword } from "@/lib/team/create-member";
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

function parseCreateBody(body: unknown) {
  if (!body || typeof body !== "object") return "Invalid request body." as const;
  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const accessPreset =
    typeof data.accessPreset === "string" ? (data.accessPreset as MemberAccessPreset) : "STAFF";

  if (!email) return "Email is required." as const;
  if (!name) return "Name is required." as const;
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
  const parsed = parseCreateBody(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const result = await createTeamMemberWithPassword({
      businessId: auth.business.id,
      email: parsed.email,
      name: parsed.name,
      accessPreset: parsed.accessPreset,
      permissions: parsed.permissions,
      actor: { userId: auth.session.userId, name: auth.session.name },
    });

    return NextResponse.json({
      ok: true,
      credentials: {
        email: result.email,
        name: result.name,
        password: result.password,
        accessPreset: result.accessPreset,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create team member." },
      { status: 400 },
    );
  }
}