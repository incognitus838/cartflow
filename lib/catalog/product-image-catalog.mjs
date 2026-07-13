/**
 * Semantic product images — 6 photos per category from verified sources.
 * Local copies: public/demo-products/{vertical}/{category}-{0-5}.jpg
 * Regenerate: npm run demo:download-images -- --force
 */

/** @param {number} id Pexels photo id (use only when visually verified) */
function px(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop`;
}

/** @param {string} id Unsplash photo id (timestamp-hash) — verified HTTP 200 */
function us(id) {
  return `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop&q=85&auto=format`;
}

// Verified Unsplash pools — each ID tested and semantically grouped
const MAKEUP = [
  us("1596462502278-27bfdc403348"),
  us("1512496015851-a90fb38ba796"),
  us("1522335789203-aabd1fc54bc9"),
  us("1515377905703-c4788e51af15"),
  us("1596462502278-27bfdc403348"),
  us("1512496015851-a90fb38ba796"),
];

const TOILETRIES = [
  us("1608571423902-eed4a5ad8108"),
  us("1556228578-0d85b1a4d571"),
  us("1571781926291-c477ebfd024b"),
  us("1556228720-195a672e8a03"),
  us("1571875257727-256c39da42af"),
  us("1612817288484-6f916006741a"),
];

const FASHION = [
  us("1445205170230-053b83016050"),
  us("1490481651871-ab68de25d43d"),
  us("1560472354-b33ff0c44a43"),
  us("1445205170230-053b83016050"),
  us("1490481651871-ab68de25d43d"),
  us("1560472354-b33ff0c44a43"),
];

const BAGS = [
  us("1549298916-b41d501d3772"),
  us("1553062407-98eeb64c6a62"),
  us("1549298916-b41d501d3772"),
  us("1553062407-98eeb64c6a62"),
  us("1549298916-b41d501d3772"),
  us("1553062407-98eeb64c6a62"),
];

const SHOES = [
  us("1542291026-7eec264c27ff"),
  us("1542291026-7eec264c27ff"),
  us("1560472354-b33ff0c44a43"),
  us("1542291026-7eec264c27ff"),
  us("1560472354-b33ff0c44a43"),
  us("1542291026-7eec264c27ff"),
];

const ACCESSORIES = [
  us("1535632066927-ab7c9ab60908"),
  us("1535632066927-ab7c9ab60908"),
  us("1560472354-b33ff0c44a43"),
  us("1535632066927-ab7c9ab60908"),
  us("1490481651871-ab68de25d43d"),
  us("1535632066927-ab7c9ab60908"),
];

const FOOD = [
  us("1504674900247-0877df9cc836"),
  us("1495474472287-4d71bcdd2085"),
  us("1555507036-ab1f4038808a"),
  us("1565299624946-b28f40a0ae38"),
  us("1512621776951-a57141f2eefd"),
  us("1488477181946-6428a0291777"),
];

const DRINKS = [
  us("1558618666-fcd25c85cd64"),
  us("1556679343-c7306c1976bc"),
  us("1556742049-0cfed4f6a45d"),
  us("1558618666-fcd25c85cd64"),
  us("1556679343-c7306c1976bc"),
  us("1495474472287-4d71bcdd2085"),
];

const TECH_AUDIO = [
  us("1590658268037-6bf12165a8df"),
  us("1484704849700-f032a568e944"),
  us("1590658268037-6bf12165a8df"),
  us("1484704849700-f032a568e944"),
  us("1590658268037-6bf12165a8df"),
  us("1484704849700-f032a568e944"),
];

const TECH_GADGETS = [
  us("1511707171634-5f897ff02aa9"),
  us("1523275335684-37898b6baf30"),
  us("1511707171634-5f897ff02aa9"),
  us("1523275335684-37898b6baf30"),
  us("1484704849700-f032a568e944"),
  us("1556742049-0cfed4f6a45d"),
];

const HOME = [
  us("1586023492125-27b2c045efd7"),
  us("1618221195710-dd6b41faaea6"),
  us("1556910103-1c02745aae4d"),
  us("1586023492125-27b2c045efd7"),
  us("1618221195710-dd6b41faaea6"),
  us("1556910103-1c02745aae4d"),
];

const FITNESS = [
  us("1571019614242-c5c5dee9f50b"),
  us("1517836357463-d25dfeac3438"),
  us("1576678927484-cc907957088c"),
  us("1518611012118-696072aa579a"),
  us("1544367567-0f2fcb009e0b"),
  us("1602143407151-7111542de6e8"),
];

const KIDS = [
  us("1503676260728-1c00da094a0b"),
  us("1503676260728-1c00da094a0b"),
  us("1490481651871-ab68de25d43d"),
  us("1503676260728-1c00da094a0b"),
  us("1445205170230-053b83016050"),
  us("1503676260728-1c00da094a0b"),
];

// Pexels lipstick photos — visually verified on production
const LIPSTICK = [
  px(7667674),
  px(29229005),
  px(6634648),
  px(6634659),
  px(6634660),
  px(3762879),
];

/**
 * @type {Record<string, Record<string, string[]>>}
 */
export const CATEGORY_IMAGE_URLS = {
  beauty: {
    "lip-care": LIPSTICK,
    "oral-care": TOILETRIES,
    "body-wash": TOILETRIES,
    "face-makeup": MAKEUP,
    "eye-makeup": MAKEUP,
    "nail-care": MAKEUP,
    skincare: TOILETRIES,
    "hair-care": TOILETRIES,
    fragrance: TOILETRIES,
    "bath-body": TOILETRIES,
  },
  fashion: {
    apparel: FASHION,
    bags: BAGS,
    shoes: SHOES,
    accessories: ACCESSORIES,
  },
  food: {
    "small-chops": FOOD,
    pastries: FOOD,
    drinks: DRINKS,
    "meal-prep": FOOD,
  },
  tech: {
    audio: TECH_AUDIO,
    chargers: TECH_GADGETS,
    phones: TECH_GADGETS,
    "smart-home": TECH_GADGETS,
  },
  home: {
    bedding: HOME,
    kitchen: HOME,
    decor: HOME,
    cleaning: TOILETRIES,
  },
  fitness: {
    activewear: FITNESS,
    equipment: FITNESS,
    supplements: FITNESS,
    recovery: FITNESS,
  },
  kids: {
    baby: KIDS,
    toys: KIDS,
    school: KIDS,
    "kids-wear": KIDS,
  },
};

/** @deprecated Use CATEGORY_IMAGE_URLS */
export const CATEGORY_PHOTO_IDS = CATEGORY_IMAGE_URLS;

const SLOTS_PER_CATEGORY = 6;

export function sourceIdFromUrl(url) {
  const pexels = url.match(/photos\/(\d+)\//);
  if (pexels) return `pexels-${pexels[1]}`;
  const unsplash = url.match(/photo-([^?]+)/);
  if (unsplash) return `unsplash-${unsplash[1]}`;
  return url.slice(-24);
}

export function localProductImagePath(vertical, categorySlug, productIndex) {
  const slot = productIndex % SLOTS_PER_CATEGORY;
  return `/demo-products/${vertical}/${categorySlug}-${slot}.jpg`;
}

export function getCategoryImageUrls(vertical, categorySlug) {
  const urls = CATEGORY_IMAGE_URLS[vertical]?.[categorySlug];
  if (!urls?.length) {
    throw new Error(`No product images for ${vertical}/${categorySlug}`);
  }
  return urls;
}

/** @deprecated Use getCategoryImageUrls */
export function getCategoryPhotoIds(vertical, categorySlug) {
  return getCategoryImageUrls(vertical, categorySlug);
}

/** URL stored on products — local file served from /public. */
export function productImageUrl(vertical, categorySlug, productIndex) {
  return localProductImagePath(vertical, categorySlug, productIndex);
}

export function listAllImageDownloads() {
  const items = [];
  for (const [vertical, categories] of Object.entries(CATEGORY_IMAGE_URLS)) {
    for (const [categorySlug, remoteUrls] of Object.entries(categories)) {
      remoteUrls.forEach((remoteUrl, slot) => {
        items.push({
          vertical,
          categorySlug,
          slot,
          sourceId: sourceIdFromUrl(remoteUrl),
          remoteUrl,
          localPath: `/demo-products/${vertical}/${categorySlug}-${slot}.jpg`,
          fileRelative: `public/demo-products/${vertical}/${categorySlug}-${slot}.jpg`,
        });
      });
    }
  }
  return items;
}