"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import type { ProductType } from "@/lib/products/product-types";
import { getVariantUiConfig } from "@/lib/products/variant-config";
import {
  cartesianVariantCombinations,
  combinationsToVariantRows,
  createVariantGroup,
  type VariantGroup,
} from "@/lib/products/variant-groups";
import { emptyVariantRow, type VariantFormRow } from "@/lib/products/variants";
import { cn } from "@/lib/utils";

type VariantsSectionProps = {
  productType: ProductType;
  useVariants: boolean;
  onUseVariantsChange: (value: boolean) => void;
  groups: VariantGroup[];
  onGroupsChange: (groups: VariantGroup[]) => void;
  variants: VariantFormRow[];
  onVariantsChange: (variants: VariantFormRow[]) => void;
};

export function VariantsSection({
  productType,
  useVariants,
  onUseVariantsChange,
  groups,
  onGroupsChange,
  variants,
  onVariantsChange,
}: VariantsSectionProps) {
  const variantUi = getVariantUiConfig(productType);

  function addGroup() {
    onGroupsChange([...groups, createVariantGroup(variantUi.defaultGroupName)]);
    onUseVariantsChange(true);
  }

  function updateGroup(id: string, patch: Partial<VariantGroup>) {
    onGroupsChange(groups.map((group) => (group.id === id ? { ...group, ...patch } : group)));
  }

  function addOption(groupId: string) {
    onGroupsChange(
      groups.map((group) =>
        group.id === groupId ? { ...group, options: [...group.options, ""] } : group,
      ),
    );
  }

  function updateOption(groupId: string, index: number, value: string) {
    onGroupsChange(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.map((option, i) => (i === index ? value : option)),
            }
          : group,
      ),
    );
  }

  function removeOption(groupId: string, index: number) {
    onGroupsChange(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, options: group.options.filter((_, i) => i !== index) }
          : group,
      ),
    );
  }

  function generateCombinations() {
    const combos = cartesianVariantCombinations(groups);
    onVariantsChange(combinationsToVariantRows(combos, variants));
    onUseVariantsChange(true);
  }

  return (
    <section className="cf-product-card cf-product-card--lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Variants &amp; options
          </h2>
          <p className="mt-1 text-[12px] text-[#86868b]">{variantUi.sectionDescription}</p>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
          <input
            type="checkbox"
            checked={useVariants}
            onChange={(e) => {
              onUseVariantsChange(e.target.checked);
              if (e.target.checked && variants.length === 0) {
                onVariantsChange([emptyVariantRow()]);
              }
            }}
            className="rounded border-black/[0.15] text-[#1d1d1f] focus:ring-[#b8956a]"
          />
          Use variants
        </label>
      </div>

      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="rounded-[14px] border border-black/[0.06] bg-[#fbfbfd] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="min-w-[120px] flex-1 text-[12px] font-medium text-[#86868b]">
                Group name
                <input
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                  className="cf-input mt-1.5"
                  placeholder={variantUi.groupNamePlaceholder}
                />
              </label>
              <button
                type="button"
                onClick={() => onGroupsChange(groups.filter((item) => item.id !== group.id))}
                className="cf-product-icon-btn text-red-500"
                aria-label="Remove variant group"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {group.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={option}
                    onChange={(e) => updateOption(group.id, index, e.target.value)}
                    className="cf-input"
                    placeholder={variantUi.optionPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(group.id, index)}
                    className="cf-product-icon-btn shrink-0"
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(group.id)}
                className="text-[12px] font-medium text-[#b8956a] hover:text-[#9a7d58]"
              >
                + Add option
              </button>
            </div>
          </div>
        ))}

        {groups.length === 0 && variantUi.tip ? (
          <p className="rounded-[12px] bg-[#f5f5f7] px-4 py-3 text-[12px] text-[#6e6e73]">
            {variantUi.tip}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addGroup} className="btn-secondary text-[13px]">
            <Plus className="mr-1.5 inline h-4 w-4" />
            Add variant group
          </button>
          {groups.length > 0 ? (
            <button type="button" onClick={generateCombinations} className="btn-secondary text-[13px]">
              <Sparkles className="mr-1.5 inline h-4 w-4" />
              Generate combinations
            </button>
          ) : null}
        </div>
      </div>

      {useVariants ? (
        <div className="mt-6 overflow-x-auto">
          <table className="cf-product-variant-table min-w-full">
            <thead>
              <tr>
                <th scope="col">Variant</th>
                <th scope="col">SKU</th>
                <th scope="col">Price override</th>
                {variantUi.trackVariantStock ? <th scope="col">Stock</th> : null}
                <th scope="col" className="w-10" />
              </tr>
            </thead>
            <tbody>
              {variants.map((row, index) => (
                <tr key={row.id ?? `${row.name}-${index}`} className="cf-product-variant-row">
                  <td>
                    <input
                      value={row.name}
                      onChange={(e) =>
                        onVariantsChange(
                          variants.map((item, i) =>
                            i === index ? { ...item, name: e.target.value } : item,
                          ),
                        )
                      }
                      className="cf-input"
                      placeholder={variantUi.variantNamePlaceholder}
                      required
                    />
                  </td>
                  <td>
                    <input
                      value={row.sku}
                      onChange={(e) =>
                        onVariantsChange(
                          variants.map((item, i) =>
                            i === index ? { ...item, sku: e.target.value } : item,
                          ),
                        )
                      }
                      className="cf-input"
                      placeholder="SKU-001"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={row.price}
                      onChange={(e) =>
                        onVariantsChange(
                          variants.map((item, i) =>
                            i === index ? { ...item, price: e.target.value } : item,
                          ),
                        )
                      }
                      className="cf-input"
                      placeholder="Optional"
                    />
                  </td>
                  {variantUi.trackVariantStock ? (
                    <td>
                      <input
                        type="number"
                        min={0}
                        required
                        value={row.stock}
                        onChange={(e) =>
                          onVariantsChange(
                            variants.map((item, i) =>
                              i === index ? { ...item, stock: e.target.value } : item,
                            ),
                          )
                        }
                        className="cf-input"
                      />
                    </td>
                  ) : null}
                  <td>
                    <button
                      type="button"
                      onClick={() => onVariantsChange(variants.filter((_, i) => i !== index))}
                      className="cf-product-icon-btn"
                      aria-label="Remove variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => onVariantsChange([...variants, emptyVariantRow()])}
            className={cn("mt-3 flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f]")}
          >
            <Plus className="h-4 w-4" />
            Add variant row
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-[#86868b]">{variantUi.singleSkuHint}</p>
      )}
    </section>
  );
}