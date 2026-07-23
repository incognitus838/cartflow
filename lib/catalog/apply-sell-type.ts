import "server-only";

import {
  createCatalogCategoryId,
  serializeCatalogSettings,
  type CatalogSettings,
} from "@/lib/catalog/catalog-shared";
import { getSellType, isSellTypeId } from "@/lib/catalog/sell-types";
import { prisma } from "@/lib/db";

export function settingsFromSellType(sellTypeId: string): CatalogSettings | string {
  if (!isSellTypeId(sellTypeId)) {
    return "Choose what you sell, or skip for now.";
  }
  const sell = getSellType(sellTypeId);
  if (!sell) return "Unknown store type.";

  return {
    categories: sell.categories.map((name, index) => ({
      id: createCatalogCategoryId(),
      name,
      sortOrder: index,
    })),
    tags: [...sell.tags],
    templateId: sell.templateId,
  };
}

/** Persist catalog from onboarding sell-type choice. No-op if skipped. */
export async function applySellTypeToBusiness(
  businessId: string,
  sellTypeId: string | null | undefined,
) {
  if (!sellTypeId) return null;
  const settings = settingsFromSellType(sellTypeId);
  if (typeof settings === "string") return null;

  await prisma.business.update({
    where: { id: businessId },
    data: { catalogSettings: serializeCatalogSettings(settings) },
  });

  return settings;
}
