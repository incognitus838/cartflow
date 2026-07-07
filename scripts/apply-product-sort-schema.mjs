/**
 * Idempotent product catalog sort order for Neon / db-push databases.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `ALTER TABLE "${S}"."Product" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0`,
  `CREATE INDEX IF NOT EXISTS "Product_businessId_category_sortOrder_idx"
    ON "${S}"."Product" ("businessId", "category", "sortOrder")`,
];

async function backfillSortOrder() {
  await prisma.$executeRawUnsafe(`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY "businessId", category
          ORDER BY "sortOrder" ASC, "updatedAt" DESC
        ) - 1 AS rn
      FROM "${S}"."Product"
    )
    UPDATE "${S}"."Product" AS p
    SET "sortOrder" = ranked.rn
    FROM ranked
    WHERE p.id = ranked.id
      AND p."sortOrder" <> ranked.rn
  `);
}

async function main() {
  console.log("Applying product sort schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  await backfillSortOrder();
  console.log("Product sort schema applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());