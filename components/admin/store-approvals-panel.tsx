"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { BusinessPlan } from "@prisma/client";
import { Check, ClipboardCheck, Layers, X } from "lucide-react";
import { toast } from "sonner";
import { AdminActions } from "@/components/admin/admin-actions";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { StorefrontLink } from "@/components/admin/storefront-link";
import { VALID_APPROVAL_PLANS } from "@/lib/business/approval";
import type {
  PendingApprovalRecord,
  RecentApprovalDecision,
} from "@/lib/admin/store-approval";

export type PendingApprovalRow = PendingApprovalRecord;
export type RecentDecisionRow = RecentApprovalDecision;

type StoreApprovalsPanelProps = {
  pending: PendingApprovalRecord[];
  recent: RecentApprovalDecision[];
  pendingCount: number;
};

export function StoreApprovalsPanel({ pending, recent, pendingCount }: StoreApprovalsPanelProps) {
  const router = useRouter();
  const [rows, setRows] = useState(pending);
  const [queueCount, setQueueCount] = useState(pendingCount);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setRows(pending);
    setQueueCount(pendingCount);
  }, [pending, pendingCount]);

  useEffect(() => {
    let cancelled = false;

    async function refreshQueue() {
      try {
        const res = await fetch("/api/admin/approvals", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.pending)) setRows(data.pending);
        if (typeof data.pendingCount === "number") setQueueCount(data.pendingCount);
      } catch {
        /* ignore transient network errors */
      }
    }

    refreshQueue();
    const timer = window.setInterval(refreshQueue, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  async function review(
    id: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Review failed");
        return false;
      }
      setRows((current) => current.filter((row) => row.id !== id));
      setRejectId(null);
      setRejectReason("");
      toast.success(successMessage);
      router.refresh();
      return true;
    } catch {
      toast.error("Something went wrong");
      return false;
    } finally {
      setLoadingId(null);
    }
  }

  async function approve(store: PendingApprovalRow) {
    await review(
      store.id,
      {
        action: "approve",
        plan: store.plan,
        bankVerified: store.readiness.hasBank,
        catalogVerified: store.readiness.hasCatalog,
        contactVerified: store.readiness.hasContact,
      },
      `${store.name} approved — storefront is live`,
    );
  }

  async function reject(store: PendingApprovalRow) {
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Enter a rejection reason for the seller");
      return;
    }
    await review(
      store.id,
      { action: "reject", rejectionReason: reason, resubmissionAllowed: true },
      `${store.name} rejected`,
    );
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="approval-kpis">
        <h2 id="approval-kpis" className="sr-only">
          Approval metrics
        </h2>
        <ul className="grid list-none gap-4 sm:grid-cols-2" role="list">
          <li>
            <AdminKpiCard
              label="Pending store reviews"
              value={queueCount}
              icon={ClipboardCheck}
              tone="amber"
              highlight={queueCount > 0}
            />
          </li>
          <li>
            <AdminKpiCard
              label="In this queue"
              value={rows.length}
              icon={Layers}
              tone="slate"
            />
          </li>
        </ul>
      </section>

      <section aria-labelledby="pending-approvals-heading" className="space-y-4">
        <h2 id="pending-approvals-heading" className="cf-page-title text-[17px]">
          Pending applications
        </h2>

        {rows.length === 0 ? (
          <div className="cf-stat-card px-6 py-12 text-center">
            <p className="text-[15px] font-medium text-[#1d1d1f]">No stores awaiting review</p>
            <p className="mt-2 text-[13px] text-[#86868b]">
              New seller onboarding submissions will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-4" role="list">
            {rows.map((store) => (
              <li key={store.id} className="cf-stat-card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">{store.name}</p>
                      {store.approvalPriority === "HIGH" ? (
                        <span className="cf-badge cf-badge-pending">High priority</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 font-mono text-[12px] text-[#86868b]">/{store.slug}</p>
                    <p className="mt-2 text-[13px] text-[#6e6e73]">
                      {store.owner.name} · {store.owner.email}
                    </p>
                    <p className="mt-1 text-[12px] text-[#86868b]">
                      Submitted {store.readiness.daysWaiting}d ago · Plan {store.plan}
                    </p>
                  </div>
                  <AdminActions
                    businessId={store.id}
                    storeName={store.name}
                    slug={store.slug}
                    isActive={false}
                  />
                </div>

                <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ReadinessPill label="Bank on file" ok={store.readiness.hasBank} />
                  <ReadinessPill label="Contact info" ok={store.readiness.hasContact} />
                  <ReadinessPill
                    label={`Catalog (${store.readiness.categoryCount} categories)`}
                    ok={store.readiness.hasCatalog}
                  />
                  <ReadinessPill label="Owner email" ok={Boolean(store.readiness.ownerEmail)} />
                </div>

                <div className="grid gap-4 border-t border-black/[0.06] px-5 py-4 sm:grid-cols-2">
                  <ApprovalDetailSection title="Bank on file" ok={store.readiness.hasBank}>
                    <DetailRow label="Bank" value={store.bankName} />
                    <DetailRow label="Account name" value={store.bankAccountName} />
                    <DetailRow label="Account number" value={store.bankAccountNumber} mono />
                  </ApprovalDetailSection>

                  <ApprovalDetailSection title="Contact info" ok={store.readiness.hasContact}>
                    <DetailRow label="Phone" value={store.phone} />
                    <DetailRow label="WhatsApp" value={store.whatsapp} />
                  </ApprovalDetailSection>

                  <ApprovalDetailSection title="Owner" ok={Boolean(store.readiness.ownerEmail)}>
                    <DetailRow label="Name" value={store.owner.name} />
                    <DetailRow label="Email" value={store.owner.email} />
                    <DetailRow
                      label="Signed up"
                      value={new Date(store.owner.createdAt).toLocaleDateString()}
                    />
                  </ApprovalDetailSection>

                  <ApprovalDetailSection title="Catalog setup" ok={store.readiness.hasCatalog}>
                    {store.catalog.templateLabel ? (
                      <DetailRow label="Template" value={store.catalog.templateLabel} />
                    ) : null}
                    <DetailRow
                      label="Categories"
                      value={
                        store.catalog.categories.length > 0
                          ? store.catalog.categories.join(", ")
                          : null
                      }
                    />
                    {store.catalog.tags.length > 0 ? (
                      <DetailRow label="Tags" value={store.catalog.tags.join(", ")} />
                    ) : null}
                    <DetailRow
                      label="Products"
                      value={`${store._count.products} (uploads unlock after approval)`}
                    />
                  </ApprovalDetailSection>
                </div>

                {store.description ? (
                  <p className="border-t border-black/[0.06] px-5 py-3 text-[13px] text-[#6e6e73]">
                    {store.description}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 border-t border-black/[0.06] bg-[#fbfbfd] px-5 py-4">
                  <StorefrontLink slug={store.slug} storeName={store.name} isActive={false} />
                  <select
                    aria-label={`Plan for ${store.name}`}
                    value={store.plan}
                    onChange={(e) =>
                      setRows((current) =>
                        current.map((row) =>
                          row.id === store.id
                            ? { ...row, plan: e.target.value as BusinessPlan }
                            : row,
                        ),
                      )
                    }
                    className="cf-input w-auto text-[12px]"
                  >
                    {VALID_APPROVAL_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={loadingId === store.id}
                    onClick={() => approve(store)}
                    className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === store.id}
                    onClick={() => setRejectId(rejectId === store.id ? null : store.id)}
                    className="cf-btn-inline cf-btn-inline-ghost text-[12px] text-[#9a2a2a]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Reject
                  </button>
                </div>

                {rejectId === store.id ? (
                  <div className="border-t border-black/[0.06] px-5 py-4">
                    <label htmlFor={`reject-${store.id}`} className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                      Rejection reason (shown to seller)
                    </label>
                    <textarea
                      id={`reject-${store.id}`}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="cf-input min-h-[72px] resize-y"
                      placeholder="e.g. Incomplete bank details — please update in Settings and resubmit."
                    />
                    <button
                      type="button"
                      disabled={loadingId === store.id}
                      onClick={() => reject(store)}
                      className="mt-3 rounded-full border border-[#9a2a2a]/30 bg-white px-4 py-2 text-[12px] font-medium text-[#9a2a2a] hover:bg-[#fff5f5] disabled:opacity-60"
                    >
                      Confirm rejection
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 ? (
        <section aria-labelledby="recent-decisions-heading">
          <h2 id="recent-decisions-heading" className="cf-page-title mb-4 text-[17px]">
            Recent decisions
          </h2>
          <div className="cf-table-shell overflow-x-auto">
            <table className="min-w-[640px]">
              <caption className="sr-only">Recent store approval decisions</caption>
              <thead>
                <tr>
                  <th scope="col">Store</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Decision</th>
                  <th scope="col">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <p className="font-medium text-[#1d1d1f]">{row.name}</p>
                      <StorefrontLink slug={row.slug} storeName={row.name} className="mt-1 text-[12px]" />
                    </td>
                    <td className="text-[13px] text-[#6e6e73]">{row.owner.email}</td>
                    <td>
                      <span
                        className={
                          row.approvalStatus === "APPROVED"
                            ? "cf-badge cf-badge-paid"
                            : "cf-badge cf-badge-cancelled"
                        }
                      >
                        {row.approvalStatus}
                      </span>
                      {row.rejectionReason ? (
                        <p className="mt-1 max-w-xs text-[12px] text-[#86868b]">{row.rejectionReason}</p>
                      ) : null}
                    </td>
                    <td className="text-[13px] tabular-nums text-[#86868b]">
                      {new Date(row.approvalReviewedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ReadinessPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`rounded-[12px] border px-3 py-2 text-[12px] ${
        ok
          ? "border-[#1a7f5a]/20 bg-[#f6fdf9] text-[#1a7f5a]"
          : "border-[#e8a317]/25 bg-[#fffdf5] text-[#9a6700]"
      }`}
    >
      <span className="font-medium">{ok ? "✓" : "○"}</span> {label}
    </div>
  );
}

function ApprovalDetailSection({
  title,
  ok,
  children,
}: {
  title: string;
  ok: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-[12px] border px-4 py-3 ${
        ok ? "border-black/[0.06] bg-[#fbfbfd]" : "border-[#e8a317]/20 bg-[#fffdf5]"
      }`}
    >
      <p className="text-[12px] font-semibold text-[#1d1d1f]">
        <span className={ok ? "text-[#1a7f5a]" : "text-[#9a6700]"}>{ok ? "✓" : "○"}</span>{" "}
        {title}
      </p>
      <dl className="mt-2 space-y-1.5">{children}</dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  const display = value?.trim() ? value.trim() : "Not provided";
  const missing = !value?.trim();

  return (
    <div className="flex flex-wrap gap-x-2 text-[12px]">
      <dt className="min-w-[6.5rem] text-[#86868b]">{label}</dt>
      <dd
        className={`min-w-0 flex-1 break-words ${mono ? "font-mono" : ""} ${
          missing ? "italic text-[#9a6700]" : "text-[#1d1d1f]"
        }`}
      >
        {display}
      </dd>
    </div>
  );
}