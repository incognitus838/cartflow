import "server-only";

import { canAddProduct } from "@/lib/plans";
import { createProduct } from "@/lib/products/mutations";
import { parseProductInput } from "@/lib/products/validation";
import { prisma } from "@/lib/db";
import type { ProductInput } from "@/lib/products/types";

export type BulkProductRow = {
  title: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
};

export type BulkProductResult = {
  created: number;
  failed: number;
  total: number;
  products: Array<{ id: string; title: string; price: number }>;
  errors: Array<{ index: number; title?: string; error: string }>;
};

const MAX_BULK = 100;

function toProductInput(row: BulkProductRow, defaultCategory: string): ProductInput | string {
  return parseProductInput({
    title: row.title,
    price: row.price,
    description: row.description ?? "",
    category: row.category || defaultCategory || "General",
    status: "ACTIVE",
    stock: typeof row.stock === "number" ? row.stock : 10,
    lowStockThreshold: 3,
    media: [],
    variants: [],
  });
}

export async function createProductsBulk(
  businessId: string,
  rows: BulkProductRow[],
  options?: { defaultCategory?: string },
): Promise<BulkProductResult> {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Provide at least one product.");
  }
  if (rows.length > MAX_BULK) {
    throw new Error(`Maximum ${MAX_BULK} products per import.`);
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true, _count: { select: { products: true } } },
  });
  if (!business) throw new Error("Store not found");

  const defaultCategory = options?.defaultCategory || "General";
  let currentCount = business._count.products;

  const products: BulkProductResult["products"] = [];
  const errors: BulkProductResult["errors"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!canAddProduct(business.plan, currentCount)) {
      errors.push({
        index: i,
        title: row?.title,
        error: "Product limit reached for your plan.",
      });
      // remaining will also fail plan limit
      for (let j = i + 1; j < rows.length; j++) {
        errors.push({
          index: j,
          title: rows[j]?.title,
          error: "Product limit reached for your plan.",
        });
      }
      break;
    }

    const parsed = toProductInput(row, defaultCategory);
    if (typeof parsed === "string") {
      errors.push({ index: i, title: row?.title, error: parsed });
      continue;
    }

    try {
      const product = await createProduct(businessId, parsed);
      products.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
      });
      currentCount += 1;
    } catch (error) {
      errors.push({
        index: i,
        title: row?.title,
        error: error instanceof Error ? error.message : "Could not create product.",
      });
    }
  }

  return {
    created: products.length,
    failed: errors.length,
    total: rows.length,
    products,
    errors: errors.slice(0, 30),
  };
}
