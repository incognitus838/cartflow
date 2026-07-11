import Link from "next/link";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { OrderIdCopyButton } from "@/components/storefront/order-id-copy-button";
import { trackOrderLookupPath } from "@/lib/storefront/paths";

type OrderPlacedHeroProps = {
  storeSlug: string;
  storeName: string;
  orderNumber: string;
  statusHeadline: string;
  statusMessage: string;
};

export function OrderPlacedHero({
  storeSlug,
  storeName,
  orderNumber,
  statusHeadline,
  statusMessage,
}: OrderPlacedHeroProps) {
  const trackHref = trackOrderLookupPath(storeSlug, orderNumber);

  return (
    <section className="mb-5 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4 text-center shadow-sm sm:mb-6 sm:p-6">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm sm:h-14 sm:w-14">
        <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
      </span>
      <h1 className="mt-3 text-xl font-bold tracking-tight text-emerald-950 sm:mt-4 sm:text-2xl">
        Order placed!
      </h1>
      <p className="mt-1.5 text-sm text-emerald-900">{statusMessage}</p>

      <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 sm:px-4">
        <p className="text-sm font-semibold text-amber-950">{statusHeadline}</p>
        <p className="mt-0.5 text-xs text-amber-900/90">{storeName} is reviewing your payment.</p>
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--store-muted)]">
          Your order ID
        </p>
        <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <code className="break-all rounded-xl bg-white px-3 py-2.5 font-mono text-base font-bold tracking-tight text-[var(--store-text)] shadow-sm ring-1 ring-emerald-200 sm:px-4 sm:text-lg">
            {orderNumber}
          </code>
          <OrderIdCopyButton orderNumber={orderNumber} />
        </div>
      </div>

      <Link
        href={trackHref}
        className="btn-primary mt-5 flex w-full items-center justify-center gap-2 px-5 py-3 text-[15px] sm:mx-auto sm:inline-flex sm:w-auto"
        style={{ backgroundColor: "var(--store-accent)" }}
      >
        <PackageSearch className="h-4 w-4" />
        Track order live
      </Link>
    </section>
  );
}