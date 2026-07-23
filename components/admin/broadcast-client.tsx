"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, RotateCcw, Search, Send, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";

const PLANS: BusinessPlan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

type Audience = "all_owners" | "plan" | "approval";

type RecipientRow = {
  email: string;
  name: string;
  storeName: string;
  businessId: string;
};

type Props = {
  initialRecipients: RecipientRow[];
};

export function AdminBroadcastClient({ initialRecipients }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all_owners");
  const [plan, setPlan] = useState<BusinessPlan>("FREE");
  const [approvalStatus, setApprovalStatus] =
    useState<StoreApprovalStatus>("APPROVED");
  const [recipients, setRecipients] = useState<RecipientRow[]>(initialRecipients);
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());
  const [listSearch, setListSearch] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("Open dashboard");
  const [ctaHref, setCtaHref] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const emailKey = (email: string) => email.trim().toLowerCase();

  const refreshList = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({ audience });
      if (audience === "plan") params.set("plan", plan);
      if (audience === "approval") params.set("approvalStatus", approvalStatus);
      const res = await fetch(`/api/admin/broadcast?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as {
        count?: number;
        recipients?: RecipientRow[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Could not load audience");
        return;
      }
      setRecipients(data.recipients ?? []);
      setRemovedKeys(new Set());
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingList(false);
    }
  }, [audience, plan, approvalStatus]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const activeRecipients = useMemo(
    () => recipients.filter((r) => !removedKeys.has(emailKey(r.email))),
    [recipients, removedKeys],
  );

  const removedRecipients = useMemo(
    () => recipients.filter((r) => removedKeys.has(emailKey(r.email))),
    [recipients, removedKeys],
  );

  const filteredActive = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return activeRecipients;
    return activeRecipients.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.storeName.toLowerCase().includes(q),
    );
  }, [activeRecipients, listSearch]);

  function removeOne(email: string) {
    setRemovedKeys((prev) => {
      const next = new Set(prev);
      next.add(emailKey(email));
      return next;
    });
  }

  function restoreOne(email: string) {
    setRemovedKeys((prev) => {
      const next = new Set(prev);
      next.delete(emailKey(email));
      return next;
    });
  }

  function removeFiltered() {
    if (filteredActive.length === 0) return;
    setRemovedKeys((prev) => {
      const next = new Set(prev);
      for (const r of filteredActive) next.add(emailKey(r.email));
      return next;
    });
    toast.message(`Removed ${filteredActive.length} from this send`);
  }

  function restoreAll() {
    setRemovedKeys(new Set());
  }

  async function onSend() {
    if (subject.trim().length < 3) {
      toast.error("Subject must be at least 3 characters");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Message body is too short");
      return;
    }
    if (activeRecipients.length === 0) {
      toast.error("No recipients left — restore some or change audience");
      return;
    }

    const ok = window.confirm(
      `Send this email to ${activeRecipients.length} seller address(es)? This cannot be undone.`,
    );
    if (!ok) return;

    setSending(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          audience,
          plan: audience === "plan" ? plan : undefined,
          approvalStatus: audience === "approval" ? approvalStatus : undefined,
          ctaLabel: ctaLabel.trim() || undefined,
          ctaHref: ctaHref.trim() || undefined,
          includeEmails: activeRecipients.map((r) => r.email),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        sent?: number;
        failed?: number;
        total?: number;
      };
      if (!res.ok) {
        toast.error(data.error || "Send failed");
        return;
      }
      const summary =
        `Sent ${data.sent ?? 0} of ${data.total ?? 0}` +
        (data.failed ? ` (${data.failed} failed)` : "");
      setLastResult(summary);
      toast.success(summary);
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  }

  const fieldClass = "cf-input w-full py-2.5 text-[13px]";
  const labelClass = "mb-1.5 block text-[12px] font-medium text-[#86868b]";
  const sendCount = activeRecipients.length;
  const totalLoaded = recipients.length;

  return (
    <div className="space-y-6">
      <section aria-labelledby="broadcast-audience-kpis">
        <h2 id="broadcast-audience-kpis" className="sr-only">
          Audience size
        </h2>
        <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
          <li>
            <AdminKpiCard
              label="Will receive email"
              value={loadingList ? "…" : sendCount}
              icon={Users}
              tone="gold"
            />
          </li>
          <li>
            <AdminKpiCard
              label="Removed from send"
              value={loadingList ? "…" : removedRecipients.length}
              icon={X}
              tone="amber"
            />
          </li>
          <li>
            <AdminKpiCard
              label="Audience loaded"
              value={loadingList ? "…" : totalLoaded}
              icon={Mail}
              tone="emerald"
            />
          </li>
          <li>
            <AdminKpiCard label="Cap per send" value="2,000" icon={Send} tone="slate" />
          </li>
        </ul>
      </section>

      <section className="cf-table-shell" aria-labelledby="broadcast-compose">
        <div className="border-b border-black/[0.06] px-4 py-4 sm:px-5">
          <h2 id="broadcast-compose" className="cf-page-title text-[17px]">
            Compose message
          </h2>
          <p className="mt-1 text-[13px] text-[#86868b]">
            Plain text is fine. Blank lines become paragraphs in the email template.
          </p>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="broadcast-audience" className={labelClass}>
                Audience filter
              </label>
              <select
                id="broadcast-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as Audience)}
                className={fieldClass}
              >
                <option value="all_owners">All store owners</option>
                <option value="plan">By plan</option>
                <option value="approval">By approval status</option>
              </select>
            </div>

            {audience === "plan" ? (
              <div>
                <label htmlFor="broadcast-plan" className={labelClass}>
                  Plan
                </label>
                <select
                  id="broadcast-plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as BusinessPlan)}
                  className={fieldClass}
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {audience === "approval" ? (
              <div>
                <label htmlFor="broadcast-approval" className={labelClass}>
                  Approval
                </label>
                <select
                  id="broadcast-approval"
                  value={approvalStatus}
                  onChange={(e) =>
                    setApprovalStatus(e.target.value as StoreApprovalStatus)
                  }
                  className={fieldClass}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            ) : (
              <div className="flex items-end">
                <p className="pb-2 text-[13px] text-[#6e6e73]">
                  Unique owner emails only. Remove people below before sending.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="broadcast-subject" className={labelClass}>
              Subject
            </label>
            <input
              id="broadcast-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Important update from CartFlow"
              maxLength={200}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="broadcast-body" className={labelClass}>
              Message
            </label>
            <textarea
              id="broadcast-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement. Separate paragraphs with a blank line."
              rows={8}
              className={`${fieldClass} min-h-[160px] resize-y leading-relaxed`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="broadcast-cta-label" className={labelClass}>
                Button label (optional)
              </label>
              <input
                id="broadcast-cta-label"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Open dashboard"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="broadcast-cta-href" className={labelClass}>
                Button link (optional)
              </label>
              <input
                id="broadcast-cta-href"
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                placeholder="https://cartflow.com.ng/dashboard"
                className={fieldClass}
              />
            </div>
          </div>

          {lastResult ? (
            <p className="rounded-[var(--cf-radius-md)] border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-[13px] text-emerald-900">
              {lastResult}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-black/[0.06] pt-5">
            <button
              type="button"
              onClick={() => void onSend()}
              disabled={sending || sendCount === 0}
              className="cf-btn-inline cf-btn-inline-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-3.5 w-3.5" aria-hidden />
              )}
              {sending ? "Sending…" : `Send to ${sendCount}`}
            </button>
            <button
              type="button"
              onClick={() => void refreshList()}
              disabled={loadingList || sending}
              className="cf-btn-inline cf-btn-inline-ghost text-[12px] disabled:opacity-50"
            >
              Reload list
            </button>
            <p className="text-[12px] text-[#86868b]">
              Only the addresses still in the list below will receive this email.
            </p>
          </div>
        </div>
      </section>

      <section className="cf-table-shell" aria-labelledby="broadcast-recipients">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <h2 id="broadcast-recipients" className="cf-page-title text-[17px]">
              Recipients
            </h2>
            <p className="mt-1 text-[13px] text-[#86868b]">
              {sendCount} will receive · {removedRecipients.length} removed · search then remove
              as needed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1 sm:flex-none">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#86868b]"
                aria-hidden
              />
              <input
                type="search"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search name, email, store…"
                className="cf-input w-full py-2 pl-8 text-[12px] sm:w-[16rem]"
                aria-label="Search recipients"
              />
            </div>
            <button
              type="button"
              disabled={filteredActive.length === 0 || sending}
              onClick={removeFiltered}
              className="cf-btn-inline cf-btn-inline-ghost text-[12px] text-red-700 disabled:opacity-50"
            >
              Remove shown ({filteredActive.length})
            </button>
            {removedRecipients.length > 0 ? (
              <button
                type="button"
                disabled={sending}
                onClick={restoreAll}
                className="cf-btn-inline cf-btn-inline-ghost inline-flex items-center gap-1 text-[12px] disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Restore all
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[640px]">
            <caption className="sr-only">Broadcast recipients</caption>
            <thead>
              <tr>
                <th scope="col">Owner</th>
                <th scope="col">Email</th>
                <th scope="col">Store</th>
                <th scope="col" className="w-28">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingList ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[13px] text-[#86868b]">
                    <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" aria-hidden />
                    Loading recipients…
                  </td>
                </tr>
              ) : filteredActive.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[13px] text-[#86868b]">
                    {activeRecipients.length === 0
                      ? "No recipients for this audience (or all removed)."
                      : "No matches for your search."}
                  </td>
                </tr>
              ) : (
                filteredActive.map((r) => (
                  <tr key={r.businessId + r.email}>
                    <td className="font-medium text-[#1d1d1f]">{r.name}</td>
                    <td className="text-[#6e6e73]">{r.email}</td>
                    <td className="text-[#6e6e73]">{r.storeName}</td>
                    <td>
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => removeOne(r.email)}
                        className="cf-btn-inline cf-btn-inline-ghost text-[11px] text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {removedRecipients.length > 0 ? (
          <div className="border-t border-black/[0.06] px-4 py-4 sm:px-5">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-[#86868b]">
              Removed ({removedRecipients.length}) — will not receive this send
            </p>
            <ul className="max-h-48 space-y-2 overflow-y-auto" role="list">
              {removedRecipients.map((r) => (
                <li
                  key={`removed-${r.email}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/[0.06] bg-[#fbfbfd] px-3 py-2 text-[13px]"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-[#1d1d1f]">{r.name}</span>
                    <span className="text-[#86868b]"> · {r.email}</span>
                  </span>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => restoreOne(r.email)}
                    className="cf-btn-inline cf-btn-inline-ghost shrink-0 text-[11px] disabled:opacity-50"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
