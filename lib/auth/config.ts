/** Absolute session lifetime (cookie + JWT). */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Client idle timeout before auto-logout (ms). Override with NEXT_PUBLIC_SESSION_IDLE_MINUTES. */
export function sessionIdleMs() {
  const minutes = Number(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES ?? "30");
  if (!Number.isFinite(minutes) || minutes <= 0) return 30 * 60 * 1000;
  return minutes * 60 * 1000;
}

/** How often the dashboard polls session validity (ms). */
export const SESSION_POLL_MS = 20_000;