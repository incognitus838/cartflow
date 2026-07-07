/**
 * Normalize catalogSettings.templateId to PHYSICAL | DIGITAL | FOOD | SERVICE.
 * Re-applies categories/tags when migrating from legacy industry templates.
 *
 * Run: npx dotenv-cli -e .env.local -- node scripts/migrate-catalog-product-types.mjs
 */
import { PrismaClient } from "@prisma/client";

const LEGACY_MAP = {
  beauty: "PHYSICAL",
  clothing: "PHYSICAL",
  electronics: "PHYSICAL",
  food: "FOOD",
  courses: "DIGITAL",
};

const TEMPLATES = {
  PHYSICAL: {
    categories: [
      "Fashion & Apparel",
      "Electronics",
      "Home & Living",
      "Beauty & Personal Care",
      "Sports & Outdoors",
      "Books & Stationery",
      "Other",
    ],
    tags: ["bestseller", "new arrival", "sale", "limited stock", "free delivery"],
  },
  DIGITAL: {
    categories: [
      "Courses",
      "eBooks & Guides",
      "Templates & Downloads",
      "Software & Tools",
      "Memberships",
      "Bundles",
    ],
    tags: ["beginner", "advanced", "lifetime access", "bestseller", "new launch", "early bird"],
  },
  FOOD: {
    categories: ["Farm Produce", "Bakery", "Prepared Meals", "Drinks", "Snacks", "Spices & Pantry"],
    tags: ["fresh", "organic", "seasonal", "bestseller", "pre-order"],
  },
  SERVICE: {
    categories: [
      "Restaurant & Menu",
      "Catering",
      "Beauty & Wellness",
      "Events",
      "Consulting",
      "Other Services",
    ],
    tags: ["popular", "booking required", "made to order", "bestseller"],
  },
};

function createId() {
  return `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function parseSettings(raw) {
  if (!raw || typeof raw !== "object") return { categories: [], tags: [], templateId: null };
  const data = raw;
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    templateId: typeof data.templateId === "string" ? data.templateId : null,
  };
}

function buildSettings(type) {
  const template = TEMPLATES[type];
  return {
    templateId: type,
    categories: template.categories.map((name, index) => ({
      id: createId(),
      name,
      sortOrder: index,
    })),
    tags: [...template.tags],
  };
}

const prisma = new PrismaClient();
let updated = 0;

try {
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, slug: true, catalogSettings: true },
  });

  for (const business of businesses) {
    const parsed = parseSettings(business.catalogSettings);
    const legacy = parsed.templateId ? LEGACY_MAP[parsed.templateId] : null;
    const valid = ["PHYSICAL", "DIGITAL", "FOOD", "SERVICE"].includes(parsed.templateId ?? "");

    if (valid) continue;

    const nextType = legacy ?? (parsed.categories.length === 0 ? null : "PHYSICAL");
    if (!nextType) continue;

    const next = legacy ? buildSettings(nextType) : { ...parsed, templateId: nextType };

    await prisma.business.update({
      where: { id: business.id },
      data: { catalogSettings: next },
    });

    console.log(`Updated ${business.slug}: ${parsed.templateId ?? "empty"} → ${nextType}`);
    updated += 1;
  }

  console.log(`Done. ${updated} store(s) migrated.`);
} finally {
  await prisma.$disconnect();
}