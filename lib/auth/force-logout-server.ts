import "server-only";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";
import type { SessionInvalidReason } from "@/lib/auth/validate-session";

export async function forceLogoutRedirect(
  reason: SessionInvalidReason | "timeout" = "access_revoked",
  redirectTo = "/login",
) {
  await clearSession();
  redirect(`${redirectTo}?reason=${reason}`);
}