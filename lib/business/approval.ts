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

export function sellerApprovalMessage(store: StoreApprovalSnapshot) {
  if (store.approvalStatus === "PENDING") {
    return {
      tone: "pending" as const,
      title: "Awaiting platform approval",
      body: "Your store application is in review. You'll get full access once an admin approves it — usually within 24 hours.",
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
  hasCatalog: boolean;
  ownerEmail: string;
  daysWaiting: number;
};

export function computeReadiness(input: {
  bankAccountNumber: string | null;
  phone: string | null;
  whatsapp: string | null;
  productCount: number;
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
    hasCatalog: input.productCount > 0,
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