"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeCategoryName } from "@/lib/products/catalog-layout";

type CategoryTagsFieldsProps = {
  category: string;
  onCategoryChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  catalogCategories: string[];
  catalogTags: string[];
  categoryPlaceholder?: string;
};

export function CategoryTagsFields({
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  catalogCategories,
  catalogTags,
  categoryPlaceholder = "General",
}: CategoryTagsFieldsProps) {
  const [customCategory, setCustomCategory] = useState(false);
  const displayCategory = normalizeCategoryName(category);

  const categoryOptions = useMemo(() => {
    const names = new Set(catalogCategories.map((name) => name.trim()).filter(Boolean));
    names.add("General");
    if (displayCategory) names.add(displayCategory);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [catalogCategories, displayCategory]);

  useEffect(() => {
    const inList = categoryOptions.some(
      (name) => name.toLowerCase() === displayCategory.toLowerCase(),
    );
    if (!inList && categoryOptions.length > 0) {
      setCustomCategory(true);
    }
  }, [categoryOptions, displayCategory]);

  const availableTags = catalogTags.filter(
    (tag) => !tags.some((selected) => selected.toLowerCase() === tag.toLowerCase()),
  );

  function toggleTag(tag: string) {
    const exists = tags.some((selected) => selected.toLowerCase() === tag.toLowerCase());
    if (exists) {
      onTagsChange(tags.filter((selected) => selected.toLowerCase() !== tag.toLowerCase()));
      return;
    }
    onTagsChange([...tags, tag]);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="category" className="cf-product-label">
          Category
        </label>
        {customCategory || categoryOptions.length <= 1 ? (
          <input
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="cf-input mt-2"
            placeholder={categoryPlaceholder}
          />
        ) : (
          <select
            id="category"
            value={displayCategory}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setCustomCategory(true);
                return;
              }
              onCategoryChange(e.target.value);
            }}
            className="cf-input mt-2"
          >
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__custom__">+ Custom category</option>
          </select>
        )}
        {catalogCategories.length === 0 ? (
          <p className="mt-1.5 text-xs text-[#86868b]">
            <a href="/dashboard/products/new#catalog" className="font-medium text-[#1d1d1f] hover:underline">
              Set up categories
            </a>{" "}
            or type a custom one.
          </p>
        ) : null}
      </div>

      <div>
        <span className="cf-product-label">Tags</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="rounded-full border border-[#1d1d1f] bg-[#1d1d1f] px-3 py-1 text-xs font-medium text-white"
            >
              {tag} ×
            </button>
          ))}
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="rounded-full border border-black/[0.08] bg-white px-3 py-1 text-xs font-medium text-[#6e6e73] hover:border-black/[0.14]"
            >
              + {tag}
            </button>
          ))}
        </div>
        <input
          className="cf-input mt-3"
          placeholder="Type a tag and press Enter"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (!value) return;
            toggleTag(value);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}