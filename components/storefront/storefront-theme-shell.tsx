import type { ReactNode } from "react";
import type { StorefrontProfile } from "@/lib/business/storefront-profile-shared";
import { themeStyleVars } from "@/lib/storefront/theme";

type StorefrontThemeShellProps = {
  profile: Pick<StorefrontProfile, "storefrontTheme" | "accentColor">;
  children: ReactNode;
  className?: string;
};

export function StorefrontThemeShell({
  profile,
  children,
  className = "",
}: StorefrontThemeShellProps) {
  return (
    <div
      data-store-theme={profile.storefrontTheme}
      className={`storefront-themed flex min-h-full flex-col bg-[var(--store-bg)] text-[var(--store-text)] ${className}`}
      style={themeStyleVars(profile)}
    >
      {children}
    </div>
  );
}