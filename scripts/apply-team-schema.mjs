/**
 * Safe idempotent apply of team-accounts schema for DBs created via db push.
 * Run: npx dotenv-cli -e .env.local -- node scripts/apply-team-schema.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `CREATE SCHEMA IF NOT EXISTS "${S}"`,

  `DO $$ BEGIN
    CREATE TYPE "${S}"."MemberAccessPreset" AS ENUM ('STAFF', 'MANAGER', 'FULFILLMENT', 'CATALOG', 'CUSTOM');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE "${S}"."StaffInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE "${S}"."StoreActivityAction" AS ENUM (
      'MEMBER_INVITED', 'MEMBER_JOINED', 'MEMBER_REMOVED', 'MEMBER_SUSPENDED',
      'MEMBER_RESTORED', 'MEMBER_ACCESS_UPDATED', 'INVITE_REVOKED',
      'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'ORDER_UPDATED'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `ALTER TABLE "${S}"."BusinessMember" ADD COLUMN IF NOT EXISTS "accessPreset" "${S}"."MemberAccessPreset" NOT NULL DEFAULT 'STAFF'`,
  `ALTER TABLE "${S}"."BusinessMember" ADD COLUMN IF NOT EXISTS "permissions" JSONB`,
  `ALTER TABLE "${S}"."BusinessMember" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "${S}"."BusinessMember" ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3)`,
  `ALTER TABLE "${S}"."BusinessMember" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `UPDATE "${S}"."BusinessMember" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL`,
  `ALTER TABLE "${S}"."BusinessMember" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,

  `CREATE TABLE IF NOT EXISTS "${S}"."StaffInvite" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "accessPreset" "${S}"."MemberAccessPreset" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB,
    "token" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "${S}"."StaffInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffInvite_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "${S}"."StoreActivityLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT,
    "action" "${S}"."StoreActivityAction" NOT NULL,
    "detail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreActivityLog_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "StaffInvite_token_key" ON "${S}"."StaffInvite"("token")`,
  `CREATE INDEX IF NOT EXISTS "StaffInvite_businessId_email_idx" ON "${S}"."StaffInvite"("businessId", "email")`,
  `CREATE INDEX IF NOT EXISTS "StaffInvite_businessId_status_idx" ON "${S}"."StaffInvite"("businessId", "status")`,
  `CREATE INDEX IF NOT EXISTS "StoreActivityLog_businessId_createdAt_idx" ON "${S}"."StoreActivityLog"("businessId", "createdAt")`,
];

async function main() {
  console.log("Applying team schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  const fks = [
    `DO $$ BEGIN
      ALTER TABLE "${S}"."StaffInvite" ADD CONSTRAINT "StaffInvite_businessId_fkey"
        FOREIGN KEY ("businessId") REFERENCES "${S}"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN
      ALTER TABLE "${S}"."StaffInvite" ADD CONSTRAINT "StaffInvite_invitedById_fkey"
        FOREIGN KEY ("invitedById") REFERENCES "${S}"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN
      ALTER TABLE "${S}"."StoreActivityLog" ADD CONSTRAINT "StoreActivityLog_businessId_fkey"
        FOREIGN KEY ("businessId") REFERENCES "${S}"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  ];
  for (const sql of fks) {
    await prisma.$executeRawUnsafe(sql);
  }

  console.log("Team schema applied successfully.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());