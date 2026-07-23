"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Send, Users } from "lucide-react";
import { toast } from "sonner";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminSectionHeader } from "@/components/admin/section-header";

const PLANS: BusinessPlan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

type Audience = "all_owners" | "plan" | "approval";

type Props = {
  initialAudienceCount: number;
};

export function AdminBroadcastClient({ initialAudienceCount }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all_owners");
  const [plan, setPlan] = useState<BusinessPlan>("FREE");
  const [approvalStatus, setApprovalStatus] =
    useState<StoreApprovalStatus>("APPROVED");
  const [count, setCount] = useState(initialAudienceCount);
  const [loadingCount, setLoadingCount] = useState(false);
  const [sending, setSending] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("Open dashboard");
  const [ctaHref, setCtaHref] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const refreshCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const params = new URLSearchParams({ audience });
      if (audience === "plan") params.set("plan", plan);
      if (audience === "approval") params.set("approvalStatus", approvalStatus);
      const res = await fetch(`/api/admin/broadcast?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { count?: number; error?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not load audience");
        return;
      }
      setCount(data.count ?? 0);
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingCount(false);
    }
  }, [audience, plan, approvalStatus]);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  async function onSend() {
    if (subject.trim().length < 3) {
      toast.error("Subject must be at least 3 characters");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Message body is too short");
      return;
    }
    if (count === 0) {
      toast.error("No recipients for this audience");
      return;
    }

    const ok = window.confirm(
      `Send this email to about ${count} seller address(es)? This cannot be undone.`,
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

  return (
    <div className="space-y-6">
      <section aria-labelledby="broadcast-audience-kpis">
        <h2 id="broadcast-audience-kpis" className="sr-only">
          Audience size
        </h2>
        <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
          <li>
            <AdminKpiCard
              label="Estimated recipients"
              value={loadingCount ? "…" : count}
              icon={Users}
              tone="gold"
            />
          </li>
          <li>
            <AdminKpiCard
              label="Delivery"
              value="Resend"
              icon={Mail}
              tone="emerald"
            />
          </li>
          <li className="sm:col-span-2 lg:col-span-1">
            <AdminKpiCard
              label="Cap per send"
              value="2,000"
              icon={Send}
              tone="slate"
            />
          </li>
        </ul>
      </section>

      <section className="cf-table-shell" aria-labelledby="broadcast-compose">
        <div className="border-b border-black/[0.06] px-4 py-4 sm:px-5">
          <AdminSectionHeader
            id="broadcast-compose"
            title="Compose message"
            description="Plain text is fine. Blank lines become paragraphs in the email template."
          />
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="broadcast-audience" className={labelClass}>
                Audience
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
                  Unique owner emails only — multi-store owners get one message.
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
              rows={10}
              className={`${fieldClass} min-h-[200px] resize-y leading-relaxed`}
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
              disabled={sending || count === 0}
              className="cf-btn-inline cf-btn-inline-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-3.5 w-3.5" aria-hidden />
              )}
              {sending ? "Sending…" : "Send broadcast"}
            </button>
            <button
              type="button"
              onClick={() => void refreshCount()}
              disabled={loadingCount || sending}
              className="cf-btn-inline cf-btn-inline-ghost text-[12px] disabled:opacity-50"
            >
              Refresh audience
            </button>
            <p className="text-[12px] text-[#86868b]">
              Confirm before large blasts. Delivery is sequential to protect Resend limits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
