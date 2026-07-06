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