import { DEMO_BANK_CLEARED } from "./demo-bank.mjs";
import { generateDemoCatalog } from "./demo-verticals.mjs";

const BATCH_SIZE = 5;

const DELIVERY_ZONES = [
  { name: "Lekki", fee: 2000, sortOrder: 0 },
  { name: "Victoria Island", fee: 2500, sortOrder: 1 },
  { name: "Mainland", fee: 1500, sortOrder: 2 },
  { name: "Pickup at store", fee: 0, sortOrder: 3 },
];

async function wipeCatalog(prisma, businessId) {
  for (let pass = 0; pass < 5; pass++) {
    const deleted = await prisma.product.deleteMany({ where: { businessId } });
    if (deleted.count === 0) break;
  }
}

async function createProductsBatch(prisma, businessId, items) {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((item) => {
        const { images, variants, ...productData } = item;
        return prisma.product.create({
          data: {
            ...productData,
            businessId,
            images: { create: images },
            variants: variants?.length ? { create: variants } : undefined,
          },
        });
      }),
    );
  }
}

async function ensureDeliveryZones(prisma, businessId, baseFee = 2000) {
  const existing = await prisma.deliveryZone.count({ where: { businessId } });
  if (existing > 0) return;

  await prisma.deliveryZone.createMany({
    data: DELIVERY_ZONES.map((zone) => ({
      businessId,
      name: zone.name,
      fee: zone.name === "Pickup at store" ? 0 : Math.max(baseFee, zone.fee),
      sortOrder: zone.sortOrder,
    })),
  });
}

/**
 * Create or refresh a demo storefront owned by the demo seller.
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {import("../demo/stores.mjs").DemoStoreConfig} store
 * @param {string} ownerId
 */
export async function seedDemoStore(prisma, store, ownerId) {
  const business = await prisma.business.upsert({
    where: { slug: store.slug },
    update: {
      name: store.name,
      description: store.description,
      logoUrl: store.logoUrl,
      storefrontTheme: store.theme,
      accentColor: store.accentColor,
      plan: "PRO",
      approvalStatus: "APPROVED",
      isActive: true,
      ...DEMO_BANK_CLEARED,
    },
    create: {
      name: store.name,
      slug: store.slug,
      description: store.description,
      currency: "NGN",
      deliveryFee: 2000,
      phone: "+2348012345678",
      whatsapp: "+2348012345678",
      logoUrl: store.logoUrl,
      ownerId,
      plan: "PRO",
      approvalStatus: "APPROVED",
      isActive: true,
      storefrontTheme: store.theme,
      accentColor: store.accentColor,
      heroTagline: store.type,
      ...DEMO_BANK_CLEARED,
      members: {
        create: { userId: ownerId, role: "OWNER" },
      },
    },
  });

  await wipeCatalog(prisma, business.id);
  const catalog = generateDemoCatalog(store.vertical);
  await createProductsBatch(prisma, business.id, catalog);
  await ensureDeliveryZones(prisma, business.id);

  return { business, productCount: catalog.length };
}