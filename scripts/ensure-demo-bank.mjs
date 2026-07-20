/**
 * Ensures demo stores have NO bank transfer details (safe public demos).
 * Run: npm run db:ensure-bank
 */
import { PrismaClient } from "@prisma/client";
import { DEMO_BANK_CLEARED, DEMO_STORE_SLUGS } from "../lib/catalog/demo-bank.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing bank details on demo stores (prevent accidental transfers)...\n");

  for (const slug of DEMO_STORE_SLUGS) {
    const store = await prisma.business.update({
      where: { slug },
      data: {
        ...DEMO_BANK_CLEARED,
        approvalStatus: "APPROVED",
        isActive: true,
      },
      select: {
        name: true,
        slug: true,
        bankName: true,
        bankAccountName: true,
        bankAccountNumber: true,
      },
    });

    console.log(`✓ ${store.name} (/${store.slug})`);
    console.log(`    Bank fields cleared — checkout is demo-only (no transfer details).`);
    console.log();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
