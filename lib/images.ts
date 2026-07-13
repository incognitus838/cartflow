/** Same-origin paths served from /public — skip /_next/image optimizer. */
export function isLocalStaticImage(url: string): boolean {
  if (!url) return false;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return false;
  return url.startsWith("/");
}

/** Resize remote image URLs (Unsplash etc.) for faster loads. */
export function optimizeImageUrl(url: string, width = 480) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "images.unsplash.com") {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", "80");
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    }
  } catch {
    return url;
  }
  return url;
}