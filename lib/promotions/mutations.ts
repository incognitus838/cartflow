import { prisma } from "@/lib/db";
import type { PromotionInput } from "@/lib/promotions/types";

export async function createPromotion(businessId: string, input: PromotionInput) {
  const existing = await prisma.promotion.findFirst({
    where: { businessId, code: input.code },
    select: { id: true },
  });
  if (existing) throw new Error("A promotion with this code already exists.");

  if (input.giftProductId) {
    const gift = await prisma.product.findFirst({
      where: { id: input.giftProductId, businessId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!gift) throw new Error("Gift product not found or not active.");
  }

  return prisma.promotion.create({
    data: {
      businessId,
      title: input.title,
      code: input.code,
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxUses: input.maxUses,
      giftProductId: input.giftProductId,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      isActive: input.isActive,
    },
    include: {
      giftProduct: { select: { id: true, title: true } },
    },
  });
}

export async function updatePromotion(
  businessId: string,
  promotionId: string,
  input: PromotionInput,
) {
  const existing = await prisma.promotion.findFirst({
    where: { id: promotionId, businessId },
    select: { id: true, code: true },
  });
  if (!existing) throw new Error("Promotion not found.");

  const codeConflict = await prisma.promotion.findFirst({
    where: { businessId, code: input.code, NOT: { id: promotionId } },
    select: { id: true },
  });
  if (codeConflict) throw new Error("A promotion with this code already exists.");

  if (input.giftProductId) {
    const gift = await prisma.product.findFirst({
      where: { id: input.giftProductId, businessId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!gift) throw new Error("Gift product not found or not active.");
  }

  return prisma.promotion.update({
    where: { id: promotionId },
    data: {
      title: input.title,
      code: input.code,
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxUses: input.maxUses,
      giftProductId: input.giftProductId,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      isActive: input.isActive,
    },
    include: {
      giftProduct: { select: { id: true, title: true } },
    },
  });
}

export async function deletePromotion(businessId: string, promotionId: string) {
  const existing = await prisma.promotion.findFirst({
    where: { id: promotionId, businessId },
    select: { id: true },
  });
  if (!existing) throw new Error("Promotion not found.");

  await prisma.promotion.delete({ where: { id: promotionId } });
}