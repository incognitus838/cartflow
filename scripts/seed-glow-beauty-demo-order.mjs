/**
 * Seed a demo trackable order for Glow Beauty (SHIPPED, with receipt).
 * Run: npm run db:seed-demo-order
 *
 * Demo credentials:
 *   Order ID: CF-20260707-DEMO
 *   Phone:    08099887766
 *   Track:    /glow-beauty/track?order=CF-20260707-DEMO&phone=08099887766
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STORE_SLUG = "glow-beauty";
const ORDER_NUMBER = "CF-20260707-DEMO";
const CUSTOMER_PHONE = "08099887766";
const CUSTOMER_NAME = "Amara Okafor";

/** Minimal 1×1 PNG */
const RECEIPT_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  const business = await prisma.business.findUnique({ where: { slug: STORE_SLUG } });
  if (!business) {
    console.error(`Store "${STORE_SLUG}" not found. Run: npm run db:seed-beauty`);
    process.exit(1);
  }

  const products = await prisma.product.findMany({
    where: { businessId: business.id, status: "ACTIVE" },
    take: 2,
    orderBy: { sortOrder: "asc" },
    include: { variants: { take: 1 } },
  });

  if (products.length < 2) {
    console.error("Need at least 2 active products. Run: npm run db:seed-beauty");
    process.exit(1);
  }

  const [first, second] = products;

  const lineItems = [first, second].map((product) => {
    const variant = product.variants[0] ?? null;
    const unitPrice = variant?.price != null ? Number(variant.price) : Number(product.price);
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      title: product.title,
      variantName: variant?.name ?? null,
      sku: variant?.sku ?? null,
      quantity: 1,
      unitPrice,
      total: unitPrice,
    };
  });

  const subtotal = lineItems.reduce((sum, line) => sum + line.total, 0);
  const deliveryFee = Number(business.deliveryFee) || 2000;
  const total = subtotal + deliveryFee;
  const now = new Date();

  const order = await prisma.order.upsert({
    where: {
      businessId_orderNumber: { businessId: business.id, orderNumber: ORDER_NUMBER },
    },
    update: {
      status: "SHIPPED",
      subtotal,
      deliveryFee,
      total,
      customerName: CUSTOMER_NAME,
      customerPhone: CUSTOMER_PHONE,
      customerAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
      paymentReceiptData: RECEIPT_BYTES,
      paymentReceiptMimeType: "image/png",
      paymentReceiptFilename: "demo-receipt.png",
      paymentReceiptSubmittedAt: now,
      paymentRejectionReason: null,
      items: {
        deleteMany: {},
        create: lineItems,
      },
    },
    create: {
      businessId: business.id,
      orderNumber: ORDER_NUMBER,
      status: "SHIPPED",
      subtotal,
      deliveryFee,
      total,
      paymentProvider: "MANUAL",
      customerName: CUSTOMER_NAME,
      customerPhone: CUSTOMER_PHONE,
      customerAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
      notes: "Demo order for live tracking",
      paymentReceiptData: RECEIPT_BYTES,
      paymentReceiptMimeType: "image/png",
      paymentReceiptFilename: "demo-receipt.png",
      paymentReceiptSubmittedAt: now,
      items: { create: lineItems },
    },
    include: { items: true },
  });

  console.log("Demo order ready:");
  console.log(`  Store:  ${STORE_SLUG}`);
  console.log(`  Order:  ${order.orderNumber}`);
  console.log(`  Phone:  ${CUSTOMER_PHONE}`);
  console.log(`  Status: ${order.status}`);
  console.log(`  Items:  ${order.items.map((i) => i.title).join(", ")}`);
  console.log(`  Total:  ₦${Number(order.total).toLocaleString("en-NG")}`);
  console.log(`\nTrack: /${STORE_SLUG}/track?order=${ORDER_NUMBER}&phone=${CUSTOMER_PHONE}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());