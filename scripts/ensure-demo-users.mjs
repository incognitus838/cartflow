/**
 * Ensures demo seller + admin accounts exist with password demo12345.
 * Run: npm run db:ensure-users
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo12345";

const USERS = [
  {
    email: "demo@cartflow.app",
    name: "Ada Okonkwo",
    role: "OWNER",
  },
  {
    email: "admin@cartflow.app",
    name: "CartFlow Admin",
    role: "ADMIN",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of USERS) {
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    });
    console.log(`✓ ${saved.email} (${saved.role})`);
  }

  console.log(`\nPassword for both: ${DEMO_PASSWORD}`);
  console.log("Seller → /login → /dashboard");
  console.log("Admin  → /login → /admin");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());