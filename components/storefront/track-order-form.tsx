"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { orderConfirmationPath } from "@/lib/storefront/paths";

type TrackOrderFormProps = {
  storeSlug: string;
  storeName: string;
};

export function TrackOrderForm({ storeSlug, storeName }: TrackOrderFormProps) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedId = orderNumber.trim().toUpperCase();
    const trimmedPhone = customerPhone.trim();

    if (!trimmedId) {
      toast.error("Enter your order ID.");
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 7) {
      toast.error("Enter the phone number used at checkout.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/storefront/${storeSlug}/orders/${encodeURIComponent(trimmedId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPhone: trimmedPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Order not found. Check your ID and phone number.");
        return;
      }

      router.push(orderConfirmationPath(storeSlug, data.order.orderNumber));
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-5 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: "var(--store-accent)" }}
        >
          <PackageSearch className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--store-text)] sm:text-2xl">
            Track your order
          </h1>
          <p className="mt-1 text-sm text-[var(--store-muted)]">
            Enter your order ID and phone number to see live progress from {storeName}.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="orderNumber" className="mb-1.5 block text-sm font-medium text-[var(--store-text)]">
            Order ID
          </label>
          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. CF-20260706-0001"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-[var(--store-border)] bg-white px-4 py-3 font-mono text-sm text-[var(--store-text)] outline-none transition-shadow placeholder:font-sans placeholder:text-[var(--store-muted)] focus:ring-2 focus:ring-[var(--store-accent)]/30"
          />
          <p className="mt-1.5 text-xs text-[var(--store-muted)]">
            Found on your confirmation page or checkout receipt.
          </p>
        </div>

        <div>
          <label htmlFor="customerPhone" className="mb-1.5 block text-sm font-medium text-[var(--store-text)]">
            Phone number
          </label>
          <input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="08012345678"
            autoComplete="tel"
            className="w-full rounded-xl border border-[var(--store-border)] bg-white px-4 py-3 text-sm text-[var(--store-text)] outline-none transition-shadow placeholder:text-[var(--store-muted)] focus:ring-2 focus:ring-[var(--store-accent)]/30"
          />
          <p className="mt-1.5 text-xs text-[var(--store-muted)]">
            Must match the number you used when placing the order.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-6 w-full py-3.5 text-[15px]"
        style={{ backgroundColor: "var(--store-accent)" }}
      >
        {loading ? "Looking up order…" : "Track order"}
      </button>
    </form>
  );
}