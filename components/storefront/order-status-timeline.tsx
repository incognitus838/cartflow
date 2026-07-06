import { Check, Circle, Package, Truck, X } from "lucide-react";
import {
  getOrderTrackingSteps,
  type TrackingStep,
  type TrackingStepState,
} from "@/lib/orders/tracking";
import type { OrderStatus } from "@prisma/client";

type OrderStatusTimelineProps = {
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  hasReceipt: boolean;
  receiptSubmittedAt: Date | null;
  paymentRejectionReason?: string | null;
};

function StepIcon({ state }: { state: TrackingStepState }) {
  if (state === "complete") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--store-accent)] bg-white text-[var(--store-accent)]">
        <span className="absolute inset-0 animate-ping rounded-full border border-[var(--store-accent)] opacity-30" />
        <Circle className="h-3 w-3 fill-current" />
      </span>
    );
  }

  if (state === "cancelled") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--store-border)] bg-[var(--store-surface)] text-[var(--store-muted)]">
      <Circle className="h-3 w-3" />
    </span>
  );
}

function stepAccentIcon(step: TrackingStep) {
  if (step.key === "shipped") return <Truck className="h-3.5 w-3.5" strokeWidth={2} />;
  if (step.key === "processing" || step.key === "delivered") {
    return <Package className="h-3.5 w-3.5" strokeWidth={2} />;
  }
  return null;
}

export function OrderStatusTimeline({
  status,
  createdAt,
  updatedAt,
  hasReceipt,
  receiptSubmittedAt,
  paymentRejectionReason,
}: OrderStatusTimelineProps) {
  const steps = getOrderTrackingSteps({
    status,
    createdAt,
    updatedAt,
    paymentReceiptSubmittedAt: receiptSubmittedAt,
    paymentRejectionReason,
    paymentReceiptData: hasReceipt ? new Uint8Array([1]) : null,
  });

  return (
    <section className="rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-[var(--store-text)]">Order progress</h2>
      <p className="mt-1 text-xs text-[var(--store-muted)]">
        Updates automatically as your order moves forward.
      </p>

      <ol className="mt-5 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const accent = stepAccentIcon(step);

          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className={`absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2 ${
                    step.state === "complete"
                      ? "bg-emerald-300"
                      : step.state === "current"
                        ? "bg-[var(--store-accent)]/40"
                        : "bg-[var(--store-border)]"
                  }`}
                  aria-hidden
                />
              ) : null}

              <div className="relative z-10 shrink-0">
                <StepIcon state={step.state} />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      step.state === "upcoming"
                        ? "text-[var(--store-muted)]"
                        : step.state === "cancelled"
                          ? "text-red-700"
                          : "text-[var(--store-text)]"
                    }`}
                  >
                    {step.label}
                  </p>
                  {accent ? (
                    <span className="text-[var(--store-muted)]">{accent}</span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-[var(--store-muted)]">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}