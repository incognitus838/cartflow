/**
 * Idempotent store suspend / soft-delete schema for Neon.
 * Run: npx dotenv-cli -e .env.local -- node scripts/apply-store-lifecycle-schema.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `CREATE SCHEMA IF NOT EXISTS "${S}"`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3)`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "suspendReason" TEXT`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "deletedById" TEXT`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "deleteReason" TEXT`,
  `CREATE INDEX IF NOT EXISTS "Business_deletedAt_idx" ON "${S}"."Business"("deletedAt")`,
  `CREATE INDEX IF NOT EXISTS "Business_isSuspended_idx" ON "${S}"."Business"("isSuspended")`,
];

async function main() {
  console.log("Applying store lifecycle schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("Store lifecycle schema applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
