"use client";

import { useState } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import type { ManualPaymentAccount } from "@/lib/payments/manual";
import { formatCurrency } from "@/lib/utils";

type ManualPaymentInstructionsProps = {
  account: ManualPaymentAccount | null;
  total: number;
  currency: string;
  orderNumber?: string;
};

export function ManualPaymentInstructions({
  account,
  total,
  currency,
  orderNumber,
}: ManualPaymentInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!account) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">Payments not set up yet</h2>
            <p className="mt-1 text-xs text-amber-800">
              This store has not added bank transfer details. Checkout is unavailable until the
              seller completes setup. Please contact them on WhatsApp.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const fields = [
    { key: "bank", label: "Bank", value: account.bankName },
    { key: "name", label: "Account name", value: account.accountName },
    { key: "number", label: "Account number", value: account.accountNumber, mono: true },
  ];

  return (
    <section className="rounded-2xl border border-[var(--cf-border-strong)] bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-[var(--cf-black)]">Pay by bank transfer</h2>
      <p className="mt-1 text-xs text-[var(--cf-gray-600)]">{account.instructions}</p>

      <div className="mt-4 rounded-xl bg-[var(--cf-bg)] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--cf-gray-400)]">
          Amount to pay
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cf-black)]">
          {formatCurrency(total, currency)}
        </p>
        {orderNumber ? (
          <p className="mt-2 text-xs text-[var(--cf-gray-600)]">
            Use <span className="font-mono font-medium">{orderNumber}</span> as your transfer reference.
          </p>
        ) : null}
      </div>

      <dl className="mt-4 space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <dt className="text-xs text-[var(--cf-gray-400)]">{field.label}</dt>
              <dd
                className={`truncate text-sm font-medium text-[var(--cf-black)] ${
                  field.mono ? "font-mono tracking-wide" : ""
                }`}
              >
                {field.value}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => copyValue(field.key, field.value)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--cf-border)] px-3 py-1.5 text-xs font-medium text-[var(--cf-gray-600)] transition-colors hover:bg-[var(--cf-bg)]"
            >
              {copiedField === field.key ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        ))}
      </dl>
    </section>
  );
}