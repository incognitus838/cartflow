/**
 * Clear bank transfer details on public demo stores (production-safe).
 * Run: npx dotenv-cli -e .env.local -- node scripts/clear-demo-bank.mjs
 */
import { config as loadEnv } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { DEMO_BANK_CLEARED, DEMO_STORE_SLUGS } from "../lib/catalog/demo-bank.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: join(root, ".env.local") });
loadEnv({ path: join(root, ".env") });

const prisma = new PrismaClient();

async function main() {
  for (const slug of DEMO_STORE_SLUGS) {
    const store = await prisma.business.updateMany({
      where: { slug },
      data: DEMO_BANK_CLEARED,
    });
    console.log(`/${slug}: cleared bank fields (${store.count} row(s))`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
