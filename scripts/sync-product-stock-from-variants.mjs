/**
 * Align product.stock with variant totals; heal lone variants stuck at 0.
 * Run: npx dotenv-cli -e .env.local -- node scripts/sync-product-stock-from-variants.mjs
 * Optional: node scripts/sync-product-stock-from-variants.mjs big-loto
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const storeSlug = process.argv[2]?.trim();

function sumVariantStock(variants) {
  return variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
}

async function syncProduct(product) {
  if (product.variants.length === 0) return { healed: false, synced: false };

  let variants = product.variants.map((v) => ({ ...v, stock: Math.max(0, v.stock) }));
  const variantTotal = sumVariantStock(variants);
  let healed = false;

  if (variantTotal === 0 && product.stock > 0 && variants.length === 1) {
    await prisma.productVariant.update({
      where: { id: variants[0].id },
      data: { stock: product.stock },
    });
    console.log(
      `Healed ${product.title}: variant "${variants[0].name}" 0 → ${product.stock}`,
    );
    return { healed: true, synced: false };
  }

  const total = sumVariantStock(variants);
  if (product.stock === total) return { healed: false, synced: false };

  await prisma.product.update({
    where: { id: product.id },
    data: { stock: total },
  });
  console.log(`${product.title}: product stock ${product.stock} → ${total}`);
  return { healed: false, synced: true };
}

async function main() {
  const where = storeSlug
    ? { business: { slug: storeSlug } }
    : undefined;

  const products = await prisma.product.findMany({
    where,
    include: { variants: true, business: { select: { slug: true } } },
  });

  let healed = 0;
  let synced = 0;

  for (const product of products) {
    const result = await syncProduct(product);
    if (result.healed) healed += 1;
    if (result.synced) synced += 1;
  }

  console.log(
    `\nDone${storeSlug ? ` (${storeSlug})` : ""}: healed ${healed}, synced ${synced}, scanned ${products.length}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());