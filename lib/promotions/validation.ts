import type { PromotionType } from "@prisma/client";
import type { PromotionInput } from "@/lib/promotions/types";

const TYPES: PromotionType[] = ["PERCENT_OFF", "FIXED_OFF", "FREE_GIFT"];

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === null || value === "") return null;
  if (value === undefined) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function parseOptionalDate(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || null;
}

export function parsePromotionInput(body: unknown): PromotionInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const code = typeof data.code === "string" ? data.code.trim().toUpperCase() : "";
  const type = typeof data.type === "string" ? data.type : "";
  const isActive = data.isActive !== false;

  if (!title || title.length < 2) return "Promotion title is required.";
  if (!code || code.length < 3) return "Promo code must be at least 3 characters.";
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return "Code can only use letters, numbers, hyphens, and underscores.";
  }
  if (!TYPES.includes(type as PromotionType)) return "Invalid promotion type.";

  const value = parseOptionalNumber(data.value);
  const minOrderAmount = parseOptionalNumber(data.minOrderAmount);
  const maxUses = parseOptionalNumber(data.maxUses);
  const giftProductId =
    typeof data.giftProductId === "string" ? data.giftProductId.trim() || null : null;
  const startsAt = parseOptionalDate(data.startsAt);
  const endsAt = parseOptionalDate(data.endsAt);

  if (type === "PERCENT_OFF") {
    if (value == null || value <= 0 || value > 100) {
      return "Percentage discount must be between 1 and 100.";
    }
  }

  if (type === "FIXED_OFF") {
    if (value == null || value <= 0) return "Fixed discount amount must be greater than 0.";
  }

  if (type === "FREE_GIFT") {
    if (!giftProductId) return "Choose a gift product for this giveaway.";
  }

  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return "Max uses must be a positive whole number.";
  }

  if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
    return "End date must be after start date.";
  }

  return {
    title,
    code,
    type: type as PromotionType,
    value: type === "FREE_GIFT" ? null : value,
    minOrderAmount: minOrderAmount ?? null,
    maxUses: maxUses ?? null,
    giftProductId: type === "FREE_GIFT" ? giftProductId : null,
    startsAt: startsAt ?? null,
    endsAt: endsAt ?? null,
    isActive,
  };
}