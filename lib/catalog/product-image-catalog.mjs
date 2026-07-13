/**
 * Semantic product images — 6 unique photos per category.
 * Local copies: public/demo-products/{vertical}/{category}-{0-5}.jpg
 * Regenerate: npm run demo:download-images -- --force
 * @revision pexels-fix-2026-07-13
 */

/** @param {number} id Pexels photo id */
function px(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop`;
}

/** @param {string} id Unsplash photo id (timestamp-hash) */
function us(id) {
  return `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop&q=85&auto=format`;
}

/**
 * Full remote URLs per category — each slot is semantically matched to the category.
 * @type {Record<string, Record<string, string[]>>}
 */
export const CATEGORY_IMAGE_URLS = {
  beauty: {
    "lip-care": [
      px(7667674),
      px(29229005),
      px(6634648),
      px(6634659),
      px(6634660),
      px(3762879),
    ],
    "oral-care": [
      px(6502617),
      px(6502618),
      px(3844788),
      px(3848677),
      px(3848680),
      px(3844789),
    ],
    "body-wash": [
      px(4467687),
      px(4467688),
      px(4041070),
      px(4041069),
      us("1556228720-195a672e8a03"),
      us("1571875257727-256c39da42af"),
    ],
    "face-makeup": [
      px(3373736),
      px(4148849),
      px(3992206),
      px(2867887),
      px(2533266),
      px(6634660),
    ],
    "eye-makeup": [
      px(2440471),
      px(2533266),
      px(2867887),
      px(3373736),
      px(3992206),
      px(4148849),
    ],
    "nail-care": [
      px(7842856),
      px(7842857),
      px(4966984),
      px(4966985),
      px(3993449),
      px(3993461),
    ],
    skincare: [
      px(4041392),
      px(4041391),
      px(3760263),
      px(4041070),
      px(4467687),
      us("1608571423902-eed4a5ad8108"),
    ],
    "hair-care": [
      px(3997372),
      px(3993446),
      px(3992875),
      px(3992876),
      us("1556228578-0d85b1a4d571"),
      us("1612817288484-6f916006741a"),
    ],
    fragrance: [
      px(965989),
      px(965990),
      px(965993),
      px(4202325),
      px(11039027),
      px(11039028),
    ],
    "bath-body": [
      px(4041069),
      px(4467687),
      px(3760263),
      px(4041070),
      px(4041391),
      us("1571781926291-c477ebfd024b"),
    ],
  },
  fashion: {
    apparel: [
      px(985635),
      px(996329),
      px(1040945),
      px(1536619),
      px(2983460),
      px(1926769),
    ],
    bags: [
      px(1152077),
      px(904350),
      px(2905238),
      px(1040945),
      px(1153574),
      px(1536619),
    ],
    shoes: [
      px(1598505),
      px(1598508),
      px(2983468),
      px(2983460),
      px(292999),
      px(1926769),
    ],
    accessories: [
      px(1191710),
      px(15148645),
      px(1458867),
      px(985635),
      px(1183425),
      px(1926769),
    ],
  },
  food: {
    "small-chops": [
      px(1640777),
      px(1092730),
      px(1646047),
      px(1640770),
      px(1438677),
      px(1646048),
    ],
    pastries: [
      px(2915285),
      px(1438677),
      px(1775043),
      px(1640770),
      px(2133181),
      px(2915286),
    ],
    drinks: [
      us("1558618666-fcd25c85cd64"),
      us("1556679343-c7306c1976bc"),
      px(1123254),
      px(1123255),
      px(1123256),
      us("1556742049-0cfed4f6a45d"),
    ],
    "meal-prep": [
      px(1646047),
      px(1646048),
      px(1640777),
      px(1640770),
      px(1092730),
      px(1438677),
    ],
  },
  tech: {
    audio: [
      px(3394650),
      px(3394651),
      px(1649771),
      px(1649772),
      px(700575),
      px(3394652),
    ],
    chargers: [
      px(4218885),
      px(4218886),
      px(4218887),
      us("1556742049-0cfed4f6a45d"),
      us("1484704849700-f032a568e944"),
      us("1511707171634-5f897ff02aa9"),
    ],
    phones: [
      px(699122),
      px(788946),
      px(1092644),
      px(1092645),
      px(1092638),
      px(1092640),
    ],
    "smart-home": [
      px(1037993),
      px(1037994),
      px(442150),
      px(442151),
      px(259027),
      px(259028),
    ],
  },
  home: {
    bedding: [
      px(1454806),
      px(1454811),
      us("1586023492125-27b2c045efd7"),
      us("1618221195710-dd6b41faaea6"),
      px(1571460),
      px(1571461),
    ],
    kitchen: [
      px(691114),
      px(2122196),
      px(1099680),
      px(1099681),
      us("1556910103-1c02745aae4d"),
      px(1457849),
    ],
    decor: [
      px(1571460),
      px(1571461),
      px(1571462),
      px(1457847),
      px(1457848),
      px(1457849),
    ],
    cleaning: [
      px(4099468),
      px(4099469),
      px(4099470),
      px(48891),
      us("1612817288484-6f916006741a"),
      us("1556228578-0d85b1a4d571"),
    ],
  },
  fitness: {
    activewear: [
      px(841130),
      px(1954524),
      px(1954525),
      px(1954526),
      px(2261482),
      px(841131),
    ],
    equipment: [
      px(1954524),
      px(1954525),
      px(1954526),
      px(2261482),
      px(2261483),
      px(841130),
    ],
    supplements: [
      px(3683107),
      px(3683108),
      px(3683109),
      px(3683110),
      px(3683111),
      px(3683112),
    ],
    recovery: [
      px(3757942),
      px(3757943),
      us("1544367567-0f2fcb009e0b"),
      us("1518611012118-696072aa579a"),
      us("1576678927484-cc907957088c"),
      us("1571019614242-c5c5dee9f50b"),
    ],
  },
  kids: {
    baby: [
      px(1628019),
      px(1628020),
      px(1628021),
      px(3556686),
      px(3556687),
      px(207691),
    ],
    toys: [
      px(256417),
      px(256418),
      px(256419),
      px(3661390),
      px(3661391),
      px(207693),
    ],
    school: [
      px(207691),
      px(207692),
      px(207693),
      px(256417),
      px(256418),
      px(256419),
    ],
    "kids-wear": [
      px(3556686),
      px(3556687),
      us("1490481651871-ab68de25d43d"),
      us("1445205170230-053b83016050"),
      px(1628019),
      px(1628020),
    ],
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