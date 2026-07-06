"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

type DashboardShellProps = {
  businessName: string;
  businessSlug: string;
  userName: string;
  userRole?: string;
  children: ReactNode;
};

export function DashboardShell({
  businessName,
  businessSlug,
  userName,
  userRole,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="cf-dash-shell">
      <header className="cf-dash-mobile-bar lg:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="cf-dash-menu-btn"
          aria-label="Open menu"
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
            <p className="truncate text-[11px] text-[#86868b]">/{businessSlug}</p>
          </div>
        </div>
      </header>

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
        userName={userName}
        userRole={userRole}
        mobileOpen={navOpen}
        onNavigate={() => setNavOpen(false)}
        onClose={() => setNavOpen(false)}
      />

      <div className="cf-dash-main">{children}</div>
    </div>
  );
}