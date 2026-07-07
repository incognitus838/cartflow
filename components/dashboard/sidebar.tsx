"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  Eye,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { navItemsForStoreRole } from "@/lib/dashboard/nav";
import type { StoreAccessRole } from "@/lib/store-access-types";

const NAV_ICONS = {
  "/dashboard": LayoutDashboard,
  "/dashboard/storefront": Eye,
  "/dashboard/products": Package,
  "/dashboard/catalog": FolderTree,
  "/dashboard/promotions": Megaphone,
  "/dashboard/orders": ShoppingCart,
  "/dashboard/analytics": BarChart3,
  "/dashboard/billing": CreditCard,
  "/dashboard/settings": Settings,
} as const;

type SidebarProps = {
  id?: string;
  businessName: string;
  businessSlug: string;
  userName: string;
  userRole?: string;
  storeAccessRole?: StoreAccessRole;
  mobileOpen?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
};

export function DashboardSidebar({
  id,
  businessName,
  businessSlug,
  userName,
  userRole,
  storeAccessRole = "owner",
  mobileOpen = false,
  onNavigate,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNav, setIsMobileNav] = useState(false);
  const navItems = navItemsForStoreRole(storeAccessRole);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobileNav(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      id={id}
      className="cf-dash-sidebar"
      data-open={mobileOpen ? "true" : "false"}
      aria-hidden={isMobileNav && !mobileOpen ? true : undefined}
    >
      <div className="cf-dash-sidebar__header">
        <div className="cf-dash-sidebar__brand">
          <span className="cf-dash-sidebar__logo hidden lg:flex" aria-hidden>
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
              {businessName}
            </p>
            <p className="truncate text-[12px] text-[#86868b]">
              /{businessSlug}
              {storeAccessRole === "staff" ? " · Staff" : ""}
            </p>
          </div>
          <p className="flex-1 text-[14px] font-semibold tracking-tight text-[#1d1d1f] lg:hidden">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="cf-dash-menu-btn -mr-1 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <nav className="cf-dash-sidebar__nav" aria-label="Seller dashboard">
        <ul className="space-y-0.5" role="list">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = NAV_ICONS[item.href as keyof typeof NAV_ICONS] ?? LayoutDashboard;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  className="cf-dash-nav-link"
                  onClick={onNavigate}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? "text-[#d4bc94]" : ""}`}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className={active ? "font-semibold" : undefined}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="cf-dash-sidebar__footer">
        <a
          href={`/${businessSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cf-dash-nav-link text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
          onClick={onNavigate}
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          View storefront
        </a>
        {userRole === "ADMIN" ? (
          <Link
            href="/admin"
            className="cf-dash-nav-link text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            onClick={onNavigate}
          >
            <Shield className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Admin panel
          </Link>
        ) : null}
        <div className="cf-dash-sidebar__session">
          <p className="cf-dash-sidebar__session-label">Signed in as</p>
          <p className="truncate text-[12px] font-medium text-[#1d1d1f]">{userName}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-[12px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}