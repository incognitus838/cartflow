import { ExternalLink } from "lucide-react";
import { absoluteStoreUrl } from "@/lib/storefront/paths";

type StorefrontLinkProps = {
  slug: string;
  storeName?: string;
  isActive?: boolean;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
};

export function StorefrontLink({
  slug,
  storeName,
  isActive = true,
  className = "cf-btn-inline cf-btn-inline-ghost",
  showIcon = true,
  children,
}: StorefrontLinkProps) {
  const href = absoluteStoreUrl(slug);
  const label = children ?? `/${slug}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={
        isActive
          ? `Open ${storeName ?? slug} storefront in new tab`
          : `${storeName ?? slug} is hidden — storefront may be unavailable`
      }
      className={`${className} ${!isActive ? "opacity-70" : ""}`}
    >
      {showIcon ? <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
      {label}
      {!isActive ? (
        <span className="cf-badge cf-badge-cancelled ml-1">Hidden</span>
      ) : null}
    </a>
  );
}