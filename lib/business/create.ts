import { prisma } from "@/lib/db";
import { isValidSlug, suggestSlug } from "@/lib/slug";

type CreateBusinessInput = {
  ownerId: string;
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
};

export async function createBusinessForOwner(input: CreateBusinessInput) {
  const slug = input.slug?.trim() || suggestSlug(input.name);

  if (!isValidSlug(slug)) {
    throw new Error("Store URL must be 3–48 characters, lowercase letters, numbers, and hyphens only.");
  }

  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("This store URL is already taken. Try another.");
  }

  return prisma.$transaction(async (tx) => {
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
        ownerId: input.ownerId,
        approvalStatus: "PENDING",
        isActive: false,
        submittedAt: now,
        approvalPriority: "HIGH",
        subscriptionStatus: "TRIAL",
      },
    });

    await tx.businessMember.create({
      data: {
        businessId: business.id,
        userId: input.ownerId,
        role: "OWNER",
        updatedAt: now,
      },
    });

    return business;
  });
}