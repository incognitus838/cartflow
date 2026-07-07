import "server-only";

import { prisma } from "@/lib/db";
import {
  applyTemplateToSettings,
  catalogCategoryNames,
  createCatalogCategoryId,
  emptyCatalogSettings,
  parseCatalogSettings,
  serializeCatalogSettings,
  type CatalogCategory,
  type CatalogSettings,
} from "@/lib/catalog/catalog-shared";

export type { CatalogCategory, CatalogSettings } from "@/lib/catalog/catalog-shared";
export {
  applyTemplateToSettings,
  catalogCategoryNames,
  emptyCatalogSettings,
  parseCatalogSettings,
  serializeCatalogSettings,
} from "@/lib/catalog/catalog-shared";

export async function listProductCategoryNames(businessId: string) {
  const rows = await prisma.product.findMany({
    where: { businessId },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return rows.map((row) => row.category).filter(Boolean);
}

export async function resolveCatalogSettings(businessId: string): Promise<CatalogSettings> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { catalogSettings: true },
  });

  const stored = parseCatalogSettings(business?.catalogSettings);
  if (stored.categories.length > 0) return stored;

  const fromProducts = await listProductCategoryNames(businessId);
  if (fromProducts.length === 0) return stored;

  return {
    ...stored,
    categories: fromProducts.map((name, index) => ({
      id: createCatalogCategoryId(),
      name,
      sortOrder: index,
    })),
  };
}

export async function saveCatalogSettings(businessId: string, settings: CatalogSettings) {
  const previous = await resolveCatalogSettings(businessId);
  const renames = new Map<string, string>();

  for (const prev of previous.categories) {
    const next = settings.categories.find((category) => category.id === prev.id);
    if (next && next.name !== prev.name) {
      renames.set(prev.name, next.name);
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const [from, to] of renames) {
      await tx.product.updateMany({
        where: { businessId, category: from },
        data: { category: to },
      });
    }

    const removed = previous.categories
      .filter((prev) => !settings.categories.some((next) => next.id === prev.id))
      .map((category) => category.name);

    for (const name of removed) {
      await tx.product.updateMany({
        where: { businessId, category: name },
        data: { category: "General" },
      });
    }

    await tx.business.update({
      where: { id: businessId },
      data: { catalogSettings: serializeCatalogSettings(settings) },
    });
  });

  return settings;
}