"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import type { BusinessPlan, UserRole } from "@prisma/client";
import { ChevronDown, ChevronRight, Store, Users } from "lucide-react";
import { AdminActions } from "@/components/admin/admin-actions";
import { FilterToolbar } from "@/components/shared/filter-toolbar";

export type AdminUserStore = {
  id: string;
  name: string;
  slug: string;
  plan: BusinessPlan;
  isActive: boolean;
  subscriptionStatus?: string;
  planStartedAt?: string | null;
  currency: string;
  phone: string | null;
  whatsapp: string | null;
  bankAccountNumber: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { products: number; orders: number; customers: number; promotions: number };
};

export type AdminUserMembership = {
  id: string;
  role: UserRole;
  createdAt: string;
  business: {
    id: string;
    name: string;
    slug: string;
    plan: BusinessPlan;
    isActive: boolean;
    owner: { id: string; name: string; email: string };
    _count: { products: number; orders: number };
  };
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  ownedBusinesses: AdminUserStore[];
  memberships: AdminUserMembership[];
  _count: { ownedBusinesses: number; memberships: number };
};

const ROLE_FILTERS: Array<{ value: "" | UserRole; label: string }> = [
  { value: "", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
  { value: "STAFF", label: "Staff" },
];

const roleBadge: Record<UserRole, string> = {
  ADMIN: "cf-badge cf-badge-admin",
  OWNER: "cf-badge cf-badge-owner",
  STAFF: "cf-badge cf-badge-delivered",
};

type UsersPanelProps = {
  users: AdminUserRow[];
};

function sumStoreCounts(stores: AdminUserStore[]) {
  return stores.reduce(
    (acc, store) => ({
      products: acc.products + store._count.products,
      orders: acc.orders + store._count.orders,
      customers: acc.customers + store._count.customers,
      promotions: acc.promotions + store._count.promotions,
    }),
    { products: 0, orders: 0, customers: 0, promotions: 0 },
  );
}

export function UsersPanel({ users }: UsersPanelProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | UserRole>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      if (role && user.role !== role) return false;
      if (!q) return true;
      const storeHits = user.ownedBusinesses.some(
        (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
      );
      const memberHits = user.memberships.some(
        (m) =>
          m.business.name.toLowerCase().includes(q) ||
          m.business.slug.toLowerCase().includes(q) ||
          m.business.owner.email.toLowerCase().includes(q),
      );
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        storeHits ||
        memberHits
      );
    });
  }, [users, search, role]);

  function toggleExpanded(userId: string) {
    setExpandedId((current) => (current === userId ? null : userId));
  }

  return (
    <section aria-labelledby="admin-users-heading">
      <h2 id="admin-users-heading" className="sr-only">
        Platform users directory
      </h2>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchLabel="Search users"
        searchPlaceholder="Name, email, user ID, store name or slug…"
        filters={ROLE_FILTERS}
        activeFilter={role}
        onFilterChange={setRole}
        filterLegend="Filter users by platform role"
        resultCount={filtered.length}
      />

      <div className="cf-table-shell overflow-x-auto">
        <table className="min-w-[900px]">
          <caption className="sr-only">Platform users with store and membership details</caption>
          <thead>
            <tr>
              <th scope="col" className="w-8" aria-label="Expand row" />
              <th scope="col">User</th>
              <th scope="col">Role</th>
              <th scope="col">Stores</th>
              <th scope="col">Activity</th>
              <th scope="col">Joined</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const expanded = expandedId === user.id;
              const totals = sumStoreCounts(user.ownedBusinesses);
              const hasBank = user.ownedBusinesses.some((s) => s.bankAccountNumber);

              return (
                <Fragment key={user.id}>
                  <tr className={expanded ? "bg-[#fbfbfd]" : undefined}>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(user.id)}
                        aria-expanded={expanded}
                        aria-controls={`user-detail-${user.id}`}
                        aria-label={`${expanded ? "Collapse" : "Expand"} details for ${user.name}`}
                        className="rounded-md p-1 text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                      >
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" aria-hidden />
                        ) : (
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </td>
                    <td>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-[#1d1d1f] hover:text-[#b8956a]"
                      >
                        {user.name}
                      </Link>
                      <p className="text-[12px] text-[#86868b]">{user.email}</p>
                      {user.isSuspended ? (
                        <span className="mt-1 cf-badge cf-badge-cancelled">Suspended</span>
                      ) : null}
                    </td>
                    <td>
                      <span className={roleBadge[user.role]}>{user.role}</span>
                    </td>
                    <td className="text-[13px] text-[#6e6e73]">
                      <p>
                        <span className="font-medium text-[#1d1d1f]">{user._count.ownedBusinesses}</span>{" "}
                        owned
                      </p>
                      {user._count.memberships > 0 ? (
                        <p className="mt-0.5">
                          <span className="font-medium text-[#1d1d1f]">{user._count.memberships}</span>{" "}
                          staff access
                        </p>
                      ) : null}
                    </td>
                    <td className="text-[12px] text-[#6e6e73]">
                      {user._count.ownedBusinesses > 0 ? (
                        <>
                          <p>{totals.products} products</p>
                          <p>{totals.orders} orders</p>
                          <p>{totals.customers} customers</p>
                        </>
                      ) : user._count.memberships > 0 ? (
                        <p>Staff on {user._count.memberships} store{user._count.memberships === 1 ? "" : "s"}</p>
                      ) : (
                        <p className="text-[#86868b]">No store activity</p>
                      )}
                      {hasBank ? (
                        <p className="mt-1 text-[#1a7f5a]">Bank details on file</p>
                      ) : user._count.ownedBusinesses > 0 ? (
                        <p className="mt-1 text-[#9a6700]">Bank details missing</p>
                      ) : null}
                    </td>
                    <td className="text-[#6e6e73]">
                      <time dateTime={user.createdAt}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </time>
                      <p className="mt-0.5 text-[11px] text-[#86868b]">
                        Updated {new Date(user.updatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="cf-btn-inline cf-btn-inline-ghost text-[11px]"
                      >
                        View profile
                      </Link>
                    </td>
                  </tr>

                  {expanded ? (
                    <tr id={`user-detail-${user.id}`}>
                      <td colSpan={7} className="!bg-[#fbfbfd] !py-0">
                        <div className="border-t border-black/[0.04] px-5 py-5">
                          <dl className="mb-5 grid gap-3 rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white p-4 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <dt className="text-[#86868b]">User ID</dt>
                              <dd className="mt-0.5 font-mono text-[11px] text-[#1d1d1f]">{user.id}</dd>
                            </div>
                            <div>
                              <dt className="text-[#86868b]">Account created</dt>
                              <dd className="mt-0.5 text-[#1d1d1f]">
                                <time dateTime={user.createdAt}>
                                  {new Date(user.createdAt).toLocaleString()}
                                </time>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[#86868b]">Last profile update</dt>
                              <dd className="mt-0.5 text-[#1d1d1f]">
                                <time dateTime={user.updatedAt}>
                                  {new Date(user.updatedAt).toLocaleString()}
                                </time>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[#86868b]">Platform totals (owned)</dt>
                              <dd className="mt-0.5 text-[#1d1d1f]">
                                {totals.products} products · {totals.orders} orders · {totals.customers}{" "}
                                customers · {totals.promotions} promos
                              </dd>
                            </div>
                          </dl>

                          <div className="grid gap-5 lg:grid-cols-2">
                            <section aria-labelledby={`owned-${user.id}`}>
                              <h3
                                id={`owned-${user.id}`}
                                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f]"
                              >
                                <Store className="h-3.5 w-3.5 text-[#b8956a]" aria-hidden />
                                Owned stores ({user.ownedBusinesses.length})
                              </h3>
                              {user.ownedBusinesses.length === 0 ? (
                                <p className="mt-2 text-[13px] text-[#86868b]">No owned stores.</p>
                              ) : (
                                <ul className="mt-3 space-y-3" role="list">
                                  {user.ownedBusinesses.map((store) => (
                                    <li
                                      key={store.id}
                                      className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white p-4"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                          <p className="font-medium text-[#1d1d1f]">{store.name}</p>
                                          <p className="text-[12px] text-[#b8956a]">/{store.slug}</p>
                                          <p className="mt-1 font-mono text-[10px] text-[#86868b]">
                                            {store.id}
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          <span className="cf-badge cf-badge-delivered">{store.plan}</span>
                                          <span
                                            className={`cf-badge ${store.isActive ? "cf-badge-paid" : "cf-badge-cancelled"}`}
                                          >
                                            {store.isActive ? "Active" : "Inactive"}
                                          </span>
                                        </div>
                                      </div>
                                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-4">
                                        <div>
                                          <dt className="text-[#86868b]">Products</dt>
                                          <dd className="font-medium text-[#1d1d1f]">{store._count.products}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Orders</dt>
                                          <dd className="font-medium text-[#1d1d1f]">{store._count.orders}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Customers</dt>
                                          <dd className="font-medium text-[#1d1d1f]">{store._count.customers}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Promotions</dt>
                                          <dd className="font-medium text-[#1d1d1f]">{store._count.promotions}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Currency</dt>
                                          <dd className="text-[#1d1d1f]">{store.currency}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Contact</dt>
                                          <dd className="text-[#1d1d1f]">
                                            {store.phone || store.whatsapp || "—"}
                                          </dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Bank on file</dt>
                                          <dd className={store.bankAccountNumber ? "text-[#1a7f5a]" : "text-[#9a6700]"}>
                                            {store.bankAccountNumber ? "Yes" : "No"}
                                          </dd>
                                        </div>
                                        <div>
                                          <dt className="text-[#86868b]">Store created</dt>
                                          <dd className="text-[#1d1d1f]">
                                            {new Date(store.createdAt).toLocaleDateString()}
                                          </dd>
                                        </div>
                                      </dl>
                                      <div className="mt-3">
                                        <AdminActions
                                          businessId={store.id}
                                          storeName={store.name}
                                          slug={store.slug}
                                          isActive={store.isActive}
                                        />
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </section>

                            <section aria-labelledby={`staff-${user.id}`}>
                              <h3
                                id={`staff-${user.id}`}
                                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f]"
                              >
                                <Users className="h-3.5 w-3.5 text-[#b8956a]" aria-hidden />
                                Staff memberships ({user.memberships.length})
                              </h3>
                              <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">
                                Stores this user can access as invited team — not as owner. Each{" "}
                                <span className="font-medium text-[#6e6e73]">BusinessMember</span> record
                                grants dashboard access to someone else&apos;s store.
                              </p>
                              {user.memberships.length === 0 ? (
                                <p className="mt-2 text-[13px] text-[#86868b]">No staff memberships.</p>
                              ) : (
                                <ul className="mt-3 space-y-3" role="list">
                                  {user.memberships.map((membership) => (
                                    <li
                                      key={membership.id}
                                      className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white p-4"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                          <p className="font-medium text-[#1d1d1f]">
                                            {membership.business.name}
                                          </p>
                                          <p className="text-[12px] text-[#b8956a]">
                                            /{membership.business.slug}
                                          </p>
                                        </div>
                                        <span className={roleBadge[membership.role]}>{membership.role}</span>
                                      </div>
                                      <dl className="mt-3 space-y-1 text-[12px]">
                                        <div className="flex justify-between gap-4">
                                          <dt className="text-[#86868b]">Store owner</dt>
                                          <dd className="text-right text-[#1d1d1f]">
                                            {membership.business.owner.name}
                                            <span className="block text-[11px] text-[#86868b]">
                                              {membership.business.owner.email}
                                            </span>
                                          </dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                          <dt className="text-[#86868b]">Invited</dt>
                                          <dd className="text-[#1d1d1f]">
                                            {new Date(membership.createdAt).toLocaleDateString()}
                                          </dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                          <dt className="text-[#86868b]">Catalog / orders</dt>
                                          <dd className="text-[#1d1d1f]">
                                            {membership.business._count.products} products ·{" "}
                                            {membership.business._count.orders} orders
                                          </dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                          <dt className="text-[#86868b]">Store status</dt>
                                          <dd>
                                            <span
                                              className={`cf-badge ${membership.business.isActive ? "cf-badge-paid" : "cf-badge-cancelled"}`}
                                            >
                                              {membership.business.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <span className="ml-1.5 cf-badge cf-badge-delivered">
                                              {membership.business.plan}
                                            </span>
                                          </dd>
                                        </div>
                                      </dl>
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <AdminActions
                                          businessId={membership.business.id}
                                          storeName={membership.business.name}
                                          slug={membership.business.slug}
                                          isActive={membership.business.isActive}
                                        />
                                        <Link
                                          href={`/admin/stores`}
                                          className="cf-btn-inline cf-btn-inline-ghost text-[11px]"
                                        >
                                          Manage store
                                        </Link>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </section>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="cf-table-empty">No users match your filters.</p>
        ) : null}
      </div>
    </section>
  );
}