import type { Prisma } from "@prisma/client";
import { settingsFromSellType } from "@/lib/catalog/apply-sell-type";
import { serializeCatalogSettings } from "@/lib/catalog/catalog-shared";
import { prisma } from "@/lib/db";
import { isValidSlug, suggestSlug } from "@/lib/slug";

export type RegisterOwnerInput = {
  ownerName: string;
  ownerEmail: string;
  passwordHash: string;
  name: string;
  slug?: string;
  description?: string;
  currency?: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  sellTypeId?: string | null;
};

async function createBusinessInTx(
  tx: Prisma.TransactionClient,
  ownerId: string,
  input: Omit<RegisterOwnerInput, "ownerName" | "ownerEmail" | "passwordHash">,
) {
  const slug = input.slug?.trim() || suggestSlug(input.name);

  if (!isValidSlug(slug)) {
    throw new Error("Store URL must be 3–48 characters, lowercase letters, numbers, and hyphens only.");
  }

  const existing = await tx.business.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("This store URL is already taken. Try another.");
  }

  const catalogFromSell =
    input.sellTypeId != null && input.sellTypeId !== ""
      ? settingsFromSellType(input.sellTypeId)
      : null;
  const catalogSettings =
    catalogFromSell && typeof catalogFromSell !== "string"
      ? serializeCatalogSettings(catalogFromSell)
      : undefined;

  const now = new Date();
  const business = await tx.business.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      currency: input.currency || "NGN",
      logoUrl: input.logoUrl?.trim() || null,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      bankName: input.bankName.trim(),
      bankAccountName: input.bankAccountName.trim(),
      bankAccountNumber: input.bankAccountNumber.trim(),
      ownerId,
      approvalStatus: "PENDING",
      isActive: false,
      submittedAt: now,
      approvalPriority: "HIGH",
      subscriptionStatus: "TRIAL",
      ...(catalogSettings ? { catalogSettings } : {}),
    },
  });

  await tx.businessMember.create({
    data: {
      businessId: business.id,
      userId: ownerId,
      role: "OWNER",
      updatedAt: now,
    },
  });

  return business;
}

/** Creates owner account and store together — nothing is persisted until this succeeds. */
export async function registerOwnerWithStore(input: RegisterOwnerInput) {
  const email = input.ownerEmail.toLowerCase().trim();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("An account with this email already exists. Log in instead.");
    }

    const user = await tx.user.create({
      data: {
        name: input.ownerName.trim(),
        email,
        passwordHash: input.passwordHash,
        role: "OWNER",
      },
    });

    const business = await createBusinessInTx(tx, user.id, input);

    return { user, business };
  });
}