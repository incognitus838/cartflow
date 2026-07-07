import "server-only";

import type { MemberAccessPreset } from "@prisma/client";
import {
  FULL_MEMBER_PERMISSIONS,
  type MemberAccessPresetId,
  type MemberPermissions,
  parseMemberPermissions,
  presetPermissions,
  resolveMemberPermissions,
} from "@/lib/team/permissions-shared";

export type { MemberPermissions } from "@/lib/team/permissions-shared";

export function toPresetId(preset: MemberAccessPreset): MemberAccessPresetId {
  return preset as MemberAccessPresetId;
}

export function permissionsForOwner(): MemberPermissions {
  return { ...FULL_MEMBER_PERMISSIONS };
}

export function permissionsForMember(input: {
  accessPreset: MemberAccessPreset;
  permissions?: unknown;
}): MemberPermissions {
  const preset = toPresetId(input.accessPreset);
  const overrides = parseMemberPermissions(input.permissions);
  return resolveMemberPermissions(preset, overrides);
}

export function hasPermission(
  permissions: MemberPermissions,
  key: keyof MemberPermissions,
): boolean {
  return Boolean(permissions[key]);
}

export { presetPermissions, resolveMemberPermissions };