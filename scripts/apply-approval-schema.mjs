/**
 * Idempotent approval workflow schema for Neon / db-push databases.
 * Run: npx dotenv-cli -e .env.local -- node scripts/apply-approval-schema.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `CREATE SCHEMA IF NOT EXISTS "${S}"`,

  `DO $$ BEGIN
    CREATE TYPE "${S}"."StoreApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE "${S}"."ApprovalPriority" AS ENUM ('NORMAL', 'HIGH');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "approvalStatus" "${S}"."StoreApprovalStatus" NOT NULL DEFAULT 'APPROVED'`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3)`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "approvalReviewedAt" TIMESTAMP(3)`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "approvalReviewedBy" TEXT`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "approvalNotes" TEXT`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "resubmissionAllowed" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "bankVerified" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "catalogVerified" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "contactVerified" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "${S}"."Business" ADD COLUMN IF NOT EXISTS "approvalPriority" "${S}"."ApprovalPriority" NOT NULL DEFAULT 'NORMAL'`,

  // Stores submitted via onboarding but never reviewed must stay in the approval queue.
  `UPDATE "${S}"."Business"
   SET "approvalStatus" = 'PENDING', "isActive" = false
   WHERE "submittedAt" IS NOT NULL
     AND "approvalReviewedAt" IS NULL
     AND "approvalStatus" <> 'PENDING'`,

  // Legacy rows created after onboarding shipped: inactive + unreviewed → pending.
  `UPDATE "${S}"."Business"
   SET "approvalStatus" = 'PENDING', "submittedAt" = COALESCE("submittedAt", "createdAt")
   WHERE "approvalReviewedAt" IS NULL
     AND "isActive" = false
     AND "approvalStatus" = 'APPROVED'
     AND "submittedAt" IS NULL
     AND "createdAt" >= NOW() - INTERVAL '180 days'`,
];

async function main() {
  console.log("Applying approval schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  const pendingCount = await prisma.business.count({ where: { approvalStatus: "PENDING" } });
  console.log(`Approval schema applied. Pending stores in queue: ${pendingCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());