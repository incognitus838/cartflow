"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ManualPaymentInstructions } from "@/components/storefront/manual-payment-instructions";
import { PaymentReceiptField } from "@/components/storefront/payment-receipt-field";
import type { AppliedPromo } from "@/components/storefront/promo-code-input";
import type { CartLine } from "@/lib/cart/types";
import type { ManualPaymentAccount } from "@/lib/payments/manual";
import { orderConfirmationPath } from "@/lib/storefront/paths";
import { saveTrackSession } from "@/lib/storefront/track-session";

type CheckoutFormProps = {
  storeSlug: string;
  lines: CartLine[];
  currency: string;
  deliveryFee: number;
  deliveryZoneId?: string | null;
  requiresZoneSelection?: boolean;
  paymentAccount: ManualPaymentAccount | null;
  appliedPromo?: AppliedPromo | null;
  onPlacingChange?: (placing: boolean) => void;
};

export function CheckoutForm({
  storeSlug,
  lines,
  currency,
  deliveryFee,
  deliveryZoneId,
  requiresZoneSelection = false,
  paymentAccount,
  appliedPromo,
  onPlacingChange,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!paymentAccount) {
      toast.error("This store has not set up bank payments yet.");
      return;
    }

    if (!receiptFile) {
      toast.error("Upload your payment receipt before placing the order.");
      return;
    }

    if (requiresZoneSelection) {
      toast.error("Choose a delivery location before placing your order.");
      return;
    }

    setLoading(true);
    onPlacingChange?.(true);

    try {
      const formData = new FormData();
      formData.append("customerName", customerName);
      formData.append("customerPhone", customerPhone);
      formData.append("customerAddress", customerAddress);
      formData.append("email", email);
      formData.append("notes", notes);
      if (appliedPromo?.code) formData.append("promotionCode", appliedPromo.code);
      if (deliveryZoneId) formData.append("deliveryZoneId", deliveryZoneId);
      formData.append(
        "items",
        JSON.stringify(
          lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          })),
        ),
      );
      formData.append("receipt", receiptFile);

      const res = await fetch(`/api/storefront/${storeSlug}/checkout`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not place order");
        onPlacingChange?.(false);
        return;
      }

      const orderNumber = data.order?.orderNumber;
      if (!orderNumber) {
        toast.error("Order placed but confirmation failed. Contact the store.");
        onPlacingChange?.(false);
        return;
      }

      saveTrackSession(storeSlug, orderNumber);
      const confirmationUrl = orderConfirmationPath(storeSlug, orderNumber, { justPlaced: true });
      window.location.assign(confirmationUrl);
    } catch {
      toast.error("Something went wrong. Try again.");
      onPlacingChange?.(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ManualPaymentInstructions account={paymentAccount} total={total} currency={currency} />

      <section className="rounded-2xl border border-[var(--cf-border-strong)] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--cf-black)]">Payment receipt</h2>
        <p className="mt-1 text-xs text-[var(--cf-gray-600)]">
          Transfer the amount above, then upload your bank confirmation screenshot or PDF.
          Your order is only submitted once proof is attached.
        </p>
        <div className="mt-4">
          <PaymentReceiptField file={receiptFile} onFileChange={setReceiptFile} />
        </div>
      </section>

      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--cf-border-strong)] bg-white p-5 pb-28 sm:pb-6 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-[var(--cf-black)]">Your details</h2>
        <p className="mt-1 text-xs text-[var(--cf-gray-600)]">
          Guest checkout — no account needed.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cf-black)]">
              Full name
            </label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-base outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5 sm:text-sm"
              placeholder="Chioma Nwosu"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cf-black)]">
              Phone / WhatsApp
            </label>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-base outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5 sm:text-sm"
              placeholder="+2348012345678"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cf-black)]">
              Delivery address <span className="text-[var(--cf-gray-400)]">(optional)</span>
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-base outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5 sm:text-sm"
              placeholder="Street, area, city"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cf-black)]">
              Email <span className="text-[var(--cf-gray-400)]">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-base outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cf-black)]">
              Order notes <span className="text-[var(--cf-gray-400)]">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-base outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5 sm:text-sm"
              placeholder="Deliver after 5pm"
            />
          </div>
        </div>

        <div className="mt-6 sm:mt-6">
          <button
            type="submit"
            disabled={loading || !paymentAccount || !receiptFile || requiresZoneSelection}
            className="btn-primary hidden w-full py-3 sm:block"
          >
            {loading ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 hidden text-center text-xs text-[var(--cf-gray-600)] sm:block">
            Receipt is saved securely to your order — not on server disk — for seller review.
          </p>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 p-4 backdrop-blur-xl sm:hidden">
        <button
          type="submit"
          form="checkout-form"
          disabled={loading || !paymentAccount || !receiptFile || requiresZoneSelection}
          className="btn-primary w-full py-3.5 text-[15px]"
        >
          {loading ? "Placing order…" : "Place order"}
        </button>
        <p className="mt-2 text-center text-[11px] text-[var(--cf-gray-600)]">
          Upload receipt above before placing your order.
        </p>
      </div>
    </div>
  );
}