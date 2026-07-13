/**
 * Semantic product images — 6 unique photos per category, verified on Unsplash.
 * Local copies: public/demo-products/{vertical}/{category}-{0-5}.jpg
 * Regenerate: npm run demo:download-images
 */

/** @type {Record<string, Record<string, string[]>>} */
export const CATEGORY_PHOTO_IDS = {
  beauty: {
    "lip-care": [
      "1596462502278-27bfdc403348",
      "1512496015851-a90fb38ba796",
      "1522335789203-aabd1fc54bc9",
      "1515377905703-c4788e51af15",
      "1571875257727-256c39da42af",
      "1608571423902-eed4a5ad8108",
    ],
    "oral-care": [
      "1612817288484-6f916006741a",
      "1556228578-0d85b1a4d571",
      "1571781926291-c477ebfd024b",
      "1556228720-195a672e8a03",
      "1608571423902-eed4a5ad8108",
      "1571875257727-256c39da42af",
    ],
    "body-wash": [
      "1556228578-0d85b1a4d571",
      "1571875257727-256c39da42af",
      "1612817288484-6f916006741a",
      "1571781926291-c477ebfd024b",
      "1556228720-195a672e8a03",
      "1608571423902-eed4a5ad8108",
    ],
    "face-makeup": [
      "1522335789203-aabd1fc54bc9",
      "1512496015851-a90fb38ba796",
      "1596462502278-27bfdc403348",
      "1515377905703-c4788e51af15",
      "1571875257727-256c39da42af",
      "1612817288484-6f916006741a",
    ],
    "eye-makeup": [
      "1512496015851-a90fb38ba796",
      "1522335789203-aabd1fc54bc9",
      "1596462502278-27bfdc403348",
      "1515377905703-c4788e51af15",
      "1608571423902-eed4a5ad8108",
      "1571781926291-c477ebfd024b",
    ],
    "nail-care": [
      "1596462502278-27bfdc403348",
      "1512496015851-a90fb38ba796",
      "1522335789203-aabd1fc54bc9",
      "1571875257727-256c39da42af",
      "1556228720-195a672e8a03",
      "1612817288484-6f916006741a",
    ],
    skincare: [
      "1608571423902-eed4a5ad8108",
      "1556228578-0d85b1a4d571",
      "1556228720-195a672e8a03",
      "1571781926291-c477ebfd024b",
      "1571875257727-256c39da42af",
      "1612817288484-6f916006741a",
    ],
    "hair-care": [
      "1556228578-0d85b1a4d571",
      "1571781926291-c477ebfd024b",
      "1571875257727-256c39da42af",
      "1612817288484-6f916006741a",
      "1608571423902-eed4a5ad8108",
      "1556228720-195a672e8a03",
    ],
    fragrance: [
      "1608571423902-eed4a5ad8108",
      "1571781926291-c477ebfd024b",
      "1556228578-0d85b1a4d571",
      "1596462502278-27bfdc403348",
      "1571875257727-256c39da42af",
      "1612817288484-6f916006741a",
    ],
    "bath-body": [
      "1571875257727-256c39da42af",
      "1571781926291-c477ebfd024b",
      "1612817288484-6f916006741a",
      "1556228578-0d85b1a4d571",
      "1556228720-195a672e8a03",
      "1608571423902-eed4a5ad8108",
    ],
  },
  fashion: {
    apparel: [
      "1445205170230-053b83016050",
      "1490481651871-ab68de25d43d",
      "1560472354-b33ff0c44a43",
      "1441986300917-64674bd600d8",
      "1542291026-7eec264c27ff",
      "1535632066927-ab7c9ab60908",
    ],
    bags: [
      "1549298916-b41d501d3772",
      "1553062407-98eeb64c6a62",
      "1560472354-b33ff0c44a43",
      "1490481651871-ab68de25d43d",
      "1445205170230-053b83016050",
      "1535632066927-ab7c9ab60908",
    ],
    shoes: [
      "1542291026-7eec264c27ff",
      "1560472354-b33ff0c44a43",
      "1445205170230-053b83016050",
      "1490481651871-ab68de25d43d",
      "1535632066927-ab7c9ab60908",
      "1549298916-b41d501d3772",
    ],
    accessories: [
      "1535632066927-ab7c9ab60908",
      "1560472354-b33ff0c44a43",
      "1490481651871-ab68de25d43d",
      "1445205170230-053b83016050",
      "1549298916-b41d501d3772",
      "1441986300917-64674bd600d8",
    ],
  },
  food: {
    "small-chops": [
      "1504674900247-0877df9cc836",
      "1495474472287-4d71bcdd2085",
      "1555507036-ab1f4038808a",
      "1565299624946-b28f40a0ae38",
      "1512621776951-a57141f2eefd",
      "1488477181946-6428a0291777",
    ],
    pastries: [
      "1555507036-ab1f4038808a",
      "1488477181946-6428a0291777",
      "1565299624946-b28f40a0ae38",
      "1495474472287-4d71bcdd2085",
      "1504674900247-0877df9cc836",
      "1512621776951-a57141f2eefd",
    ],
    drinks: [
      "1558618666-fcd25c85cd64",
      "1556679343-c7306c1976bc",
      "1556742049-0cfed4f6a45d",
      "1495474472287-4d71bcdd2085",
      "1504674900247-0877df9cc836",
      "1488477181946-6428a0291777",
    ],
    "meal-prep": [
      "1512621776951-a57141f2eefd",
      "1504674900247-0877df9cc836",
      "1565299624946-b28f40a0ae38",
      "1495474472287-4d71bcdd2085",
      "1555507036-ab1f4038808a",
      "1488477181946-6428a0291777",
    ],
  },
  tech: {
    audio: [
      "1590658268037-6bf12165a8df",
      "1484704849700-f032a568e944",
      "1511707171634-5f897ff02aa9",
      "1523275335684-37898b6baf30",
      "1556742049-0cfed4f6a45d",
      "1441986300917-64674bd600d8",
    ],
    chargers: [
      "1511707171634-5f897ff02aa9",
      "1556742049-0cfed4f6a45d",
      "1484704849700-f032a568e944",
      "1590658268037-6bf12165a8df",
      "1523275335684-37898b6baf30",
      "1441986300917-64674bd600d8",
    ],
    phones: [
      "1511707171634-5f897ff02aa9",
      "1523275335684-37898b6baf30",
      "1590658268037-6bf12165a8df",
      "1484704849700-f032a568e944",
      "1556742049-0cfed4f6a45d",
      "1441986300917-64674bd600d8",
    ],
    "smart-home": [
      "1484704849700-f032a568e944",
      "1590658268037-6bf12165a8df",
      "1511707171634-5f897ff02aa9",
      "1523275335684-37898b6baf30",
      "1556742049-0cfed4f6a45d",
      "1618221195710-dd6b41faaea6",
    ],
  },
  home: {
    bedding: [
      "1586023492125-27b2c045efd7",
      "1618221195710-dd6b41faaea6",
      "1556910103-1c02745aae4d",
      "1571875257727-256c39da42af",
      "1571781926291-c477ebfd024b",
      "1556228578-0d85b1a4d571",
    ],
    kitchen: [
      "1556910103-1c02745aae4d",
      "1618221195710-dd6b41faaea6",
      "1586023492125-27b2c045efd7",
      "1504674900247-0877df9cc836",
      "1495474472287-4d71bcdd2085",
      "1555507036-ab1f4038808a",
    ],
    decor: [
      "1618221195710-dd6b41faaea6",
      "1586023492125-27b2c045efd7",
      "1556910103-1c02745aae4d",
      "1571875257727-256c39da42af",
      "1571781926291-c477ebfd024b",
      "1608571423902-eed4a5ad8108",
    ],
    cleaning: [
      "1612817288484-6f916006741a",
      "1556228578-0d85b1a4d571",
      "1571781926291-c477ebfd024b",
      "1618221195710-dd6b41faaea6",
      "1586023492125-27b2c045efd7",
      "1556910103-1c02745aae4d",
    ],
  },
  fitness: {
    activewear: [
      "1571019614242-c5c5dee9f50b",
      "1517836357463-d25dfeac3438",
      "1576678927484-cc907957088c",
      "1518611012118-696072aa579a",
      "1544367567-0f2fcb009e0b",
      "1602143407151-7111542de6e8",
    ],
    equipment: [
      "1517836357463-d25dfeac3438",
      "1576678927484-cc907957088c",
      "1571019614242-c5c5dee9f50b",
      "1518611012118-696072aa579a",
      "1544367567-0f2fcb009e0b",
      "1602143407151-7111542de6e8",
    ],
    supplements: [
      "1602143407151-7111542de6e8",
      "1556228578-0d85b1a4d571",
      "1571781926291-c477ebfd024b",
      "1612817288484-6f916006741a",
      "1571019614242-c5c5dee9f50b",
      "1517836357463-d25dfeac3438",
    ],
    recovery: [
      "1518611012118-696072aa579a",
      "1544367567-0f2fcb009e0b",
      "1576678927484-cc907957088c",
      "1602143407151-7111542de6e8",
      "1517836357463-d25dfeac3438",
      "1571019614242-c5c5dee9f50b",
    ],
  },
  kids: {
    baby: [
      "1503676260728-1c00da094a0b",
      "1441986300917-64674bd600d8",
      "1490481651871-ab68de25d43d",
      "1553062407-98eeb64c6a62",
      "1560472354-b33ff0c44a43",
      "1445205170230-053b83016050",
    ],
    toys: [
      "1441986300917-64674bd600d8",
      "1503676260728-1c00da094a0b",
      "1553062407-98eeb64c6a62",
      "1560472354-b33ff0c44a43",
      "1490481651871-ab68de25d43d",
      "1535632066927-ab7c9ab60908",
    ],
    school: [
      "1553062407-98eeb64c6a62",
      "1503676260728-1c00da094a0b",
      "1441986300917-64674bd600d8",
      "1560472354-b33ff0c44a43",
      "1549298916-b41d501d3772",
      "1490481651871-ab68de25d43d",
    ],
    "kids-wear": [
      "1490481651871-ab68de25d43d",
      "1445205170230-053b83016050",
      "1560472354-b33ff0c44a43",
      "1503676260728-1c00da094a0b",
      "1441986300917-64674bd600d8",
      "1553062407-98eeb64c6a62",
    ],
  },
};

const SLOTS_PER_CATEGORY = 6;

export function unsplashDownloadUrl(photoId, size = 900) {
  return `https://images.unsplash.com/photo-${photoId}?w=${size}&h=${size}&fit=crop&q=85&auto=format`;
}

export function localProductImagePath(vertical, categorySlug, productIndex) {
  const slot = productIndex % SLOTS_PER_CATEGORY;
  return `/demo-products/${vertical}/${categorySlug}-${slot}.jpg`;
}

export function getCategoryPhotoIds(vertical, categorySlug) {
  const ids = CATEGORY_PHOTO_IDS[vertical]?.[categorySlug];
  if (!ids?.length) {
    throw new Error(`No product images for ${vertical}/${categorySlug}`);
  }
  return ids;
}

/** URL stored on products — local file served from /public. */
export function productImageUrl(vertical, categorySlug, productIndex) {
  return localProductImagePath(vertical, categorySlug, productIndex);
}

export function listAllImageDownloads() {
  const items = [];
  for (const [vertical, categories] of Object.entries(CATEGORY_PHOTO_IDS)) {
    for (const [categorySlug, photoIds] of Object.entries(categories)) {
      photoIds.forEach((photoId, slot) => {
        items.push({
          vertical,
          categorySlug,
          slot,
          photoId,
          remoteUrl: unsplashDownloadUrl(photoId),
          localPath: `/demo-products/${vertical}/${categorySlug}-${slot}.jpg`,
          fileRelative: `public/demo-products/${vertical}/${categorySlug}-${slot}.jpg`,
        });
      });
    }
  }
  return items;
}