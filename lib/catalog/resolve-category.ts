import { normalizeCategoryName } from "@/lib/products/catalog-layout";
import type { CatalogSettings } from "@/lib/catalog/catalog-shared";

/** Map a product category to its new name after catalog category renames (before DB refetch). */
export function resolveCategoryAfterCatalogChange(
  currentCategory: string,
  previousCatalog: CatalogSettings,
  nextCatalog: CatalogSettings,
): string {
  const normalized = normalizeCategoryName(currentCategory);

  for (const prev of previousCatalog.categories) {
    const next = nextCatalog.categories.find((row) => row.id === prev.id);
    if (!next || prev.name === next.name) continue;
    if (normalizeCategoryName(prev.name) === normalized) {
      return next.name;
    }
  }

  return currentCategory;
}

export function catalogSettingsSignature(settings: CatalogSettings) {
  return [
    settings.templateId ?? "",
    settings.categories.map((row) => `${row.id}:${row.name}`).join("|"),
    settings.tags.join("|"),
  ].join("::");
}