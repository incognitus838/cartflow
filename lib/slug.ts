const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "broadcast",
  "customers",
  "dashboard",
  "demo",
  "faq",
  "invite",
  "login",
  "offline",
  "onboarding",
  "orders",
  "settings",
  "signup",
  "store",
  "stores",
  "www",
]);

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlug(slug: string) {
  if (!slug || slug.length < 3 || slug.length > 48) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  return true;
}

export function suggestSlug(name: string) {
  let base = slugify(name);
  if (!base) return "my-store";
  if (base.length < 3) base = `${base}-store`;
  if (!isValidSlug(base)) return "my-store";
  return base.slice(0, 48);
}