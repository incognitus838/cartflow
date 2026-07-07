export type MemberAccessPresetId =
  | "STAFF"
  | "MANAGER"
  | "FULFILLMENT"
  | "CATALOG"
  | "CUSTOM";

export type MemberPermissions = {
  orders: boolean;
  products: boolean;
  productsDelete: boolean;
  catalog: boolean;
  promotions: boolean;
  promotionsDelete: boolean;
  analytics: boolean;
  paymentsReview: boolean;
  settings: boolean;
  billing: boolean;
  storefront: boolean;
  teamManage: boolean;
};

export const FULL_MEMBER_PERMISSIONS: MemberPermissions = {
  orders: true,
  products: true,
  productsDelete: true,
  catalog: true,
  promotions: true,
  promotionsDelete: true,
  analytics: true,
  paymentsReview: true,
  settings: true,
  billing: true,
  storefront: true,
  teamManage: true,
};

export const ACCESS_PRESET_OPTIONS: Array<{
  id: MemberAccessPresetId;
  label: string;
  description: string;
}> = [
  {
    id: "STAFF",
    label: "Staff",
    description: "Orders, products, catalog, and promotions — no payment approval or settings.",
  },
  {
    id: "MANAGER",
    label: "Manager",
    description: "Full day-to-day ops including delete — still no bank, billing, or team admin.",
  },
  {
    id: "FULFILLMENT",
    label: "Fulfillment",
    description: "Orders only — update status, notes, and customer contact.",
  },
  {
    id: "CATALOG",
    label: "Catalog",
    description: "Products and catalog structure — no orders or promotions.",
  },
  {
    id: "CUSTOM",
    label: "Custom",
    description: "Pick exactly what this person can access.",
  },
];

export const PERMISSION_LABELS: Array<{
  key: keyof MemberPermissions;
  label: string;
  hint: string;
}> = [
  { key: "orders", label: "Orders", hint: "View and update orders" },
  { key: "products", label: "Products", hint: "Add and edit products" },
  { key: "productsDelete", label: "Delete products", hint: "Remove products permanently" },
  { key: "catalog", label: "Catalog", hint: "Categories and tags" },
  { key: "promotions", label: "Promotions", hint: "Create and edit offers" },
  { key: "promotionsDelete", label: "Delete promotions", hint: "Remove offers" },
  { key: "analytics", label: "Analytics", hint: "View sales reports" },
  { key: "paymentsReview", label: "Payment approval", hint: "Approve or reject receipts" },
  { key: "storefront", label: "Storefront", hint: "Theme and branding editor" },
  { key: "settings", label: "Store settings", hint: "Bank details and store profile" },
  { key: "billing", label: "Billing", hint: "Subscription and plan" },
  { key: "teamManage", label: "Team", hint: "Invite and manage staff" },
];

const PRESET_PERMISSIONS: Record<Exclude<MemberAccessPresetId, "CUSTOM">, MemberPermissions> = {
  STAFF: {
    orders: true,
    products: true,
    productsDelete: false,
    catalog: true,
    promotions: true,
    promotionsDelete: false,
    analytics: true,
    paymentsReview: false,
    settings: false,
    billing: false,
    storefront: false,
    teamManage: false,
  },
  MANAGER: {
    orders: true,
    products: true,
    productsDelete: true,
    catalog: true,
    promotions: true,
    promotionsDelete: true,
    analytics: true,
    paymentsReview: false,
    settings: false,
    billing: false,
    storefront: false,
    teamManage: false,
  },
  FULFILLMENT: {
    orders: true,
    products: false,
    productsDelete: false,
    catalog: false,
    promotions: false,
    promotionsDelete: false,
    analytics: false,
    paymentsReview: false,
    settings: false,
    billing: false,
    storefront: false,
    teamManage: false,
  },
  CATALOG: {
    orders: false,
    products: true,
    productsDelete: false,
    catalog: true,
    promotions: false,
    promotionsDelete: false,
    analytics: false,
    paymentsReview: false,
    settings: false,
    billing: false,
    storefront: false,
    teamManage: false,
  },
};

export function presetPermissions(preset: MemberAccessPresetId): MemberPermissions {
  if (preset === "CUSTOM") return { ...PRESET_PERMISSIONS.STAFF };
  return { ...PRESET_PERMISSIONS[preset] };
}

export function parseMemberPermissions(raw: unknown): Partial<MemberPermissions> | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const result: Partial<MemberPermissions> = {};
  for (const key of Object.keys(FULL_MEMBER_PERMISSIONS) as Array<keyof MemberPermissions>) {
    if (typeof data[key] === "boolean") result[key] = data[key];
  }
  return Object.keys(result).length > 0 ? result : null;
}

export function resolveMemberPermissions(
  preset: MemberAccessPresetId,
  overrides?: Partial<MemberPermissions> | null,
): MemberPermissions {
  const base = presetPermissions(preset);
  if (!overrides) return base;
  return { ...base, ...overrides };
}

export function canAccessNavPath(permissions: MemberPermissions, href: string) {
  if (href === "/dashboard" || href.startsWith("/dashboard/orders")) return permissions.orders;
  if (href.startsWith("/dashboard/products")) return permissions.products;
  if (href.startsWith("/dashboard/catalog")) return permissions.catalog;
  if (href.startsWith("/dashboard/promotions")) return permissions.promotions;
  if (href.startsWith("/dashboard/analytics")) return permissions.analytics;
  if (href.startsWith("/dashboard/storefront")) return permissions.storefront;
  if (href.startsWith("/dashboard/billing")) return permissions.billing;
  if (href.startsWith("/dashboard/settings")) return permissions.settings;
  return true;
}