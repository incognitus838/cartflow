"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";

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

  const refreshCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const params = new URLSearchParams({ audience });
      if (audience === "plan") params.set("plan", plan);
      if (audience === "approval") params.set("approvalStatus", approvalStatus);
      const res = await fetch(`/api/admin/broadcast?${params.toString()}`);
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
      toast.success(
        `Sent ${data.sent ?? 0} of ${data.total ?? 0}` +
          (data.failed ? ` (${data.failed} failed)` : ""),
      );
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="cf-card space-y-5 p-5 sm:p-6" aria-labelledby="broadcast-compose">
      <div>
        <h2 id="broadcast-compose" className="text-[17px] font-semibold text-[#1d1d1f]">
          Compose
        </h2>
        <p className="mt-1 text-[13px] text-[#86868b]">
          Sent via Resend from the CartFlow platform address. Sequential delivery
          (rate-limited) — large audiences may take a few minutes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="broadcast-audience" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
            Audience
          </label>
          <select
            id="broadcast-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            className="cf-input w-full py-2 text-[13px]"
          >
            <option value="all_owners">All active store owners</option>
            <option value="plan">By plan</option>
            <option value="approval">By approval status</option>
          </select>
        </div>

        {audience === "plan" ? (
          <div>
            <label htmlFor="broadcast-plan" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
              Plan
            </label>
            <select
              id="broadcast-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value as BusinessPlan)}
              className="cf-input w-full py-2 text-[13px]"
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
            <label htmlFor="broadcast-approval" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
              Approval
            </label>
            <select
              id="broadcast-approval"
              value={approvalStatus}
              onChange={(e) =>
                setApprovalStatus(e.target.value as StoreApprovalStatus)
              }
              className="cf-input w-full py-2 text-[13px]"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        ) : null}
      </div>

      <p className="text-[13px] text-[#6e6e73]">
        Estimated recipients:{" "}
        <span className="font-semibold tabular-nums text-[#1d1d1f]">
          {loadingCount ? "…" : count}
        </span>
      </p>

      <div>
        <label htmlFor="broadcast-subject" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
          Subject
        </label>
        <input
          id="broadcast-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Important update from CartFlow"
          maxLength={200}
          className="cf-input w-full py-2.5 text-[13px]"
        />
      </div>

      <div>
        <label htmlFor="broadcast-body" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
          Message
        </label>
        <textarea
          id="broadcast-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your announcement. Separate paragraphs with a blank line."
          rows={10}
          className="cf-input min-h-[180px] w-full resize-y py-2.5 text-[13px] leading-relaxed"
        />
        <p className="mt-1.5 text-[11px] text-[#86868b]">
          Plain text is fine; blank lines become paragraphs in the email.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="broadcast-cta-label" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
            Button label (optional)
          </label>
          <input
            id="broadcast-cta-label"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="Open dashboard"
            className="cf-input w-full py-2 text-[13px]"
          />
        </div>
        <div>
          <label htmlFor="broadcast-cta-href" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
            Button link (optional)
          </label>
          <input
            id="broadcast-cta-href"
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            placeholder="https://cartflow.com.ng/dashboard"
            className="cf-input w-full py-2 text-[13px]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => void onSend()}
          disabled={sending || count === 0}
          className="btn-accent text-[13px] disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send broadcast"}
        </button>
        <p className="text-[12px] text-[#86868b]">
          Max 2,000 owners per send. Confirm before large blasts.
        </p>
      </div>
    </section>
  );
}
