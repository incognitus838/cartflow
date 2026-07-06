/**
 * Add a 6-item media gallery to a demo product for slideshow testing.
 * Run: npm run db:enrich-gallery
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PRODUCT_ID = process.env.PRODUCT_ID ?? "cmr7ts0ps00m3by1oaw6f8trn";

const GALLERY = [
  {
    url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=1200&fit=crop&q=85",
    mediaType: "IMAGE",
    alt: "Product hero",
  },
  {
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=1200&fit=crop&q=85",
    mediaType: "IMAGE",
    alt: "Texture detail",
  },
  {
    url: "https://images.unsplash.com/photo-1631214524020-7e3819a45aa1?w=1200&h=1200&fit=crop&q=85",
    mediaType: "IMAGE",
    alt: "Application",
  },
  {
    url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&h=1200&fit=crop&q=85",
    mediaType: "IMAGE",
    alt: "Ingredients",
  },
  {
    url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=1200&fit=crop&q=85",
    mediaType: "IMAGE",
    alt: "Packaging",
  },
  {
    url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1200&h=1200&fit=crop&q=85",
    mediaType: "IMAGE",
    alt: "Lifestyle",
  },
];

async function main() {
  let product = await prisma.product.findUnique({
    where: { id: PRODUCT_ID },
    include: { images: true },
  });

  if (!product) {
    product = await prisma.product.findFirst({
      where: { business: { slug: "glow-beauty" }, status: "ACTIVE" },
      include: { images: true },
      orderBy: { createdAt: "asc" },
    });
  }

  if (!product) {
    console.error("No product found. Run npm run db:seed-beauty first.");
    process.exit(1);
  }

  await prisma.productImage.deleteMany({ where: { productId: product.id } });

  for (let i = 0; i < GALLERY.length; i++) {
    const item = GALLERY[i];
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.url,
        alt: item.alt,
        mediaType: item.mediaType,
        sortOrder: i,
      },
    });
  }

  console.log(`Gallery updated for: ${product.title}`);
  console.log(`Product ID: ${product.id}`);
  console.log(`Items: ${GALLERY.length}`);
  console.log(`View: http://localhost:3001/glow-beauty/products/${product.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());