/**
 * Idempotent product media blob storage for Neon / db-push databases.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `CREATE TABLE IF NOT EXISTS "${S}"."ProductMediaAsset" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductMediaAsset_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "ProductMediaAsset_businessId_idx"
    ON "${S}"."ProductMediaAsset" ("businessId")`,
  `CREATE INDEX IF NOT EXISTS "ProductMediaAsset_businessId_createdAt_idx"
    ON "${S}"."ProductMediaAsset" ("businessId", "createdAt")`,
  `DO $$ BEGIN
    ALTER TABLE "${S}"."ProductMediaAsset"
      ADD CONSTRAINT "ProductMediaAsset_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "${S}"."Business"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

async function main() {
  console.log("Applying product media schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("Product media schema applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());