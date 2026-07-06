import type { Promotion, Product } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import type { AppliedPromotion, CartLineForPromo } from "@/lib/promotions/types";

type PromotionWithGift = Promotion & {
  giftProduct: Pick<Product, "id" | "title" | "status" | "stock"> | null;
};

function isPromotionLive(promotion: Promotion, now = new Date()) {
  if (!promotion.isActive) return false;
  if (promotion.startsAt && promotion.startsAt > now) return false;
  if (promotion.endsAt && promotion.endsAt < now) return false;
  if (promotion.maxUses != null && promotion.usedCount >= promotion.maxUses) return false;
  return true;
}

export async function findPromotionByCode(businessId: string, code: string) {
  return prisma.promotion.findFirst({
    where: { businessId, code: code.trim().toUpperCase() },
    include: {
      giftProduct: {
        select: { id: true, title: true, status: true, stock: true },
      },
    },
  });
}

export function applyPromotionToCart(
  promotion: PromotionWithGift,
  lines: CartLineForPromo[],
): AppliedPromotion {
  if (!isPromotionLive(promotion)) {
    throw new Error("This promo code is not active.");
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const minOrder = promotion.minOrderAmount != null ? toNumber(promotion.minOrderAmount) : 0;

  if (subtotal < minOrder) {
    throw new Error(
      minOrder > 0
        ? `Spend at least ${minOrder.toLocaleString()} to use this code.`
        : "Your cart does not qualify for this offer.",
    );
  }

  if (promotion.type === "PERCENT_OFF") {
    const percent = toNumber(promotion.value);
    const discountAmount = Math.min(subtotal, (subtotal * percent) / 100);

    return {
      promotionId: promotion.id,
      code: promotion.code,
      type: promotion.type,
      title: promotion.title,
      discountAmount: roundMoney(discountAmount),
    };
  }

  if (promotion.type === "FIXED_OFF") {
    const fixed = toNumber(promotion.value);
    const discountAmount = Math.min(subtotal, fixed);

    return {
      promotionId: promotion.id,
      code: promotion.code,
      type: promotion.type,
      title: promotion.title,
      discountAmount: roundMoney(discountAmount),
    };
  }

  const gift = promotion.giftProduct;
  if (!gift || gift.status !== "ACTIVE") {
    throw new Error("The giveaway product is no longer available.");
  }
  if (gift.stock < 1) {
    throw new Error("The giveaway product is out of stock.");
  }

  return {
    promotionId: promotion.id,
    code: promotion.code,
    type: promotion.type,
    title: promotion.title,
    discountAmount: 0,
    giftLine: {
      productId: gift.id,
      title: gift.title,
      quantity: 1,
    },
  };
}

export async function applyPromotionCode(
  businessId: string,
  code: string,
  lines: CartLineForPromo[],
): Promise<AppliedPromotion> {
  const promotion = await findPromotionByCode(businessId, code);
  if (!promotion) throw new Error("Invalid promo code.");
  return applyPromotionToCart(promotion, lines);
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}