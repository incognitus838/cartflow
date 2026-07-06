import type { PromotionType } from "@prisma/client";

export type PromotionInput = {
  title: string;
  code: string;
  type: PromotionType;
  value?: number | null;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  giftProductId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
};

export type CartLineForPromo = {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
};

export type AppliedPromotion = {
  promotionId: string;
  code: string;
  type: PromotionType;
  title: string;
  discountAmount: number;
  giftLine?: {
    productId: string;
    title: string;
    quantity: number;
  };
};