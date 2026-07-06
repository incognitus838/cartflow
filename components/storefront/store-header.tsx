import Link from "next/link";
import { MessageCircle, PackageSearch, ShoppingBag } from "lucide-react";
import { CartNavLink } from "@/components/storefront/cart-nav-link";
import { LazyImage } from "@/components/storefront/lazy-image";
import { buildWhatsAppOrderUrl } from "@/lib/storefront/whatsapp";
import { storePath, trackOrderPath } from "@/lib/storefront/paths";

type StoreHeaderProps = {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  whatsapp: string | null;
  phone: string | null;
  showContactButton?: boolean;
  previewMode?: boolean;
};

export function StoreHeader({
  name,
  slug,
  description,
  logoUrl,
  whatsapp,
  phone,
  showContactButton = true,
  previewMode = false,
}: StoreHeaderProps) {
  const contact = whatsapp || phone;
  const chatUrl =
    !previewMode && showContactButton && contact
      ? buildWhatsAppOrderUrl(contact, `Hi ${name}! I have a question about your store.`)
      : null;

  const identity = (
    <>
      {logoUrl ? (
        <LazyImage
          src={logoUrl}
          alt={`${name} logo`}
          fill={false}
          width={40}
          height={40}
          sizes="40px"
          priority
          className="h-10 w-10 shrink-0 rounded-[12px] border border-[var(--store-border)] object-cover"
        />
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-white"
          style={{ backgroundColor: "var(--store-accent)" }}
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--store-text)] sm:text-[17px]">
          {name}
        </p>
        {description ? (
          <p className="truncate text-[12px] text-[var(--store-muted)] sm:text-[13px]">
            {description}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--store-border)] bg-[var(--store-header-bg)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        {previewMode ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">{identity}</div>
        ) : (
          <Link href={storePath(slug)} className="flex min-w-0 flex-1 items-center gap-3">
            {identity}
          </Link>
        )}

        <div className="flex shrink-0 items-center gap-2.5">
          {!previewMode ? (
            <Link
              href={trackOrderPath(slug)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--store-border)] bg-[var(--store-surface)] px-3 py-2 text-[13px] font-medium text-[var(--store-text)] transition-all hover:shadow-sm sm:px-4"
            >
              <PackageSearch className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Track order</span>
            </Link>
          ) : null}
          {previewMode ? (
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--store-border)] bg-[var(--store-surface)] p-2.5 text-[var(--store-muted)]"
              aria-hidden
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            </span>
          ) : (
            <CartNavLink storeSlug={slug} />
          )}
          {chatUrl ? (
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--store-border)] bg-[var(--store-surface)] px-4 py-2 text-[13px] font-medium text-[var(--store-text)] transition-all hover:shadow-sm"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Chat</span>
            </a>
          ) : previewMode && showContactButton && contact ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--store-border)] bg-[var(--store-surface)] px-4 py-2 text-[13px] font-medium text-[var(--store-muted)]">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Chat</span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}