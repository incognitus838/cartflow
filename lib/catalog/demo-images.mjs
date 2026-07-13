/**
 * Demo image helpers — product photos are local files in public/demo-products/.
 * @see product-image-catalog.mjs
 */
import {
  CATEGORY_PHOTO_IDS,
  productImageUrl,
  localProductImagePath,
} from "./product-image-catalog.mjs";

export { productImageUrl, localProductImagePath };

/** First product image for a category (hero / logos). */
export function categoryHeroImage(vertical, categorySlug) {
  return productImageUrl(vertical, categorySlug, 0);
}

/** Pick a hero preview image for a store vertical. */
export function pickImage(vertical, index) {
  const categories = Object.keys(CATEGORY_PHOTO_IDS[vertical] ?? CATEGORY_PHOTO_IDS.beauty);
  const categorySlug = categories[index % categories.length];
  return productImageUrl(vertical, categorySlug, index);
}

/** @deprecated Use productImageUrl(vertical, categorySlug, index) */
export function imagesForCategory(vertical, count, offset = 0) {
  const categories = Object.keys(CATEGORY_PHOTO_IDS[vertical] ?? {});
  const categorySlug = categories[0] ?? "skincare";
  return Array.from({ length: count }, (_, i) =>
    productImageUrl(vertical, categorySlug, offset + i),
  );
}