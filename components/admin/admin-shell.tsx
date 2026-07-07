"use client";

import type { ReactNode } from "react";
import { Menu, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { useMobileNav } from "@/components/dashboard/use-mobile-nav";

type AdminShellProps = {
  userEmail: string;
  userName: string;
  pendingApprovals?: number;
  children: ReactNode;
};

export function AdminShell({
  userEmail,
  userName,
  pendingApprovals = 0,
  children,
}: AdminShellProps) {
  const { navOpen, setNavOpen } = useMobileNav();

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
            aria-controls="admin-dashboard-nav"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#1d1d1f] text-white">
              <Shield className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
                Platform admin
              </p>
              <p className="truncate text-[11px] text-[#86868b]">{userEmail}</p>
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

      <AdminSidebar
        id="admin-dashboard-nav"
        userEmail={userEmail}
        userName={userName}
        pendingApprovals={pendingApprovals}
        mobileOpen={navOpen}
        onNavigate={() => setNavOpen(false)}
        onClose={() => setNavOpen(false)}
      />

      <div className="cf-dash-main">{children}</div>
    </div>
  );
}