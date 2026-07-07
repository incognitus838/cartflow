"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FolderOpen,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CatalogTypePicker } from "@/components/dashboard/catalog-type-picker";
import { getCatalogTemplate, isCatalogProductType } from "@/lib/catalog/templates";
import type { CatalogCategory, CatalogSettings } from "@/lib/catalog/settings";
import type { ProductType } from "@/lib/products/product-types";

type CatalogManagerProps = {
  initial: CatalogSettings;
  productCountByCategory?: Record<string, number>;
  embedded?: boolean;
  emphasizeTemplates?: boolean;
  onSettingsChange?: (settings: CatalogSettings) => void;
  onTemplateApplied?: () => void;
  onSaved?: () => void;
  savedRedirectLabel?: string;
};

function createCategory(name: string, sortOrder: number): CatalogCategory {
  return {
    id: `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    sortOrder,
  };
}

export function CatalogManager({
  initial,
  productCountByCategory = {},
  embedded = false,
  emphasizeTemplates = false,
  onSettingsChange,
  onTemplateApplied,
  onSaved,
  savedRedirectLabel,
}: CatalogManagerProps) {
  const [settings, setSettings] = useState(initial);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [applyingType, setApplyingType] = useState<ProductType | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(
    emphasizeTemplates || !isCatalogProductType(initial.templateId) || initial.categories.length === 0,
  );
  const [pendingType, setPendingType] = useState<ProductType | null>(null);

  const activeType = isCatalogProductType(settings.templateId) ? settings.templateId : null;
  const activeTemplate = activeType ? getCatalogTemplate(activeType) : null;
  const pendingTemplate = pendingType ? getCatalogTemplate(pendingType) : null;

  const sortedCategories = useMemo(
    () => [...settings.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [settings.categories],
  );

  function commitSettings(next: CatalogSettings) {
    setSettings(next);
    onSettingsChange?.(next);
  }

  async function persist(next: CatalogSettings, message = "Catalog saved") {
    setSaving(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not save catalog");
        return;
      }

      commitSettings(data.settings);
      toast.success(message);
      onSaved?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function requestApplyType(type: ProductType) {
    const hasExisting =
      settings.categories.length > 0 ||
      settings.tags.length > 0 ||
      isCatalogProductType(settings.templateId);
    if (hasExisting && settings.templateId !== type) {
      setPendingType(type);
      return;
    }
    void handleApplyType(type);
  }

  async function handleApplyType(type: ProductType) {
    setPendingType(null);
    setApplyingType(type);
    try {
      const res = await fetch("/api/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyTemplate: type }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not set up catalog");
        return;
      }

      commitSettings(data.settings);
      setTypePickerOpen(emphasizeTemplates);
      toast.success(
        embedded
          ? "Catalog ready — continue with your product below."
          : "Catalog type saved with categories and tags.",
      );
      onTemplateApplied?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApplyingType(null);
    }
  }

  function updateCategoryName(id: string, name: string) {
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === id ? { ...category, name } : category,
      ),
    }));
  }

  function moveCategory(id: string, direction: -1 | 1) {
    const list = [...sortedCategories];
    const index = list.findIndex((category) => category.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;

    [list[index], list[target]] = [list[target], list[index]];
    setSettings((prev) => ({
      ...prev,
      categories: list.map((category, sortOrder) => ({ ...category, sortOrder })),
    }));
  }

  function removeCategory(id: string) {
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== id),
    }));
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    setSettings((prev) => ({
      ...prev,
      categories: [...prev.categories, createCategory(name, prev.categories.length)],
    }));
    setNewCategory("");
  }

  function addTag() {
    const tag = newTag.trim();
    if (!tag) return;
    if (settings.tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setNewTag("");
      return;
    }
    setSettings((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setNewTag("");
  }

  function removeTag(tag: string) {
    setSettings((prev) => ({ ...prev, tags: prev.tags.filter((existing) => existing !== tag) }));
  }

  const showTaxonomy = activeType && sortedCategories.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Catalog type</h2>
            {typePickerOpen ? (
              <p className="mt-1 text-xs text-slate-500">
                Pick what you sell — your categories and tags are stored on your store right away.
              </p>
            ) : activeTemplate ? (
              <p className="mt-1 text-xs text-slate-500">
                Selling{" "}
                <span className="font-medium text-slate-800">{activeTemplate.label}</span> — change
                type to reload categories and tags.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Choose a catalog type to get started.</p>
            )}
          </div>
          {!typePickerOpen && activeType ? (
            <button
              type="button"
              onClick={() => setTypePickerOpen(true)}
              className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Change type
            </button>
          ) : null}
        </div>

        {typePickerOpen ? (
          <div className="mt-4">
            <CatalogTypePicker
              activeType={activeType}
              applying={applyingType}
              onSelect={requestApplyType}
              compact
            />
          </div>
        ) : null}
      </section>

      {pendingTemplate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="type-confirm-title"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 id="type-confirm-title" className="text-base font-semibold text-slate-900">
                Switch to {pendingTemplate.label}?
              </h3>
              <button
                type="button"
                onClick={() => setPendingType(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              This replaces your current categories and tags. Products in removed categories move to
              General when saved.
            </p>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Categories ({pendingTemplate.categories.length})
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {pendingTemplate.categories.map((name) => (
                  <li
                    key={name}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingType(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(applyingType)}
                onClick={() => void handleApplyType(pendingTemplate.id)}
                className="btn-primary px-4 py-2.5 text-sm"
              >
                {applyingType === pendingTemplate.id ? "Applying…" : "Switch catalog type"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showTaxonomy ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">Categories</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Storefront filters — rename or reorder anytime. Save to sync to the database.
            </p>

            <ul className="mt-4 space-y-2">
              {sortedCategories.map((category, index) => (
                <li
                  key={category.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveCategory(category.id, -1)}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sortedCategories.length - 1}
                      onClick={() => moveCategory(category.id, 1)}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      value={category.name}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                    {productCountByCategory[category.name] ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {productCountByCategory[category.name]} product
                        {productCountByCategory[category.name] === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCategory(category.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">Tags</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Reusable labels for products — bestseller, new arrival, sale, and more.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {settings.tags.length === 0 ? (
                <p className="text-sm text-slate-500">No tags yet.</p>
              ) : (
                settings.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-red-600"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showTaxonomy ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => persist(settings)}
            className="btn-primary px-6"
          >
            {saving ? "Saving…" : savedRedirectLabel ?? "Save catalog"}
          </button>
        </div>
      ) : null}
    </div>
  );
}