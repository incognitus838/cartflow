/**
 * Ensures demo stores have bank transfer details for checkout.
 * Run: npm run db:ensure-bank
 */
import { PrismaClient } from "@prisma/client";
import { DEMO_BANK, DEMO_STORE_SLUGS } from "../lib/catalog/demo-bank.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Ensuring demo bank accounts...\n");

  for (const slug of DEMO_STORE_SLUGS) {
    const store = await prisma.business.update({
      where: { slug },
      data: {
        ...DEMO_BANK,
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
    console.log(`    Bank:    ${store.bankName}`);
    console.log(`    Name:    ${store.bankAccountName}`);
    console.log(`    Account: ${store.bankAccountNumber}`);
    console.log();
  }

  console.log("Checkout at /ada-styles/checkout or /glow-beauty/checkout will show transfer instructions.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());