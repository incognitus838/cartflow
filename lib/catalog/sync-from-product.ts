import type { Prisma } from "@prisma/client";
import { parseProductMetadata } from "@/lib/products/metadata";
import {
  parseCatalogSettings,
  serializeCatalogSettings,
  type CatalogSettings,
} from "@/lib/catalog/catalog-shared";

function createId() {
  return `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function mergeTaxonomyIntoSettings(
  settings: CatalogSettings,
  input: { category?: string; tags?: string[] },
): { settings: CatalogSettings; changed: boolean } {
  let changed = false;
  const next: CatalogSettings = {
    categories: [...settings.categories],
    tags: [...settings.tags],
    templateId: settings.templateId,
  };

  const category = input.category?.trim();
  if (category && category.toLowerCase() !== "general") {
    const exists = next.categories.some(
      (row) => row.name.toLowerCase() === category.toLowerCase(),
    );
    if (!exists) {
      next.categories.push({
        id: createId(),
        name: category,
        sortOrder: next.categories.length,
      });
      changed = true;
    }
  }

  for (const tag of input.tags ?? []) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    if (!next.tags.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      next.tags.push(trimmed);
      changed = true;
    }
  }

  return { settings: next, changed };
}

type CatalogTx = {
  business: {
    findUnique: (args: {
      where: { id: string };
      select: { catalogSettings: true };
    }) => Promise<{ catalogSettings: unknown } | null>;
    update: (args: {
      where: { id: string };
      data: { catalogSettings: Prisma.InputJsonValue };
    }) => Promise<unknown>;
  };
};

export async function syncCatalogFromProduct(
  businessId: string,
  input: { category?: string; metadata?: unknown },
  tx?: CatalogTx,
) {
  const client = tx;
  if (!client) return;

  const business = await client.business.findUnique({
    where: { id: businessId },
    select: { catalogSettings: true },
  });
  if (!business) return;

  const metadata = parseProductMetadata(input.metadata);
  const { settings, changed } = mergeTaxonomyIntoSettings(parseCatalogSettings(business.catalogSettings), {
    category: input.category,
    tags: metadata.tags,
  });

  if (!changed) return;

  await client.business.update({
    where: { id: businessId },
    data: { catalogSettings: serializeCatalogSettings(settings) },
  });
}