import type { StoreApprovalStatus } from "@prisma/client";

export type AccessibleStore = {
  id: string;
  name: string;
  slug: string;
  access: "owner" | "staff";
  accessPreset: string | null;
  approvalStatus: StoreApprovalStatus;
  isActive: boolean;
};

export type OwnedStoreDetail = {
  id: string;
  name: string;
  slug: string;
  approvalStatus: StoreApprovalStatus;
  isActive: boolean;
  createdAt: Date;
  productCount: number;
};