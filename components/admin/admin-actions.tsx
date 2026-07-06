"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { ImpersonateButton } from "@/components/admin/impersonate-button";
import { StorefrontLink } from "@/components/admin/storefront-link";

type AdminActionsProps = {
  businessId: string;
  storeName: string;
  slug: string;
  isActive?: boolean;
  orderId?: string;
  showStorefront?: boolean;
  disabled?: boolean;
};

/** Labeled admin row actions — View order, open seller dashboard, open storefront. */
export function AdminActions({
  businessId,
  storeName,
  slug,
  isActive = true,
  orderId,
  showStorefront = true,
  disabled = false,
}: AdminActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {orderId ? (
        <Link
          href={`/admin/orders/${orderId}`}
          className="cf-btn-inline cf-btn-inline-ghost"
          title={`View order ${orderId}`}
        >
          <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
          View
        </Link>
      ) : null}
      <ImpersonateButton
        businessId={businessId}
        storeName={storeName}
        disabled={disabled}
      />
      {showStorefront ? (
        <StorefrontLink
          slug={slug}
          storeName={storeName}
          isActive={isActive}
          className="cf-btn-inline cf-btn-inline-ghost text-[11px]"
        >
          Storefront
        </StorefrontLink>
      ) : null}
    </div>
  );
}