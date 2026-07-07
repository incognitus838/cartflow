/**
 * Backfill product.stock from variant totals so list rows match the database.
 * Run: npx dotenv-cli -e .env.local -- node scripts/sync-product-stock-from-variants.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  let updated = 0;
  for (const product of products) {
    if (product.variants.length === 0) continue;
    const total = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    if (product.stock === total) continue;
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: total },
    });
    updated += 1;
    console.log(`${product.title}: ${product.stock} → ${total}`);
  }

  console.log(`\nSynced ${updated} product(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());