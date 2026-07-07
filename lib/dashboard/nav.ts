import type { StoreAccessRole } from "@/lib/store-access-types";
import { canAccessNavPath, type MemberPermissions } from "@/lib/team/permissions-shared";

export type DashboardNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  staffAllowed: boolean;
};

/** Sidebar routes and owner-only page guard — keep in sync. */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", exact: true, staffAllowed: true },
  { href: "/dashboard/storefront", label: "Storefront", staffAllowed: false },
  { href: "/dashboard/products", label: "Products", staffAllowed: true },
  { href: "/dashboard/catalog", label: "Catalog", staffAllowed: true },
  { href: "/dashboard/promotions", label: "Promotions", staffAllowed: true },
  { href: "/dashboard/orders", label: "Orders", staffAllowed: true },
  { href: "/dashboard/analytics", label: "Analytics", staffAllowed: true },
  { href: "/dashboard/billing", label: "Billing", staffAllowed: false },
  { href: "/dashboard/settings", label: "Settings", staffAllowed: false },
];

const OWNER_ONLY_PREFIXES = DASHBOARD_NAV.filter((item) => !item.staffAllowed).map(
  (item) => item.href,
);

export function isOwnerOnlyDashboardPath(pathname: string) {
  return OWNER_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function navItemsForStoreRole(role: "owner" | "staff") {
  if (role === "owner") return DASHBOARD_NAV;
  return DASHBOARD_NAV.filter((item) => item.staffAllowed);
}

export function navItemsForPermissions(
  role: StoreAccessRole,
  permissions: MemberPermissions,
) {
  if (role === "owner") return DASHBOARD_NAV;
  return DASHBOARD_NAV.filter(
    (item) => item.staffAllowed && canAccessNavPath(permissions, item.href),
  );
}

export function presetLabel(preset: string | null | undefined) {
  if (!preset) return "Owner";
  const labels: Record<string, string> = {
    STAFF: "Staff",
    MANAGER: "Manager",
    FULFILLMENT: "Fulfillment",
    CATALOG: "Catalog",
    CUSTOM: "Custom",
  };
  return labels[preset] ?? preset;
}