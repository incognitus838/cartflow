"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  Eye,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

type SidebarProps = {
  businessName: string;
  businessSlug: string;
  userName: string;
  userRole?: string;
};

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/storefront", label: "Storefront", icon: Eye },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/promotions", label: "Promotions", icon: Megaphone },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ businessName, businessSlug, userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="cf-dash-sidebar">
      <div className="border-b border-black/[0.06] px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#1d1d1f] text-white">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
              {businessName}
            </p>
            <p className="truncate text-[12px] text-[#86868b]">/{businessSlug}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4" aria-label="Seller dashboard">
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
                  className="cf-dash-nav-link"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-black/[0.06] px-3 py-4">
        <a
          href={`/${businessSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cf-dash-nav-link text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          View storefront
        </a>
        {userRole === "ADMIN" ? (
          <Link
            href="/admin"
            className="cf-dash-nav-link text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
          >
            <Shield className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Admin panel
          </Link>
        ) : null}
        <div className="px-3 py-2">
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