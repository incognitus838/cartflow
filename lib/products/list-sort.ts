import { toNumber, type NumericInput } from "@/lib/decimal";

export type ProductSortField = "updated" | "title" | "category" | "price" | "stock" | "status";
export type ProductSortDirection = "asc" | "desc";

export type ProductSort = {
  field: ProductSortField;
  direction: ProductSortDirection;
};

export const DEFAULT_PRODUCT_SORT: ProductSort = { field: "updated", direction: "desc" };

export const PRODUCT_SORT_PRESETS: Array<{ id: string; label: string; sort: ProductSort }> = [
  { id: "updated-desc", label: "Recently updated", sort: { field: "updated", direction: "desc" } },
  { id: "title-asc", label: "Name A–Z", sort: { field: "title", direction: "asc" } },
  { id: "title-desc", label: "Name Z–A", sort: { field: "title", direction: "desc" } },
  { id: "price-asc", label: "Price: Low to high", sort: { field: "price", direction: "asc" } },
  { id: "price-desc", label: "Price: High to low", sort: { field: "price", direction: "desc" } },
  { id: "stock-asc", label: "Stock: Low to high", sort: { field: "stock", direction: "asc" } },
  { id: "stock-desc", label: "Stock: High to low", sort: { field: "stock", direction: "desc" } },
  { id: "category-asc", label: "Category A–Z", sort: { field: "category", direction: "asc" } },
  { id: "status-asc", label: "Status", sort: { field: "status", direction: "asc" } },
];

export function sortPresetId(sort: ProductSort) {
  return `${sort.field}-${sort.direction}`;
}

export function sortProducts<T extends {
  title: string;
  category: string;
  price: NumericInput;
  stock: number;
  status: string;
  updatedAt: string | Date;
}>(products: T[], sort: ProductSort): T[] {
  const list = [...products];
  const dir = sort.direction === "asc" ? 1 : -1;

  list.sort((a, b) => {
    switch (sort.field) {
      case "title":
        return dir * a.title.localeCompare(b.title);
      case "category":
        return dir * (a.category || "General").localeCompare(b.category || "General");
      case "price":
        return dir * (toNumber(a.price) - toNumber(b.price));
      case "stock":
        return dir * (a.stock - b.stock);
      case "status":
        return dir * a.status.localeCompare(b.status);
      case "updated":
      default:
        return (
          dir *
          (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        );
    }
  });

  return list;
}

export function toggleSortField(current: ProductSort, field: ProductSortField): ProductSort {
  if (current.field === field) {
    return { field, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  const defaultDirection: ProductSortDirection =
    field === "updated" || field === "price" || field === "stock" ? "desc" : "asc";
  return { field, direction: defaultDirection };
}