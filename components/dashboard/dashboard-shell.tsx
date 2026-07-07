"use client";

import type { ReactNode } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type { StoreSwitcherOption } from "@/components/dashboard/store-switcher";
import { useMobileNav } from "@/components/dashboard/use-mobile-nav";
import { presetLabel } from "@/lib/dashboard/nav";
import type { StoreAccessRole } from "@/lib/store-access-types";
import type { MemberPermissions } from "@/lib/team/permissions-shared";

type DashboardShellProps = {
  businessName: string;
  businessSlug: string;
  businessId: string;
  userName: string;
  userRole?: string;
  storeAccessRole?: StoreAccessRole;
  accessPreset?: string | null;
  permissions?: MemberPermissions;
  accessibleStores?: StoreSwitcherOption[];
  children: ReactNode;
};

export function DashboardShell({
  businessName,
  businessSlug,
  businessId,
  userName,
  userRole,
  storeAccessRole = "owner",
  accessPreset = null,
  permissions,
  accessibleStores = [],
  children,
}: DashboardShellProps) {
  const { navOpen, setNavOpen } = useMobileNav();
  const roleBadge =
    storeAccessRole === "staff" ? presetLabel(accessPreset) : null;

  return (
    <div className="cf-dash-shell">
      <div className="cf-dash-chrome lg:hidden">
        <header className="cf-dash-mobile-bar">
          <button
            type="button"
            onClick={() => setNavOpen((open) => !open)}
            className="cf-dash-menu-btn"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            aria-controls="seller-dashboard-nav"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#1d1d1f] text-white">
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
                {businessName}
              </p>
              <p className="truncate text-[11px] text-[#86868b]">
                /{businessSlug}
                {roleBadge ? ` · ${roleBadge}` : ""}
              </p>
            </div>
          </div>
        </header>
      </div>

      {navOpen ? (
        <button
          type="button"
          className="cf-dash-overlay lg:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <DashboardSidebar
        id="seller-dashboard-nav"
        businessName={businessName}
        businessSlug={businessSlug}
        businessId={businessId}
        userName={userName}
        userRole={userRole}
        storeAccessRole={storeAccessRole}
        accessPreset={accessPreset}
        permissions={permissions}
        accessibleStores={accessibleStores}
        mobileOpen={navOpen}
        onNavigate={() => setNavOpen(false)}
        onClose={() => setNavOpen(false)}
      />

      <div className="cf-dash-main">{children}</div>
    </div>
  );
}