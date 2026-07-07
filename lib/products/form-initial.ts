import { detectMediaType, type ProductMediaType } from "@/lib/media";
import {
  emptyProductMetadata,
  parseProductMetadata,
  type ProductMetadata,
} from "@/lib/products/metadata";
import type { ProductType } from "@/lib/products/product-types";
import { emptyVariantRow, type VariantFormRow } from "@/lib/products/variants";

export type ProductFormInitial = {
  id?: string;
  title: string;
  description: string;
  category: string;
  metadata: ProductMetadata;
  price: string;
  compareAtPrice: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  stock: string;
  lowStockThreshold: string;
  media: Array<{ url: string; mediaType: ProductMediaType; alt?: string; previewUrl?: string }>;
  variants: VariantFormRow[];
};

export function toProductFormInitial(product?: {
  id: string;
  title: string;
  description: string | null;
  category: string;
  metadata?: unknown;
  price: { toString(): string } | number;
  compareAtPrice: { toString(): string } | number | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  stock: number;
  lowStockThreshold: number;
  images: Array<{ url: string; alt?: string | null; mediaType?: ProductMediaType | string }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    price: { toString(): string } | number | null;
    stock: number;
  }>;
}, catalogProductType?: ProductType): ProductFormInitial {
  if (!product) {
    const metadata = emptyProductMetadata();
    if (catalogProductType) {
      metadata.productType = catalogProductType;
    }
    return {
      title: "",
      description: "",
      category: "",
      metadata,
      price: "",
      compareAtPrice: "",
      status: "DRAFT",
      stock: "0",
      lowStockThreshold: "5",
      media: [],
      variants: [],
    };
  }

  const metadata = parseProductMetadata(product.metadata);

  return {
    id: product.id,
    title: product.title,
    description: product.description ?? "",
    category: product.category,
    metadata,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    status: product.status,
    stock: String(product.stock),
    lowStockThreshold: String(product.lowStockThreshold),
    media: product.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? undefined,
      mediaType: (image.mediaType as ProductMediaType) || detectMediaType(image.url),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku ?? "",
      price: variant.price ? String(variant.price) : "",
      stock: String(variant.stock),
    })),
  };
}