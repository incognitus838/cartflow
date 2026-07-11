import Link from "next/link";
import { Suspense } from "react";
import { TrackOrderForm } from "@/components/storefront/track-order-form";
import { storePath } from "@/lib/storefront/paths";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type TrackPageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ order?: string }>;
};

function TrackFormFallback() {
  return (
    <div className="rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-8 animate-pulse">
      <div className="h-6 w-48 rounded bg-[var(--store-border)]" />
      <div className="mt-6 h-12 rounded-xl bg-[var(--store-border)]" />
    </div>
  );
}

export default async function TrackOrderPage({ params, searchParams }: TrackPageProps) {
  const { storeSlug } = await params;
  const { order } = await searchParams;
  const store = await resolveStorefront(storeSlug);

  return (
    <div className="mx-auto max-w-2xl">
      <Suspense fallback={<TrackFormFallback />}>
        <TrackOrderForm
          storeSlug={store.slug}
          storeName={store.name}
          initialOrder={order?.trim().toUpperCase()}
        />
      </Suspense>

      <p className="mt-6 text-center text-sm text-[var(--store-muted)]">
        <Link
          href={storePath(store.slug)}
          className="font-medium text-[var(--store-text)] underline-offset-2 hover:underline"
        >
          Back to {store.name}
        </Link>
      </p>
    </div>
  );
}