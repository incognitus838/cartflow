import type { OrderPaymentEventAction } from "@prisma/client";
import { CheckCircle2, FileUp, XCircle } from "lucide-react";
import { PAYMENT_EVENT_LABELS } from "@/lib/orders/payment-event-labels";

export type PaymentReviewEvent = {
  id: string;
  action: OrderPaymentEventAction;
  reason: string | null;
  actorName: string | null;
  createdAt: string | Date;
};

function EventIcon({ action }: { action: OrderPaymentEventAction }) {
  if (action === "PAYMENT_APPROVED") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }
  if (action === "PAYMENT_REJECTED") {
    return <XCircle className="h-4 w-4 text-red-600" />;
  }
  return <FileUp className="h-4 w-4 text-amber-600" />;
}

export function PaymentReviewHistory({ events }: { events: PaymentReviewEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500">No payment review history yet.</p>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0">
              <EventIcon action={event.action} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">
                  {PAYMENT_EVENT_LABELS[event.action]}
                </p>
                <span className="text-xs text-slate-500">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
              {event.actorName ? (
                <p className="mt-0.5 text-xs text-slate-500">By {event.actorName}</p>
              ) : null}
              {event.reason ? (
                <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                  {event.reason}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}