/**
 * Idempotent delivery zones schema + seed zones per store from flat deliveryFee.
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

async function seedGlowBeautyDemoZones(businessId, baseFee) {
  await prisma.deliveryZone.deleteMany({ where: { businessId } });
  await prisma.deliveryZone.createMany({
    data: [
      { businessId, name: "Lekki", fee: Math.max(baseFee, 2000), sortOrder: 0 },
      { businessId, name: "Victoria Island", fee: Math.max(baseFee, 2500), sortOrder: 1 },
      { businessId, name: "Mainland", fee: Math.max(baseFee, 1500), sortOrder: 2 },
      { businessId, name: "Pickup at store", fee: 0, sortOrder: 3 },
    ],
  });
}

async function seedDefaultZones() {
  const businesses = await prisma.business.findMany({
    select: { id: true, slug: true, deliveryFee: true },
  });

  for (const business of businesses) {
    const existingZones = await prisma.deliveryZone.findMany({
      where: { businessId: business.id },
      select: { id: true, name: true },
    });

    if (business.slug === "glow-beauty") {
      const onlyDefault =
        existingZones.length === 1 && existingZones[0].name === "Standard delivery";
      if (existingZones.length === 0 || onlyDefault) {
        const fee = Number(business.deliveryFee);
        const baseFee = Number.isFinite(fee) && fee >= 0 ? fee : 0;
        await seedGlowBeautyDemoZones(business.id, baseFee);
      }
      continue;
    }

    if (existingZones.length > 0) continue;

    const fee = Number(business.deliveryFee);
    const baseFee = Number.isFinite(fee) && fee >= 0 ? fee : 0;

    await prisma.deliveryZone.create({
      data: {
        businessId: business.id,
        name: "Standard delivery",
        fee: baseFee,
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