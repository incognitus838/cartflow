/**
 * Remove owner accounts with no store and no staff memberships.
 * Run: npx dotenv-cli -e .env.local -- node scripts/delete-orphan-owners.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const orphans = await prisma.user.findMany({
  where: {
    role: "OWNER",
    ownedBusinesses: { none: {} },
    memberships: { none: {} },
  },
  select: { id: true, name: true, email: true, createdAt: true },
});

console.log(`Found ${orphans.length} orphan owner(s):`);
console.log(JSON.stringify(orphans, null, 2));

if (orphans.length > 0) {
  const result = await prisma.user.deleteMany({
    where: {
      role: "OWNER",
      ownedBusinesses: { none: {} },
      memberships: { none: {} },
    },
  });
  console.log(`Deleted ${result.count} orphan owner account(s).`);
}

await prisma.$disconnect();