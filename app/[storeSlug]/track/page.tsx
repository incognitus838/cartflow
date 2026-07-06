import Link from "next/link";
import { TrackOrderForm } from "@/components/storefront/track-order-form";
import { storePath } from "@/lib/storefront/paths";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type TrackPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TrackOrderPage({ params }: TrackPageProps) {
  const { storeSlug } = await params;
  const store = await resolveStorefront(storeSlug);

  return (
    <div className="mx-auto max-w-lg">
      <TrackOrderForm storeSlug={store.slug} storeName={store.name} />

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