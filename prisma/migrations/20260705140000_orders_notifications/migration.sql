-- AlterTable
ALTER TABLE "cartflow"."Business" ADD COLUMN "notifyOnNewOrder" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "cartflow"."Business" ADD COLUMN "notifyCustomerOnStatus" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "cartflow"."Business" ADD COLUMN "ownerNotifyEmail" TEXT;

-- AlterTable
ALTER TABLE "cartflow"."Order" ADD COLUMN "internalNotes" TEXT;

-- CreateEnum
CREATE TYPE "cartflow"."NotificationChannel" AS ENUM ('EMAIL', 'SMS');
CREATE TYPE "cartflow"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "cartflow"."NotificationLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "orderId" TEXT,
    "channel" "cartflow"."NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "cartflow"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationLog_businessId_idx" ON "cartflow"."NotificationLog"("businessId");
CREATE INDEX "NotificationLog_orderId_idx" ON "cartflow"."NotificationLog"("orderId");
CREATE INDEX "NotificationLog_createdAt_idx" ON "cartflow"."NotificationLog"("createdAt");

-- AddForeignKey
ALTER TABLE "cartflow"."NotificationLog" ADD CONSTRAINT "NotificationLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "cartflow"."Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cartflow"."NotificationLog" ADD CONSTRAINT "NotificationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "cartflow"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;