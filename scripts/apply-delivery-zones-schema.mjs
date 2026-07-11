/**
 * Idempotent delivery zones schema + seed one zone per store from flat deliveryFee.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const S = "cartflow";

const statements = [
  `CREATE TABLE IF NOT EXISTS "${S}"."DeliveryZone" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "DeliveryZone_businessId_sortOrder_idx"
    ON "${S}"."DeliveryZone" ("businessId", "sortOrder")`,
  `DO $$ BEGIN
    ALTER TABLE "${S}"."DeliveryZone"
      ADD CONSTRAINT "DeliveryZone_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "${S}"."Business"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `ALTER TABLE "${S}"."Order" ADD COLUMN IF NOT EXISTS "deliveryZoneId" TEXT`,
  `ALTER TABLE "${S}"."Order" ADD COLUMN IF NOT EXISTS "deliveryZoneName" TEXT`,
];

async function seedDefaultZones() {
  const businesses = await prisma.business.findMany({
    select: { id: true, deliveryFee: true },
  });

  for (const business of businesses) {
    const existing = await prisma.deliveryZone.count({
      where: { businessId: business.id },
    });
    if (existing > 0) continue;

    const fee = Number(business.deliveryFee);
    if (!Number.isFinite(fee) || fee < 0) continue;

    await prisma.deliveryZone.create({
      data: {
        businessId: business.id,
        name: "Standard delivery",
        fee,
        sortOrder: 0,
        isActive: true,
      },
    });
  }
}

async function main() {
  console.log("Applying delivery zones schema (idempotent)…");
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  await seedDefaultZones();
  console.log("Delivery zones schema applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());