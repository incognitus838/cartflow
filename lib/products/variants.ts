export type VariantFormRow = {
  id?: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  stock: string;
};

export function buildVariantName(size: string, color: string) {
  const parts = [size.trim(), color.trim()].filter(Boolean);
  return parts.join(" / ");
}

export function parseVariantName(name: string): { size: string; color: string } {
  const [size, color] = name.split(" / ").map((part) => part.trim());
  if (color) return { size: size ?? "", color };
  return { size: size ?? "", color: "" };
}

export function emptyVariantRow(): VariantFormRow {
  return { size: "", color: "", sku: "", price: "", stock: "0" };
}