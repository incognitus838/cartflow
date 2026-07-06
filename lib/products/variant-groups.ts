import type { VariantFormRow } from "@/lib/products/variants";

export type VariantGroup = {
  id: string;
  name: string;
  options: string[];
};

export function createVariantGroup(name = "Size"): VariantGroup {
  return {
    id: crypto.randomUUID(),
    name,
    options: [""],
  };
}

export function cartesianVariantCombinations(
  groups: VariantGroup[],
): Array<{ name: string; options: Record<string, string> }> {
  const active = groups
    .map((group) => ({
      name: group.name.trim(),
      options: group.options.map((option) => option.trim()).filter(Boolean),
    }))
    .filter((group) => group.name && group.options.length > 0);

  if (active.length === 0) return [];

  return active.reduce<Array<{ name: string; options: Record<string, string> }>>(
    (acc, group) => {
      if (acc.length === 0) {
        return group.options.map((option) => ({
          name: option,
          options: { [group.name]: option },
        }));
      }

      const next: Array<{ name: string; options: Record<string, string> }> = [];
      for (const row of acc) {
        for (const option of group.options) {
          next.push({
            name: `${row.name} / ${option}`,
            options: { ...row.options, [group.name]: option },
          });
        }
      }
      return next;
    },
    [],
  );
}

export function combinationsToVariantRows(
  combinations: Array<{ name: string; options: Record<string, string> }>,
  existing: VariantFormRow[] = [],
): VariantFormRow[] {
  return combinations.map((combo) => {
    const match = existing.find((row) => row.name === combo.name);
    return {
      id: match?.id,
      name: combo.name,
      sku: match?.sku ?? "",
      price: match?.price ?? "",
      stock: match?.stock ?? "0",
      options: combo.options,
    };
  });
}