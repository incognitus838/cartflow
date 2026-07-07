import type { Prisma } from "@prisma/client";
import { getCatalogTemplate, isCatalogProductType, normalizeCatalogTemplateId } from "@/lib/catalog/templates";

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
    base.tags = [
      ...new Set(
        data.tags
          .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
          .map((tag) => tag.trim()),
      ),
    ];
  }

  if (typeof data.templateId === "string") {
    base.templateId = normalizeCatalogTemplateId(data.templateId) ?? data.templateId;
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

export function applyTemplateToSettings(
  _current: CatalogSettings,
  templateId: string,
): CatalogSettings | string {
  const normalized = normalizeCatalogTemplateId(templateId);
  if (!normalized || !isCatalogProductType(normalized)) {
    return "Choose a catalog type: Physical, Digital, Food, or Service.";
  }

  const template = getCatalogTemplate(normalized);
  if (!template) return "Unknown catalog type.";

  return {
    categories: template.categories.map((name, index) => ({
      id: createId(),
      name,
      sortOrder: index,
    })),
    tags: [...template.tags],
    templateId: normalized,
  };
}

export function catalogCategoryNames(settings: CatalogSettings) {
  return settings.categories.map((category) => category.name);
}

export { createId as createCatalogCategoryId };