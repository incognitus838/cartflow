/**
 * Verified Unsplash product photos (HTTP 200).
 * Run scripts/check-unsplash-ids.mjs after changing IDs.
 */
import { SKINCARE_IMAGES } from "./skincare-images.mjs";

export function photoUrl(id, width = 800) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${width}&fit=crop&q=80&auto=format`;
}

/** @type {Record<string, string[]>} */
export const IMAGE_POOLS = {
  beauty: [
    SKINCARE_IMAGES.serum,
    SKINCARE_IMAGES.moisturizer,
    SKINCARE_IMAGES.sunscreen,
    SKINCARE_IMAGES.toner,
    SKINCARE_IMAGES.bodyCream,
    SKINCARE_IMAGES.cleanser,
    photoUrl("1596462502278-27bfdc403348"),
    photoUrl("1522335789203-aabd1fc54bc9"),
    photoUrl("1512496015851-a90fb38ba796"),
    photoUrl("1515377905703-c4788e51af15"),
    photoUrl("1571875257727-256c39da42af"),
    photoUrl("1612817288484-6f916006741a"),
  ],
  fashion: [
    photoUrl("1445205170230-053b83016050"),
    photoUrl("1542291026-7eec264c27ff"),
    photoUrl("1490481651871-ab68de25d43d"),
    photoUrl("1535632066927-ab7c9ab60908"),
    photoUrl("1549298916-b41d501d3772"),
    photoUrl("1441986300917-64674bd600d8"),
    photoUrl("1560472354-b33ff0c44a43"),
  ],
  food: [
    photoUrl("1504674900247-0877df9cc836"),
    photoUrl("1495474472287-4d71bcdd2085"),
    photoUrl("1558618666-fcd25c85cd64"),
    photoUrl("1555507036-ab1f4038808a"),
    photoUrl("1488477181946-6428a0291777"),
    photoUrl("1512621776951-a57141f2eefd"),
    photoUrl("1556742049-0cfed4f6a45d"),
    photoUrl("1556679343-c7306c1976bc"),
  ],
  tech: [
    photoUrl("1590658268037-6bf12165a8df"),
    photoUrl("1511707171634-5f897ff02aa9"),
    photoUrl("1523275335684-37898b6baf30"),
    photoUrl("1484704849700-f032a568e944"),
    photoUrl("1556742049-0cfed4f6a45d"),
    photoUrl("1441986300917-64674bd600d8"),
  ],
  home: [
    photoUrl("1586023492125-27b2c045efd7"),
    photoUrl("1556910103-1c02745aae4d"),
    photoUrl("1618221195710-dd6b41faaea6"),
    photoUrl("1571781926291-c477ebfd024b"),
    photoUrl("1556228578-0d85b1a4d571"),
    photoUrl("1571875257727-256c39da42af"),
  ],
  fitness: [
    photoUrl("1571019614242-c5c5dee9f50b"),
    photoUrl("1517836357463-d25dfeac3438"),
    photoUrl("1602143407151-7111542de6e8"),
    photoUrl("1576678927484-cc907957088c"),
    photoUrl("1518611012118-696072aa579a"),
    photoUrl("1544367567-0f2fcb009e0b"),
    photoUrl("1556228578-0d85b1a4d571"),
  ],
  kids: [
    photoUrl("1503676260728-1c00da094a0b"),
    photoUrl("1441986300917-64674bd600d8"),
    photoUrl("1553062407-98eeb64c6a62"),
    photoUrl("1560472354-b33ff0c44a43"),
    photoUrl("1490481651871-ab68de25d43d"),
  ],
};

export function pickImage(pool, index) {
  const images = IMAGE_POOLS[pool] ?? IMAGE_POOLS.beauty;
  return images[index % images.length];
}

/** Build a repeating image list for catalog categories. */
export function imagesForCategory(pool, count, offset = 0) {
  return Array.from({ length: count }, (_, i) => pickImage(pool, offset + i));
}