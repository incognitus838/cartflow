import { notFound } from "next/navigation";
import { getStorefrontBySlug } from "@/lib/queries/storefront";
import { isValidSlug } from "@/lib/slug";

export async function resolveStorefront(slug: string) {
  if (!isValidSlug(slug)) {
    notFound();
  }

  const store = await getStorefrontBySlug(slug);
  if (!store) {
    notFound();
  }

  return store;
}