export function normalizeCategoryName(category: string | null | undefined) {
  const name = (category ?? "").trim();
  return name || "General";
}

/** Catalog category order first, then any extra categories found on products. */
export function buildCategoryOrder(
  catalogCategories: string[],
  products: Array<{ category: string }>,
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  for (const raw of catalogCategories) {
    const name = normalizeCategoryName(raw);
    if (seen.has(name)) continue;
    seen.add(name);
    order.push(name);
  }

  for (const product of products) {
    const name = normalizeCategoryName(product.category);
    if (seen.has(name)) continue;
    seen.add(name);
    order.push(name);
  }

  return order;
}

export type CatalogSortableProduct = {
  category: string;
  sortOrder?: number;
  updatedAt: string | Date;
};

export function sortProductsByCatalog<T extends CatalogSortableProduct>(
  products: T[],
  categoryOrder: string[],
): T[] {
  const catIndex = new Map(categoryOrder.map((category, index) => [category, index]));

  return [...products].sort((a, b) => {
    const catA = normalizeCategoryName(a.category);
    const catB = normalizeCategoryName(b.category);
    const categoryDiff = (catIndex.get(catA) ?? 999) - (catIndex.get(catB) ?? 999);
    if (categoryDiff !== 0) return categoryDiff;

    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function groupProductsByCatalog<T extends CatalogSortableProduct & { category: string }>(
  products: T[],
  categoryOrder: string[],
): Array<{ category: string; products: T[] }> {
  const sorted = sortProductsByCatalog(products, categoryOrder);
  const groups = new Map<string, T[]>();

  for (const category of categoryOrder) {
    groups.set(category, []);
  }

  for (const product of sorted) {
    const category = normalizeCategoryName(product.category);
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(product);
  }

  return Array.from(groups.entries())
    .filter(([, items]) => items.length > 0)
    .map(([category, items]) => ({ category, products: items }));
}