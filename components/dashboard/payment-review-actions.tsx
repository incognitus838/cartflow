"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type PaymentReviewActionsProps = {
  orderId: string;
  reviewUrl?: string;
  onComplete?: (action: "approve" | "reject") => void;
};

export function PaymentReviewActions({ orderId, reviewUrl, onComplete }: PaymentReviewActionsProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const endpoint = reviewUrl ?? `/api/orders/${orderId}/payment-review`;

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not approve payment");
        return;
      }

      toast.success("Payment approved — order marked as paid.");
      onComplete?.("approve");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    const reason = rejectReason.trim();
    if (reason.length < 3) {
      toast.error("Enter a reason for the customer (at least 3 characters).");
      return;
    }

    setRejecting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not reject payment");
        return;
      }

      toast.success("Payment rejected — customer can upload a new receipt.");
      setShowRejectForm(false);
      setRejectReason("");
      onComplete?.("reject");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={approving || rejecting}
          onClick={handleApprove}
          className="btn-primary inline-flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {approving ? "Approving…" : "Approve payment"}
        </button>
        <button
          type="button"
          disabled={approving || rejecting}
          onClick={() => setShowRejectForm((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
          Reject payment
        </button>
      </div>

      {showRejectForm ? (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
          <label htmlFor="reject-reason" className="mb-1.5 block text-sm font-medium text-red-900">
            Rejection reason <span className="text-red-600">*</span>
          </label>
          <p className="mb-2 text-xs text-red-800/80">
            The customer will see this reason and can upload a new payment proof.
          </p>
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="e.g. Amount does not match order total, or transfer reference is unclear."
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={rejecting}
              onClick={handleReject}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {rejecting ? "Rejecting…" : "Confirm rejection"}
            </button>
            <button
              type="button"
              disabled={rejecting}
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}