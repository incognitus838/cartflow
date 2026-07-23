"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Mail,
  ShoppingCart,
  Shield,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

type AdminSidebarProps = {
  id?: string;
  userEmail: string;
  userName: string;
  pendingApprovals?: number;
  mobileOpen?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
};

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/approvals", label: "Approvals", icon: ClipboardCheck, badgeKey: "approvals" as const },
  { href: "/admin/stores", label: "Stores", icon: Building2 },
  { href: "/admin/broadcast", label: "Email sellers", icon: Mail },
  { href: "/admin/customers", label: "Customers", icon: UserCircle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function AdminSidebar({
  id,
  userEmail,
  userName,
  pendingApprovals = 0,
  mobileOpen = false,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNav, setIsMobileNav] = useState(false);

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
            <Shield className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
              Platform admin
            </p>
            <p className="truncate text-[12px] text-[#86868b]">{userEmail}</p>
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

      <nav className="cf-dash-sidebar__nav" aria-label="Admin">
        <ul className="space-y-0.5" role="list">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  className="cf-dash-nav-link relative"
                  onClick={onNavigate}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? "text-[#d4bc94]" : ""}`}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {item.label}
                  {"badgeKey" in item && item.badgeKey === "approvals" && pendingApprovals > 0 ? (
                    <span className="ml-auto rounded-full bg-[#e8a317] px-2 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                      {pendingApprovals}
                    </span>
                  ) : null}
                  {active ? (
                    <span className="sr-only">(current page)</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="cf-dash-sidebar__footer">
        <div className="cf-dash-sidebar__session">
          <p className="cf-dash-sidebar__session-label">Session</p>
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