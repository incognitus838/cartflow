import type { Prisma } from "@prisma/client";
import type { ProductType } from "@/lib/products/product-types";

export type ProductMetadata = {
  productType: ProductType;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  customFields: Record<string, string>;
  digitalDeliveryUrl: string;
  digitalFileType: string;
  accessInstructions: string;
  expiryDate: string;
  prepTimeMinutes: string;
  storageInstructions: string;
  unitOfMeasure: string;
  weightKg: string;
  sku: string;
  shippingNotes: string;
  serviceDuration: string;
  bookingLeadTime: string;
  availabilityNotes: string;
  scheduledAt: string;
};

export const emptyProductMetadata = (): ProductMetadata => ({
  productType: "PHYSICAL",
  tags: [],
  seoTitle: "",
  seoDescription: "",
  customFields: {},
  digitalDeliveryUrl: "",
  digitalFileType: "",
  accessInstructions: "",
  expiryDate: "",
  prepTimeMinutes: "",
  storageInstructions: "",
  unitOfMeasure: "",
  weightKg: "",
  sku: "",
  shippingNotes: "",
  serviceDuration: "",
  bookingLeadTime: "",
  availabilityNotes: "",
  scheduledAt: "",
});

export function parseProductMetadata(raw: unknown): ProductMetadata {
  const base = emptyProductMetadata();
  if (!raw || typeof raw !== "object") return base;

  const data = raw as Record<string, unknown>;
  const productType = data.productType;
  if (
    productType === "ONLINE" ||
    productType === "PHYSICAL" ||
    productType === "DIGITAL" ||
    productType === "FOOD" ||
    productType === "SERVICE"
  ) {
    base.productType = productType;
  }

  if (Array.isArray(data.tags)) {
    base.tags = data.tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof data.seoTitle === "string") base.seoTitle = data.seoTitle;
  if (typeof data.seoDescription === "string") base.seoDescription = data.seoDescription;
  if (typeof data.digitalDeliveryUrl === "string") base.digitalDeliveryUrl = data.digitalDeliveryUrl;
  if (typeof data.digitalFileType === "string") base.digitalFileType = data.digitalFileType;
  if (typeof data.accessInstructions === "string") base.accessInstructions = data.accessInstructions;
  if (typeof data.expiryDate === "string") base.expiryDate = data.expiryDate;
  if (typeof data.prepTimeMinutes === "string") base.prepTimeMinutes = data.prepTimeMinutes;
  if (typeof data.storageInstructions === "string") base.storageInstructions = data.storageInstructions;
  if (typeof data.unitOfMeasure === "string") base.unitOfMeasure = data.unitOfMeasure;
  if (typeof data.weightKg === "string") base.weightKg = data.weightKg;
  if (typeof data.sku === "string") base.sku = data.sku;
  if (typeof data.shippingNotes === "string") base.shippingNotes = data.shippingNotes;
  if (typeof data.serviceDuration === "string") base.serviceDuration = data.serviceDuration;
  if (typeof data.bookingLeadTime === "string") base.bookingLeadTime = data.bookingLeadTime;
  if (typeof data.availabilityNotes === "string") base.availabilityNotes = data.availabilityNotes;
  if (typeof data.scheduledAt === "string") base.scheduledAt = data.scheduledAt;

  if (data.customFields && typeof data.customFields === "object") {
    base.customFields = Object.fromEntries(
      Object.entries(data.customFields as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  }

  return base;
}

export function serializeProductMetadata(metadata: ProductMetadata): Prisma.InputJsonValue {
  return {
    productType: metadata.productType,
    tags: metadata.tags.filter(Boolean),
    seoTitle: metadata.seoTitle.trim() || undefined,
    seoDescription: metadata.seoDescription.trim() || undefined,
    customFields: Object.keys(metadata.customFields).length ? metadata.customFields : undefined,
    digitalDeliveryUrl: metadata.digitalDeliveryUrl.trim() || undefined,
    digitalFileType: metadata.digitalFileType.trim() || undefined,
    accessInstructions: metadata.accessInstructions.trim() || undefined,
    expiryDate: metadata.expiryDate || undefined,
    prepTimeMinutes: metadata.prepTimeMinutes || undefined,
    storageInstructions: metadata.storageInstructions.trim() || undefined,
    unitOfMeasure: metadata.unitOfMeasure.trim() || undefined,
    weightKg: metadata.weightKg || undefined,
    sku: metadata.sku.trim() || undefined,
    shippingNotes: metadata.shippingNotes.trim() || undefined,
    serviceDuration: metadata.serviceDuration.trim() || undefined,
    bookingLeadTime: metadata.bookingLeadTime.trim() || undefined,
    availabilityNotes: metadata.availabilityNotes.trim() || undefined,
    scheduledAt: metadata.scheduledAt || undefined,
  };
}