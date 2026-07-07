"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Clock, Mail, RefreshCw, UserMinus, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  defaultPermissionsForPreset,
  PermissionPicker,
} from "@/components/dashboard/permission-picker";
import { presetLabel } from "@/lib/dashboard/nav";
import type { MemberAccessPresetId, MemberPermissions } from "@/lib/team/permissions-shared";

type TeamMember = {
  id: string;
  userId: string;
  role: string;
  accessPreset: string;
  isSuspended: boolean;
  user: { name: string; email: string };
  isOwner?: boolean;
};

type PendingInvite = {
  id: string;
  email: string;
  name: string | null;
  accessPreset: string;
  expiresAt: string;
  invitedBy: { name: string };
};

type ActivityEntry = {
  id: string;
  action: string;
  actorName: string | null;
  detail: string | null;
  createdAt: string;
};

type TeamData = {
  staffEnabled: boolean;
  upgradeMessage: string | null;
  seats: { used: number; limit: number | null };
  members: TeamMember[];
  invites: PendingInvite[];
  activity: ActivityEntry[];
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TeamPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<TeamData | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accessPreset, setAccessPreset] = useState<MemberAccessPresetId>("STAFF");
  const [permissions, setPermissions] = useState<MemberPermissions>(
    defaultPermissionsForPreset("STAFF"),
  );
  const [inviting, setInviting] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const loadTeam = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/business/team");
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not load team");
        return;
      }
      setData(json);
    } catch {
      toast.error("Could not load team");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  function handlePresetChange(preset: MemberAccessPresetId) {
    setAccessPreset(preset);
    setPermissions(defaultPermissionsForPreset(preset));
  }

  function handlePermissionChange(key: keyof MemberPermissions, value: boolean) {
    setPermissions((prev) => ({ ...prev, [key]: value }));
  }

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    if (!data?.staffEnabled) return;
    setInviting(true);
    try {
      const res = await fetch("/api/business/team/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          accessPreset,
          permissions: accessPreset === "CUSTOM" ? permissions : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not send invite");
        return;
      }
      toast.success(`Invite sent to ${email}`);
      setEmail("");
      setName("");
      setAccessPreset("STAFF");
      setPermissions(defaultPermissionsForPreset("STAFF"));
      await loadTeam(true);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setInviting(false);
    }
  }

  async function revokeInvite(inviteId: string) {
    const res = await fetch(`/api/business/team/invites/${inviteId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not revoke invite");
      return;
    }
    toast.success("Invite revoked");
    await loadTeam(true);
  }

  async function updateMember(
    memberId: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    const res = await fetch(`/api/business/team/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not update member");
      return;
    }
    toast.success(successMessage);
    setEditingMemberId(null);
    await loadTeam(true);
    router.refresh();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this team member? They will lose access immediately.")) return;
    const res = await fetch(`/api/business/team/members/${memberId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not remove member");
      return;
    }
    toast.success("Member removed");
    await loadTeam(true);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading team…
      </div>
    );
  }

  if (!data) return null;

  const staffMembers = data.members.filter((m) => !m.isOwner && m.role !== "OWNER");
  const seatLabel =
    data.seats.limit == null
      ? `${data.seats.used} seats used`
      : `${data.seats.used} / ${data.seats.limit} seats`;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{seatLabel}</p>
        <button
          type="button"
          onClick={() => void loadTeam(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!data.staffEnabled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-900">Team invites require Pro</p>
          <p className="mt-1 text-sm text-amber-800">{data.upgradeMessage}</p>
          <Link
            href="/dashboard/billing"
            className="mt-3 inline-block text-sm font-semibold text-amber-900 underline"
          >
            View plans →
          </Link>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Invite team member</h2>
          <p className="mt-1 text-xs text-slate-500">
            They&apos;ll get an email with a link to join. Invites expire in 7 days.
          </p>
          <form onSubmit={handleInvite} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <PermissionPicker
              accessPreset={accessPreset}
              onPresetChange={handlePresetChange}
              permissions={permissions}
              onPermissionChange={handlePermissionChange}
            />
            <button type="submit" disabled={inviting} className="btn-primary">
              {inviting ? "Sending…" : "Send invite"}
            </button>
          </form>
        </section>
      )}

      {data.invites.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Pending invites</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {data.invites.map((invite) => (
              <li key={invite.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {invite.email}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {presetLabel(invite.accessPreset)} · invited by {invite.invitedBy.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    Expires {formatWhen(invite.expiresAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void revokeInvite(invite.id)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Team members</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {data.members.map((member) => (
            <li key={member.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {member.user.name}
                    {member.isOwner || member.role === "OWNER" ? (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        Owner
                      </span>
                    ) : member.isSuspended ? (
                      <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                        Suspended
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full bg-[#fffdf9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b8956a]">
                        {presetLabel(member.accessPreset)}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{member.user.email}</p>
                </div>
                {!member.isOwner && member.role !== "OWNER" ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingMemberId(editingMemberId === member.id ? null : member.id)
                      }
                      className="text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      {editingMemberId === member.id ? "Close" : "Edit access"}
                    </button>
                    {member.isSuspended ? (
                      <button
                        type="button"
                        onClick={() =>
                          void updateMember(member.id, { action: "restore" }, "Member restored")
                        }
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void updateMember(member.id, { action: "suspend" }, "Member suspended")
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800"
                      >
                        <UserX className="h-3 w-3" />
                        Suspend
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeMember(member.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <UserMinus className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>

              {editingMemberId === member.id ? (
                <MemberAccessEditor
                  initialPreset={member.accessPreset as MemberAccessPresetId}
                  onSave={(preset, perms) =>
                    void updateMember(
                      member.id,
                      {
                        accessPreset: preset,
                        permissions: preset === "CUSTOM" ? perms : undefined,
                      },
                      "Access updated",
                    )
                  }
                />
              ) : null}
            </li>
          ))}
        </ul>
        {staffMembers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No staff yet — invite someone above.</p>
        ) : null}
      </section>

      {data.activity.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <ul className="mt-4 space-y-3">
            {data.activity.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span className="shrink-0 tabular-nums text-xs text-slate-400">
                  {formatWhen(entry.createdAt)}
                </span>
                <span className="text-slate-700">
                  {entry.detail ?? entry.action}
                  {entry.actorName ? (
                    <span className="text-slate-400"> — {entry.actorName}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function MemberAccessEditor({
  initialPreset,
  onSave,
}: {
  initialPreset: MemberAccessPresetId;
  onSave: (preset: MemberAccessPresetId, permissions: MemberPermissions) => void;
}) {
  const [preset, setPreset] = useState(initialPreset);
  const [permissions, setPermissions] = useState(defaultPermissionsForPreset(initialPreset));
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <PermissionPicker
        accessPreset={preset}
        onPresetChange={(next) => {
          setPreset(next);
          setPermissions(defaultPermissionsForPreset(next));
        }}
        permissions={permissions}
        onPermissionChange={(key, value) =>
          setPermissions((prev) => ({ ...prev, [key]: value }))
        }
      />
      <button
        type="button"
        disabled={saving}
        onClick={() => {
          setSaving(true);
          onSave(preset, permissions);
          setSaving(false);
        }}
        className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Save access
      </button>
    </div>
  );
}