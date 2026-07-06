"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { trackOrderPath } from "@/lib/storefront/paths";

type OrderIdCardProps = {
  storeSlug: string;
  orderNumber: string;
};

export function OrderIdCard({ storeSlug, orderNumber }: OrderIdCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success("Order ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the ID manually");
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--store-muted)]">
        Your order ID
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <code className="rounded-lg bg-white px-3 py-2 font-mono text-base font-semibold tracking-tight text-[var(--store-text)] shadow-sm ring-1 ring-[var(--store-border)]">
          {orderNumber}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--store-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--store-text)] transition-colors hover:bg-[var(--store-header-bg)]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy ID
            </>
          )}
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--store-muted)]">
        Save this page or your order ID to check progress later. You can also{" "}
        <a
          href={trackOrderPath(storeSlug)}
          className="font-medium text-[var(--store-text)] underline-offset-2 hover:underline"
        >
          track your order
        </a>{" "}
        anytime with your ID and phone number.
      </p>
    </section>
  );
}