import Link from "next/link";
import { Check, Circle, Clock } from "lucide-react";
import type { PendingSetupChecklist } from "@/lib/business/approval";

type PendingApprovalOverviewProps = {
  storeName: string;
  checklist: PendingSetupChecklist;
};

function ChecklistRow({
  ok,
  label,
  href,
  action,
}: {
  ok: boolean;
  label: string;
  href: string;
  action: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white px-4 py-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          ok ? "bg-[#1a7f5a]/10 text-[#1a7f5a]" : "bg-[#f5f5f7] text-[#86868b]"
        }`}
        aria-hidden
      >
        {ok ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#1d1d1f]">{label}</p>
        {!ok ? (
          <Link href={href} className="mt-1 inline-block text-[12px] font-medium text-[#b8956a] hover:underline">
            {action} →
          </Link>
        ) : (
          <p className="mt-0.5 text-[12px] text-[#86868b]">Complete</p>
        )}
      </div>
    </li>
  );
}

export function PendingApprovalOverview({ storeName, checklist }: PendingApprovalOverviewProps) {
  const setupComplete = checklist.hasBank && checklist.hasContact && checklist.hasCategories;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--cf-radius-lg)] border border-[#e8a317]/25 bg-[#fffdf5] p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8a317]/15 text-[#9a6700]">
            <Clock className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
              {storeName} is awaiting approval
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6e6e73]">
              Your store is not public yet. Complete the setup below so admins can review your
              application. Products, orders, promotions, and your storefront link unlock after
              approval.
            </p>
            {checklist.submittedAt ? (
              <p className="mt-2 text-[12px] text-[#86868b]">
                Submitted {checklist.submittedAt.toLocaleDateString()} · Reviews usually within 24 hours
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="setup-checklist-heading">
        <h2 id="setup-checklist-heading" className="cf-page-title mb-3 text-[15px]">
          Setup checklist
        </h2>
        <ul className="space-y-2" role="list">
          <ChecklistRow
            ok={checklist.hasBank}
            label="Bank details on file"
            href="/dashboard/settings"
            action="Add bank details"
          />
          <ChecklistRow
            ok={checklist.hasContact}
            label="Contact info (phone or WhatsApp)"
            href="/dashboard/settings"
            action="Add contact info"
          />
          <ChecklistRow
            ok={checklist.hasCategories}
            label="Catalog categories configured"
            href="/dashboard/products?tab=structure"
            action="Set up categories"
          />
          <li className="flex items-start gap-3 rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-[#fbfbfd] px-4 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8a317]/15 text-[#9a6700]">
              <Clock className="h-3 w-3" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-[#1d1d1f]">Platform review</p>
              <p className="mt-0.5 text-[12px] text-[#86868b]">
                {setupComplete
                  ? "You're ready — we'll notify you when approved."
                  : "Finish the items above, then our team will review your store."}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="cf-stat-card">
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Locked until approval</h2>
        <p className="mt-2 text-[13px] text-[#86868b]">
          Adding products, processing orders, promotions, analytics, storefront preview, and sharing
          your public store link.
        </p>
      </section>
    </div>
  );
}