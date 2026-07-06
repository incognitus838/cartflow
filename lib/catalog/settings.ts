import type { Prisma } from "@prisma/client";
import { getCatalogTemplate } from "@/lib/catalog/templates";
import { prisma } from "@/lib/db";

export type CatalogCategory = {
  id: string;
  name: string;
  sortOrder: number;
};

export type CatalogSettings = {
  categories: CatalogCategory[];
  tags: string[];
  templateId?: string | null;
};

function createId() {
  return `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyCatalogSettings(): CatalogSettings {
  return { categories: [], tags: [], templateId: null };
}

export function parseCatalogSettings(raw: unknown): CatalogSettings {
  const base = emptyCatalogSettings();
  if (!raw || typeof raw !== "object") return base;

  const data = raw as Record<string, unknown>;

  if (Array.isArray(data.categories)) {
    base.categories = data.categories
      .map((row, index) => {
        if (!row || typeof row !== "object") return null;
        const item = row as Record<string, unknown>;
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (!name) return null;
        return {
          id: typeof item.id === "string" ? item.id : createId(),
          name,
          sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index,
        };
      })
      .filter((row): row is CatalogCategory => row !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  if (Array.isArray(data.tags)) {
    base.tags = [...new Set(data.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim()).map((tag) => tag.trim()))];
  }

  if (typeof data.templateId === "string") {
    base.templateId = data.templateId;
  }

  return base;
}

export function serializeCatalogSettings(settings: CatalogSettings): Prisma.InputJsonValue {
  return {
    categories: settings.categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      sortOrder: index,
    })),
    tags: settings.tags,
    templateId: settings.templateId ?? undefined,
  };
}

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
      id: createId(),
      name,
      sortOrder: index,
    })),
  };
}

function mergeUniqueNames(existing: string[], incoming: string[]) {
  const seen = new Set(existing.map((name) => name.toLowerCase()));
  const merged = [...existing];

  for (const name of incoming) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(trimmed);
  }

  return merged;
}

export function applyTemplateToSettings(
  current: CatalogSettings,
  templateId: string,
): CatalogSettings | string {
  const template = getCatalogTemplate(templateId);
  if (!template) return "Unknown catalog template.";

  const categoryNames = mergeUniqueNames(
    current.categories.map((category) => category.name),
    template.categories,
  );

  return {
    categories: categoryNames.map((name, index) => ({
      id: current.categories.find((c) => c.name.toLowerCase() === name.toLowerCase())?.id ?? createId(),
      name,
      sortOrder: index,
    })),
    tags: mergeUniqueNames(current.tags, template.tags),
    templateId,
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

export function catalogCategoryNames(settings: CatalogSettings) {
  return settings.categories.map((category) => category.name);
}