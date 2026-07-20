"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const SESSION_POLL_MS = 20_000;

function idleTimeoutMs() {
  const minutes = Number(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES ?? "30");
  if (!Number.isFinite(minutes) || minutes <= 0) return 30 * 60 * 1000;
  return minutes * 60 * 1000;
}

async function logoutToLogin(reason: string, message?: string) {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* still redirect */
  }
  if (message) {
    toast.error(message);
  }
  window.location.href = `/login?reason=${reason}`;
}

type SessionGuardProps = {
  /** Dashboard polls access; admin only needs account-level checks. */
  scope?: "dashboard" | "admin";
};

export function SessionGuard({ scope = "dashboard" }: SessionGuardProps) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggingOut = useRef(false);

  useEffect(() => {
    async function checkSession() {
      if (loggingOut.current) return;
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) return;
        const data = (await res.json().catch(() => ({}))) as { reason?: string };
        loggingOut.current = true;
        const reason = data.reason ?? "session_expired";
        // Seller-scoped APIs may return access_revoked; do not force-logout platform admins.
        if (scope === "admin" && reason === "access_revoked") {
          return;
        }
        const message =
          reason === "suspended"
            ? "Your account has been suspended."
            : reason === "access_revoked"
              ? "Your access to this store was removed."
              : "Your session ended. Please log in again.";
        await logoutToLogin(reason, message);
      } catch {
        /* ignore transient network errors */
      }
    }

    function resetIdleTimer() {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (loggingOut.current) return;
        loggingOut.current = true;
        void logoutToLogin("timeout", "You were logged out after a period of inactivity.");
      }, idleTimeoutMs());
    }

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "pointerdown"] as const;

    void checkSession();
    const poll = window.setInterval(() => void checkSession(), SESSION_POLL_MS);

    for (const event of activityEvents) {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    }
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void checkSession();
        resetIdleTimer();
      }
    });

    resetIdleTimer();

    return () => {
      window.clearInterval(poll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      for (const event of activityEvents) {
        window.removeEventListener(event, resetIdleTimer);
      }
    };
  }, [scope]);

  return null;
}