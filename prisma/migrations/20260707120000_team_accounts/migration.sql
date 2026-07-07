-- Team accounts: invites, custom roles, activity log

CREATE TYPE "MemberAccessPreset" AS ENUM ('STAFF', 'MANAGER', 'FULFILLMENT', 'CATALOG', 'CUSTOM');
CREATE TYPE "StaffInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "StoreActivityAction" AS ENUM (
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

ALTER TABLE "BusinessMember"
  ADD COLUMN "accessPreset" "MemberAccessPreset" NOT NULL DEFAULT 'STAFF',
  ADD COLUMN "permissions" JSONB,
  ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "suspendedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "StaffInvite" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "accessPreset" "MemberAccessPreset" NOT NULL DEFAULT 'STAFF',
  "permissions" JSONB,
  "token" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  "status" "StaffInviteStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StaffInvite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreActivityLog" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorName" TEXT,
  "action" "StoreActivityAction" NOT NULL,
  "detail" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StoreActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffInvite_token_key" ON "StaffInvite"("token");
CREATE INDEX "StaffInvite_businessId_email_idx" ON "StaffInvite"("businessId", "email");
CREATE INDEX "StaffInvite_businessId_status_idx" ON "StaffInvite"("businessId", "status");
CREATE INDEX "StoreActivityLog_businessId_createdAt_idx" ON "StoreActivityLog"("businessId", "createdAt");

ALTER TABLE "StaffInvite"
  ADD CONSTRAINT "StaffInvite_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffInvite"
  ADD CONSTRAINT "StaffInvite_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StoreActivityLog"
  ADD CONSTRAINT "StoreActivityLog_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;