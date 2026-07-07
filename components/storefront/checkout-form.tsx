"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/storefront/cart-provider";
import { ManualPaymentInstructions } from "@/components/storefront/manual-payment-instructions";
import { PaymentReceiptField } from "@/components/storefront/payment-receipt-field";
import type { AppliedPromo } from "@/components/storefront/promo-code-input";
import type { CartLine } from "@/lib/cart/types";
import type { ManualPaymentAccount } from "@/lib/payments/manual";
import { orderConfirmationPath } from "@/lib/storefront/paths";

type CheckoutFormProps = {
  storeSlug: string;
  lines: CartLine[];
  currency: string;
  deliveryFee: number;
  paymentAccount: ManualPaymentAccount | null;
  appliedPromo?: AppliedPromo | null;
};

export function CheckoutForm({
  storeSlug,
  lines,
  currency,
  deliveryFee,
  paymentAccount,
  appliedPromo,
}: CheckoutFormProps) {
  const router = useRouter();
  const { clear } = useCart();
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

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("customerName", customerName);
      formData.append("customerPhone", customerPhone);
      formData.append("customerAddress", customerAddress);
      formData.append("email", email);
      formData.append("notes", notes);
      if (appliedPromo?.code) formData.append("promotionCode", appliedPromo.code);
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
        return;
      }

      clear();
      router.push(
        orderConfirmationPath(storeSlug, data.order.orderNumber, { justPlaced: true }),
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
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
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--cf-border-strong)] bg-white p-5 sm:p-6"
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
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5"
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
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5"
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
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5"
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
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5"
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
              className="w-full rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--cf-black)] focus:ring-2 focus:ring-black/5"
              placeholder="Deliver after 5pm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !paymentAccount || !receiptFile}
          className="btn-primary mt-6 w-full py-3"
        >
          {loading ? "Placing order…" : "Place order"}
        </button>

        <p className="mt-3 text-center text-xs text-[var(--cf-gray-600)]">
          Receipt is saved securely to your order — not on server disk — for seller review.
        </p>
      </form>
    </div>
  );
}