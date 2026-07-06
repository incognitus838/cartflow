import { prisma } from "@/lib/db";
import { normalizeAccentColor } from "@/lib/storefront/theme";
import type { StorefrontProfileInput } from "@/lib/business/storefront-profile-shared";

export type {
  StorefrontProfile,
  StorefrontProfileInput,
} from "@/lib/business/storefront-profile-shared";

export {
  CATALOG_LAYOUT_OPTIONS,
  DEFAULT_STOREFRONT_PROFILE,
  parseStorefrontProfileInput,
  STOREFRONT_THEME_OPTIONS,
  toStorefrontProfile,
} from "@/lib/business/storefront-profile-shared";

export async function updateStorefrontProfile(businessId: string, input: StorefrontProfileInput) {
  return prisma.business.update({
    where: { id: businessId },
    data: {
      storefrontTheme: input.storefrontTheme,
      accentColor: input.accentColor ? normalizeAccentColor(input.accentColor) : null,
      heroTagline: input.heroTagline ?? null,
      welcomeMessage: input.welcomeMessage ?? null,
      showContactButton: input.showContactButton,
      catalogLayout: input.catalogLayout,
    },
  });
}