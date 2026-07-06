/**
 * Seed Glow Beauty demo store with 60 categorized products (6 per category).
 * Run: npm run db:seed-beauty  (only one instance at a time)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { generateBeautyCatalog } from "../lib/catalog/beauty-categories.mjs";
import { DEMO_BANK } from "../lib/catalog/demo-bank.mjs";
import { SKINCARE_IMAGES } from "../lib/catalog/skincare-images.mjs";

const prisma = new PrismaClient();
const STORE_SLUG = "glow-beauty";
const BATCH_SIZE = 25;
const LOCK_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), ".seed-glow-beauty.lock");

function isProcessAlive(pid) {
  if (!pid || Number.isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const holder = Number(fs.readFileSync(LOCK_FILE, "utf8").trim());
    if (!isProcessAlive(holder)) {
      fs.unlinkSync(LOCK_FILE);
    } else {
      console.error(`Seed already running (pid ${holder}). Wait for it to finish before re-running.`);
      process.exit(1);
    }
  }

  try {
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: "wx" });
  } catch {
    console.error("Could not acquire seed lock. Try again in a few seconds.");
    process.exit(1);
  }
}

function releaseLock() {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    // ignore
  }
}

async function wipeCatalog(businessId) {
  let totalRemoved = 0;
  for (let pass = 0; pass < 5; pass++) {
    const deleted = await prisma.product.deleteMany({ where: { businessId } });
    totalRemoved += deleted.count;
    if (deleted.count === 0) break;
  }
  return totalRemoved;
}

async function createProductsBatch(businessId, items) {
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
            variants: variants.length ? { create: variants } : undefined,
          },
        });
      }),
    );
    process.stdout.write(`\r  Created ${Math.min(i + BATCH_SIZE, items.length)} / ${items.length} products...`);
  }
  process.stdout.write("\n");
}

async function revalidateStorefront(slug, businessId) {
  const secret = process.env.REVALIDATE_SECRET;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  if (!secret) return;

  for (const tag of [`store-${slug}`, `catalog-${businessId}`]) {
    try {
      await fetch(`${base}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
        method: "POST",
        headers: { "x-revalidate-secret": secret },
      });
    } catch {
      // dev server may be offline
    }
  }
}

async function main() {
  acquireLock();

  const owner = await prisma.user.findUnique({ where: { email: "demo@cartflow.app" } });
  if (!owner) {
    console.error("Run npm run db:seed first to create demo@cartflow.app");
    process.exit(1);
  }

  console.log("Seeding Glow Beauty store...\n");

  const business = await prisma.business.upsert({
    where: { slug: STORE_SLUG },
    update: {
      name: "Glow Beauty",
      description:
        "Premium makeup & personal care — lip care, oral care, body wash, skincare, fragrance & more. 60 curated items, add to cart instantly.",
      logoUrl: SKINCARE_IMAGES.serum,
      plan: "PRO",
      approvalStatus: "APPROVED",
      isActive: true,
      ...DEMO_BANK,
    },
    create: {
      name: "Glow Beauty",
      slug: STORE_SLUG,
      description:
        "Premium makeup & personal care — lip care, oral care, body wash, skincare, fragrance & more. 60 curated items, add to cart instantly.",
      currency: "NGN",
      deliveryFee: 2000,
      phone: "+2348012345678",
      whatsapp: "+2348012345678",
      logoUrl: SKINCARE_IMAGES.serum,
      ownerId: owner.id,
      plan: "PRO",
      approvalStatus: "APPROVED",
      isActive: true,
      ...DEMO_BANK,
    },
  });

  await prisma.businessMember.upsert({
    where: { businessId_userId: { businessId: business.id, userId: owner.id } },
    update: {},
    create: { businessId: business.id, userId: owner.id, role: "OWNER" },
  });

  const removed = await wipeCatalog(business.id);
  if (removed > 0) {
    console.log(`Removed ${removed} existing products.`);
  }

  const catalog = generateBeautyCatalog();
  console.log(`Creating ${catalog.length} products across ${new Set(catalog.map((p) => p.category)).size} categories...`);

  await createProductsBatch(business.id, catalog);

  const counts = await prisma.product.groupBy({
    by: ["category"],
    where: { businessId: business.id },
    _count: { id: true },
  });

  const total = await prisma.product.count({ where: { businessId: business.id } });

  console.log("\nCategory breakdown:");
  for (const row of counts.sort((a, b) => a.category.localeCompare(b.category))) {
    console.log(`  ${row.category}: ${row._count.id}`);
  }

  console.log(`\nTotal products: ${total} (expected ${catalog.length})`);
  if (total !== catalog.length) {
    console.warn("WARNING: Product count mismatch — run seed once more (no parallel runs).");
  }

  await revalidateStorefront(STORE_SLUG, business.id);

  console.log(`\nDone. Storefront: http://localhost:3001/${STORE_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    releaseLock();
    return prisma.$disconnect();
  });