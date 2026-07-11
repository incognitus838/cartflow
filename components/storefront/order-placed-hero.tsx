import Link from "next/link";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { OrderIdCopyButton } from "@/components/storefront/order-id-copy-button";
import { trackOrderLookupPath } from "@/lib/storefront/paths";

type OrderPlacedHeroProps = {
  storeSlug: string;
  storeName: string;
  orderNumber: string;
};

/** Server-rendered success state — order ID visible immediately after checkout. */
export function OrderPlacedHero({ storeSlug, storeName, orderNumber }: OrderPlacedHeroProps) {
  const trackHref = trackOrderLookupPath(storeSlug, orderNumber);

  return (
    <section className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center shadow-sm sm:p-7">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-emerald-950">Order placed!</h1>
      <p className="mt-2 text-sm text-emerald-900">
        {storeName} received your order. Save your order ID below to track progress later.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <code className="rounded-xl bg-white px-4 py-3 font-mono text-lg font-bold tracking-tight text-[var(--store-text)] shadow-sm ring-1 ring-emerald-200">
          {orderNumber}
        </code>
        <OrderIdCopyButton orderNumber={orderNumber} />
      </div>

      <Link
        href={trackHref}
        className="btn-primary mt-5 inline-flex items-center gap-2 px-6 py-3 text-[15px]"
        style={{ backgroundColor: "var(--store-accent)" }}
      >
        <PackageSearch className="h-4 w-4" />
        Track order live
      </Link>
    </section>
  );
}