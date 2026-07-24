/**
 * Idempotent AdminJob table for background broadcasts.
 * Run: npx dotenv-cli -e .env.local -- node scripts/apply-admin-job-schema.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `CREATE SCHEMA IF NOT EXISTS "${S}"`,
  `CREATE TABLE IF NOT EXISTS "${S}"."AdminJob" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "success" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminJob_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "AdminJob_createdById_idx" ON "${S}"."AdminJob"("createdById")`,
  `CREATE INDEX IF NOT EXISTS "AdminJob_status_idx" ON "${S}"."AdminJob"("status")`,
  `CREATE INDEX IF NOT EXISTS "AdminJob_createdAt_idx" ON "${S}"."AdminJob"("createdAt")`,
];

async function main() {
  console.log("Applying AdminJob schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("AdminJob schema applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
