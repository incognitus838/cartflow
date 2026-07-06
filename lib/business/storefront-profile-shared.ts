import type { CatalogLayout, StorefrontTheme } from "@prisma/client";
import { DEFAULT_ACCENT, isValidAccentColor, normalizeAccentColor } from "@/lib/storefront/theme";

export type StorefrontProfileInput = {
  storefrontTheme: StorefrontTheme;
  accentColor?: string;
  heroTagline?: string;
  welcomeMessage?: string;
  showContactButton: boolean;
  catalogLayout: CatalogLayout;
};

export type StorefrontProfile = {
  storefrontTheme: StorefrontTheme;
  accentColor: string;
  heroTagline: string | null;
  welcomeMessage: string | null;
  showContactButton: boolean;
  catalogLayout: CatalogLayout;
};

const THEMES: StorefrontTheme[] = ["CLASSIC", "WARM", "DARK"];
const LAYOUTS: CatalogLayout[] = ["GRID", "LIST"];

export function toStorefrontProfile(business: {
  storefrontTheme: StorefrontTheme;
  accentColor: string | null;
  heroTagline: string | null;
  welcomeMessage: string | null;
  showContactButton: boolean;
  catalogLayout: CatalogLayout;
}): StorefrontProfile {
  return {
    storefrontTheme: business.storefrontTheme,
    accentColor: normalizeAccentColor(business.accentColor),
    heroTagline: business.heroTagline,
    welcomeMessage: business.welcomeMessage,
    showContactButton: business.showContactButton,
    catalogLayout: business.catalogLayout,
  };
}

export function parseStorefrontProfileInput(body: unknown): StorefrontProfileInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const theme = typeof data.storefrontTheme === "string" ? data.storefrontTheme : "CLASSIC";
  const layout = typeof data.catalogLayout === "string" ? data.catalogLayout : "GRID";
  const accentRaw = typeof data.accentColor === "string" ? data.accentColor.trim() : "";
  const heroTagline = typeof data.heroTagline === "string" ? data.heroTagline.trim() : "";
  const welcomeMessage = typeof data.welcomeMessage === "string" ? data.welcomeMessage.trim() : "";
  const showContactButton = data.showContactButton !== false;

  if (!THEMES.includes(theme as StorefrontTheme)) {
    return "Invalid storefront theme.";
  }
  if (!LAYOUTS.includes(layout as CatalogLayout)) {
    return "Invalid catalog layout.";
  }
  if (accentRaw && !isValidAccentColor(accentRaw)) {
    return "Accent color must be a valid hex code (e.g. #b8956a).";
  }
  if (heroTagline.length > 120) return "Tagline must be 120 characters or fewer.";
  if (welcomeMessage.length > 280) return "Welcome message must be 280 characters or fewer.";

  return {
    storefrontTheme: theme as StorefrontTheme,
    accentColor: accentRaw || undefined,
    heroTagline: heroTagline || undefined,
    welcomeMessage: welcomeMessage || undefined,
    showContactButton,
    catalogLayout: layout as CatalogLayout,
  };
}

export const STOREFRONT_THEME_OPTIONS: Array<{ value: StorefrontTheme; label: string; hint: string }> =
  [
    { value: "CLASSIC", label: "Classic", hint: "Clean Apple-style light storefront" },
    { value: "WARM", label: "Warm", hint: "Soft cream background with gold accents" },
    { value: "DARK", label: "Dark", hint: "Premium dark mode for luxury brands" },
  ];

export const CATALOG_LAYOUT_OPTIONS: Array<{ value: CatalogLayout; label: string }> = [
  { value: "GRID", label: "Grid" },
  { value: "LIST", label: "List" },
];

export const DEFAULT_STOREFRONT_PROFILE: StorefrontProfile = {
  storefrontTheme: "CLASSIC",
  accentColor: DEFAULT_ACCENT,
  heroTagline: null,
  welcomeMessage: null,
  showContactButton: true,
  catalogLayout: "GRID",
};