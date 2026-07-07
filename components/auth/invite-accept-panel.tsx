"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { presetLabel } from "@/lib/dashboard/nav";

type InviteInfo = {
  email: string;
  name: string | null;
  accessPreset: string;
  store: { name: string; slug: string; logoUrl: string | null };
  invitedByName: string;
};

type InviteAcceptPanelProps = {
  token: string;
  state: "active" | "inactive" | "expired";
  invite: InviteInfo;
  isLoggedIn: boolean;
  sessionEmail?: string;
};

export function InviteAcceptPanel({
  token,
  state,
  invite,
  isLoggedIn,
  sessionEmail,
}: InviteAcceptPanelProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const returnUrl = `/invite/${token}`;
  const emailMatches =
    isLoggedIn && sessionEmail?.toLowerCase() === invite.email.toLowerCase();

  async function handleAccept() {
    setAccepting(true);
    try {
      const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not accept invite");
        return;
      }
      toast.success(`Welcome to ${data.businessName}!`);
      router.push(data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAccepting(false);
    }
  }

  if (state !== "active") {
    return (
      <AuthCard
        title="Invite unavailable"
        subtitle={
          state === "expired"
            ? "This invite has expired. Ask the store owner to send a new one."
            : "This invite was already used or revoked."
        }
        footer={
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Go to login
          </Link>
        }
      >
        <p className="text-sm text-slate-600">
          Store: <span className="font-medium text-slate-900">{invite.store.name}</span>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="You're invited"
      subtitle={`${invite.invitedByName} invited you to help manage their store`}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(returnUrl)}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          {invite.store.logoUrl ? (
            <img
              src={invite.store.logoUrl}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
              <Store className="h-5 w-5" />
            </span>
          )}
          <div>
            <p className="font-semibold text-slate-900">{invite.store.name}</p>
            <p className="text-xs text-slate-500">/{invite.store.slug}</p>
          </div>
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Invited email</dt>
            <dd className="font-medium text-slate-900">{invite.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Access level</dt>
            <dd className="font-medium text-slate-900">{presetLabel(invite.accessPreset)}</dd>
          </div>
        </dl>

        {isLoggedIn ? (
          emailMatches ? (
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="btn-primary w-full"
            >
              {accepting ? "Joining…" : `Join ${invite.store.name}`}
            </button>
          ) : (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You&apos;re signed in as <span className="font-medium">{sessionEmail}</span>. Sign
              out and log in with <span className="font-medium">{invite.email}</span> to accept.
            </div>
          )
        ) : (
          <div className="space-y-3">
            <Link
              href={`/login?next=${encodeURIComponent(returnUrl)}`}
              className="btn-primary block w-full text-center"
            >
              Log in to accept
            </Link>
            <Link
              href={`/signup?invite=${token}&email=${encodeURIComponent(invite.email)}&name=${encodeURIComponent(invite.name ?? "")}`}
              className="block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </AuthCard>
  );
}