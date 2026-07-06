export type VariantFormRow = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  options?: Record<string, string>;
};

/** @deprecated Use `name` on VariantFormRow. Kept for legacy rows. */
export function buildVariantName(size: string, color: string) {
  const parts = [size.trim(), color.trim()].filter(Boolean);
  return parts.join(" / ");
}

/** @deprecated Use `name` on VariantFormRow. */
export function parseVariantName(name: string): { size: string; color: string } {
  const [size, color] = name.split(" / ").map((part) => part.trim());
  if (color) return { size: size ?? "", color };
  return { size: size ?? "", color: "" };
}

export function emptyVariantRow(name = ""): VariantFormRow {
  return { name, sku: "", price: "", stock: "0", options: {} };
}