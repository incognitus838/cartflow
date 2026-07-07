import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";

export type StoreApprovalSnapshot = {
  approvalStatus: StoreApprovalStatus;
  isActive: boolean;
  rejectionReason?: string | null;
  resubmissionAllowed?: boolean;
  submittedAt?: Date | null;
  approvalReviewedAt?: Date | null;
};

/** Store is visible on public storefront routes. */
export function isStorePubliclyLive(store: StoreApprovalSnapshot) {
  return store.approvalStatus === "APPROVED" && store.isActive;
}

export const PRODUCTS_LOCKED_UNTIL_APPROVAL =
  "Your store must be approved before you can add or edit products.";

export const LIVE_STORE_LOCKED_UNTIL_APPROVAL =
  "This feature unlocks once your store is approved.";

/** Seller can create/edit products and run a live storefront. */
export function isLiveStore(store: StoreApprovalSnapshot) {
  return store.approvalStatus === "APPROVED";
}

export function canManageProducts(store: StoreApprovalSnapshot) {
  return isLiveStore(store);
}

export function isPendingApproval(store: StoreApprovalSnapshot) {
  return store.approvalStatus === "PENDING";
}

/** Dashboard routes available while approvalStatus is PENDING (owner onboarding). */
export const PENDING_APPROVAL_NAV_HREFS = [
  "/dashboard",
  "/dashboard/products",
  "/dashboard/products/new",
  "/dashboard/catalog",
  "/dashboard/stores",
  "/dashboard/settings",
] as const;

export function isNavAllowedDuringPending(href: string) {
  return PENDING_APPROVAL_NAV_HREFS.some(
    (allowed) => href === allowed || href.startsWith(`${allowed}/`),
  );
}

export type PendingSetupChecklist = {
  hasBank: boolean;
  hasContact: boolean;
  hasCategories: boolean;
  submittedAt: Date | null;
};

export function buildPendingSetupChecklist(input: {
  bankAccountNumber: string | null;
  phone: string | null;
  whatsapp: string | null;
  categoryCount: number;
  submittedAt: Date | null;
}): PendingSetupChecklist {
  return {
    hasBank: Boolean(input.bankAccountNumber?.trim()),
    hasContact: Boolean(input.phone?.trim() || input.whatsapp?.trim()),
    hasCategories: input.categoryCount > 0,
    submittedAt: input.submittedAt,
  };
}

export function sellerApprovalMessage(store: StoreApprovalSnapshot) {
  if (store.approvalStatus === "PENDING") {
    return {
      tone: "pending" as const,
      title: "Store under review",
      body: "Your application is with our team. Finish your setup checklist below — you can update bank details, contact info, and catalog categories. Products, orders, and your public storefront unlock after approval (usually within 24 hours).",
    };
  }
  if (store.approvalStatus === "REJECTED") {
    return {
      tone: "rejected" as const,
      title: "Application not approved",
      body:
        store.rejectionReason ??
        "Your store application was not approved. Contact support if you believe this was a mistake.",
      canResubmit: store.resubmissionAllowed ?? false,
    };
  }
  return null;
}

export type ApprovalReadiness = {
  hasBank: boolean;
  hasContact: boolean;
  productCount: number;
  categoryCount: number;
  hasCatalog: boolean;
  ownerEmail: string;
  daysWaiting: number;
};

export function computeReadiness(input: {
  bankAccountNumber: string | null;
  phone: string | null;
  whatsapp: string | null;
  productCount: number;
  categoryCount: number;
  ownerEmail: string;
  submittedAt: Date | null;
  createdAt: Date;
}): ApprovalReadiness {
  const submitted = input.submittedAt ?? input.createdAt;
  const daysWaiting = Math.floor((Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24));

  return {
    hasBank: Boolean(input.bankAccountNumber?.trim()),
    hasContact: Boolean(input.phone?.trim() || input.whatsapp?.trim()),
    productCount: input.productCount,
    categoryCount: input.categoryCount,
    hasCatalog: input.categoryCount > 0,
    ownerEmail: input.ownerEmail,
    daysWaiting,
  };
}

export const APPROVAL_STATUS_BADGE: Record<StoreApprovalStatus, string> = {
  PENDING: "cf-badge cf-badge-pending",
  APPROVED: "cf-badge cf-badge-paid",
  REJECTED: "cf-badge cf-badge-cancelled",
};

export const APPROVAL_STATUS_LABEL: Record<StoreApprovalStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const VALID_APPROVAL_PLANS: BusinessPlan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];