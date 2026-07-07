-- Team accounts: invites, custom roles, activity log

CREATE TYPE "cartflow"."MemberAccessPreset" AS ENUM ('STAFF', 'MANAGER', 'FULFILLMENT', 'CATALOG', 'CUSTOM');
CREATE TYPE "cartflow"."StaffInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "cartflow"."StoreActivityAction" AS ENUM (
  'MEMBER_INVITED',
  'MEMBER_JOINED',
  'MEMBER_REMOVED',
  'MEMBER_SUSPENDED',
  'MEMBER_RESTORED',
  'MEMBER_ACCESS_UPDATED',
  'INVITE_REVOKED',
  'PAYMENT_APPROVED',
  'PAYMENT_REJECTED',
  'ORDER_UPDATED'
);

ALTER TABLE "cartflow"."BusinessMember"
  ADD COLUMN "accessPreset" "cartflow"."MemberAccessPreset" NOT NULL DEFAULT 'STAFF',
  ADD COLUMN "permissions" JSONB,
  ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "suspendedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "cartflow"."StaffInvite" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "accessPreset" "cartflow"."MemberAccessPreset" NOT NULL DEFAULT 'STAFF',
  "permissions" JSONB,
  "token" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  "status" "cartflow"."StaffInviteStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StaffInvite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cartflow"."StoreActivityLog" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorName" TEXT,
  "action" "cartflow"."StoreActivityAction" NOT NULL,
  "detail" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StoreActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffInvite_token_key" ON "cartflow"."StaffInvite"("token");
CREATE INDEX "StaffInvite_businessId_email_idx" ON "cartflow"."StaffInvite"("businessId", "email");
CREATE INDEX "StaffInvite_businessId_status_idx" ON "cartflow"."StaffInvite"("businessId", "status");
CREATE INDEX "StoreActivityLog_businessId_createdAt_idx" ON "cartflow"."StoreActivityLog"("businessId", "createdAt");

ALTER TABLE "cartflow"."StaffInvite"
  ADD CONSTRAINT "StaffInvite_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "cartflow"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cartflow"."StaffInvite"
  ADD CONSTRAINT "StaffInvite_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "cartflow"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cartflow"."StoreActivityLog"
  ADD CONSTRAINT "StoreActivityLog_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "cartflow"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;