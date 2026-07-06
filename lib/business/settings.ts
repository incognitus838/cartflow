import { parseBankDetails } from "@/lib/business/bank";
import { prisma } from "@/lib/db";
import { isValidSlug } from "@/lib/slug";

const CURRENCIES = ["NGN", "GHS", "KES", "USD"] as const;

export type BusinessSettingsInput = {
  name: string;
  slug: string;
  description?: string;
  currency: string;
  deliveryFee: number;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
  autoDeductInventory: boolean;
  notifyOnNewOrder: boolean;
  notifyCustomerOnStatus: boolean;
  ownerNotifyEmail?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
};

export function parseBusinessSettingsInput(body: unknown): BusinessSettingsInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const currency = typeof data.currency === "string" ? data.currency : "NGN";
  const deliveryFee = Number(data.deliveryFee ?? 0);
  const logoUrl = typeof data.logoUrl === "string" ? data.logoUrl.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const whatsapp = typeof data.whatsapp === "string" ? data.whatsapp.trim() : "";
  const autoDeductInventory = data.autoDeductInventory !== false;
  const notifyOnNewOrder = data.notifyOnNewOrder !== false;
  const notifyCustomerOnStatus = data.notifyCustomerOnStatus !== false;
  const ownerNotifyEmail =
    typeof data.ownerNotifyEmail === "string" ? data.ownerNotifyEmail.trim() : "";
  const bankParsed = parseBankDetails(data, false);
  if (typeof bankParsed === "string") return bankParsed;

  if (!name || name.length < 2) return "Store name is required.";
  if (!slug || !isValidSlug(slug)) {
    return "Store URL must be 3–48 characters, lowercase letters, numbers, and hyphens only.";
  }
  if (!CURRENCIES.includes(currency as (typeof CURRENCIES)[number])) {
    return "Invalid currency.";
  }
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    return "Enter a valid delivery fee.";
  }
  return {
    name,
    slug,
    description: description || undefined,
    currency,
    deliveryFee,
    logoUrl: logoUrl || undefined,
    phone: phone || undefined,
    whatsapp: whatsapp || undefined,
    autoDeductInventory,
    notifyOnNewOrder,
    notifyCustomerOnStatus,
    ownerNotifyEmail: ownerNotifyEmail || undefined,
    bankName: bankParsed?.bankName,
    bankAccountName: bankParsed?.bankAccountName,
    bankAccountNumber: bankParsed?.bankAccountNumber,
  };
}

export async function updateBusinessSettings(businessId: string, input: BusinessSettingsInput) {
  const existing = await prisma.business.findFirst({
    where: { slug: input.slug, NOT: { id: businessId } },
  });
  if (existing) {
    throw new Error("This store URL is already taken. Try another.");
  }

  return prisma.business.update({
    where: { id: businessId },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      currency: input.currency,
      deliveryFee: input.deliveryFee,
      logoUrl: input.logoUrl ?? null,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      autoDeductInventory: input.autoDeductInventory,
      notifyOnNewOrder: input.notifyOnNewOrder,
      notifyCustomerOnStatus: input.notifyCustomerOnStatus,
      ownerNotifyEmail: input.ownerNotifyEmail ?? null,
      bankName: input.bankName ?? null,
      bankAccountName: input.bankAccountName ?? null,
      bankAccountNumber: input.bankAccountNumber ?? null,
    },
  });
}