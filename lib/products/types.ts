import type { ProductStatus } from "@prisma/client";
import type { ProductMedia } from "@/lib/media";

export type VariantInput = {
  id?: string;
  name: string;
  sku?: string;
  price?: number | null;
  stock: number;
};

export type ProductInput = {
  title: string;
  description?: string;
  category?: string;
  metadata?: Record<string, unknown>;
  price: number;
  compareAtPrice?: number | null;
  status: ProductStatus;
  stock: number;
  lowStockThreshold: number;
  media: ProductMedia[];
  variants: VariantInput[];
};