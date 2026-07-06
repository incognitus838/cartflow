"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  Store,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { AdminActions } from "@/components/admin/admin-actions";
import { StorefrontLink } from "@/components/admin/storefront-link";
import { formatCurrency } from "@/lib/utils";

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendReason: string | null;
  createdAt: string;
  updatedAt: string;
  daysOnPlatform: number;
  firstSaleAt: string | null;
  totalGmv: number;
  fulfilledOrderCount: number;
  stores: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    subscriptionStatus: string;
    planStartedAt: string | null;
    isActive: boolean;
    currency: string;
    createdAt: string;
    gmv: number;
    fulfilledOrders: number;
    _count: { products: number; orders: number; customers: number; promotions: number };
  }>;
  memberships: Array<{
    id: string;
    role: string;
    createdAt: string;
    business: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      isActive: boolean;
      subscriptionStatus: string;
      planStartedAt: string | null;
      createdAt: string;
      owner: { id: string; name: string; email: string };
      _count: { products: number; orders: number };
    };
  }>;
  _count: { ownedBusinesses: number; memberships: number };
};

type UserDetailPanelProps = {
  user: AdminUserDetail;
};

const SUBSCRIPTION_BADGE: Record<string, string> = {
  TRIAL: "cf-badge cf-badge-pending",
  ACTIVE: "cf-badge cf-badge-paid",
  PAST_DUE: "cf-badge cf-badge-cancelled",
  CANCELLED: "cf-badge cf-badge-cancelled",
};

export function UserDetailPanel({ user: initial }: UserDetailPanelProps) {
  const router = useRouter();
  const [user, setUser] = useState(initial);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function patchUser(action: "suspend" | "unsuspend") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Update failed");
        return;
      }
      setUser(data.user);
      toast.success(action === "suspend" ? "User suspended and stores hidden" : "User restored");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="cf-link-action text-[13px]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to users
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#1d1d1f]">
              {user.name}
            </h1>
            <p className="mt-1 text-[14px] text-[#6e6e73]">{user.email}</p>
            <p className="mt-1 font-mono text-[11px] text-[#86868b]">{user.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="cf-badge cf-badge-delivered">{user.role}</span>
            {user.isSuspended ? (
              <span className="cf-badge cf-badge-cancelled">Suspended</span>
            ) : (
              <span className="cf-badge cf-badge-paid">Active account</span>
            )}
          </div>
        </div>
      </div>

      {user.isSuspended ? (
        <section className="rounded-[var(--cf-radius-md)] border border-[#c41e1e]/20 bg-[#fff5f5] px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#c41e1e]" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-[#c41e1e]">Account suspended</p>
              <p className="mt-1 text-[12px] text-[#6e6e73]">
                {user.suspendReason ?? "No reason recorded."}
                {user.suspendedAt ? (
                  <>
                    {" "}
                    ·{" "}
                    <time dateTime={user.suspendedAt}>
                      {new Date(user.suspendedAt).toLocaleString()}
                    </time>
                  </>
                ) : null}
              </p>
              <p className="mt-1 text-[11px] text-[#86868b]">
                Login blocked · all owned storefronts hidden (isActive=false)
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="user-analytics">
        <h2 id="user-analytics" className="sr-only">
          User analytics
        </h2>
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {[
            {
              label: "Days on platform",
              value: String(user.daysOnPlatform),
              icon: Calendar,
              sub: `Joined ${new Date(user.createdAt).toLocaleDateString()}`,
            },
            {
              label: "Lifetime GMV",
              value: formatCurrency(user.totalGmv, "NGN"),
              icon: DollarSign,
              sub: `${user.fulfilledOrderCount} fulfilled orders`,
            },
            {
              label: "Owned stores",
              value: String(user._count.ownedBusinesses),
              icon: Store,
              sub: `${user._count.memberships} staff memberships`,
            },
            {
              label: "First sale",
              value: user.firstSaleAt
                ? new Date(user.firstSaleAt).toLocaleDateString()
                : "—",
              icon: ShoppingBag,
              sub: user.firstSaleAt ? "Across all owned stores" : "No sales yet",
            },
          ].map((card) => (
            <li key={card.label}>
              <article className="cf-stat-card">
                <card.icon className="mb-2 h-4 w-4 text-[#b8956a]" aria-hidden />
                <p className="cf-stat-label">{card.label}</p>
                <p className="cf-stat-value text-[1.35rem]">{card.value}</p>
                <p className="mt-1 text-[11px] text-[#86868b]">{card.sub}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="owned-stores-detail" className="cf-stat-card">
        <h2 id="owned-stores-detail" className="text-[15px] font-semibold text-[#1d1d1f]">
          Owned stores & subscriptions
        </h2>
        <p className="mt-1 text-[12px] text-[#86868b]">
          Plan, subscription status, and per-store sales analytics.
        </p>
        {user.stores.length === 0 ? (
          <p className="mt-4 text-[13px] text-[#86868b]">No owned stores.</p>
        ) : (
          <ul className="mt-4 space-y-4" role="list">
            {user.stores.map((store) => (
              <li
                key={store.id}
                className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-[#fbfbfd] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">{store.name}</p>
                    <StorefrontLink slug={store.slug} storeName={store.name} isActive={store.isActive} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="cf-badge cf-badge-delivered">{store.plan}</span>
                    <span className={SUBSCRIPTION_BADGE[store.subscriptionStatus] ?? "cf-badge"}>
                      {store.subscriptionStatus}
                    </span>
                    <span
                      className={`cf-badge ${store.isActive ? "cf-badge-paid" : "cf-badge-cancelled"}`}
                    >
                      {store.isActive ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <dl className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-[#86868b]">Store GMV</dt>
                    <dd className="font-semibold text-[#1d1d1f]">
                      {formatCurrency(store.gmv, store.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#86868b]">Fulfilled orders</dt>
                    <dd className="font-medium text-[#1d1d1f]">{store.fulfilledOrders}</dd>
                  </div>
                  <div>
                    <dt className="text-[#86868b]">Catalog</dt>
                    <dd className="text-[#1d1d1f]">
                      {store._count.products} products · {store._count.customers} customers
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#86868b]">Plan started</dt>
                    <dd className="text-[#1d1d1f]">
                      {store.planStartedAt
                        ? new Date(store.planStartedAt).toLocaleDateString()
                        : "—"}
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

      {user.role !== "ADMIN" ? (
        <section aria-labelledby="account-controls" className="cf-stat-card">
          <h2 id="account-controls" className="flex items-center gap-2 text-[15px] font-semibold text-[#1d1d1f]">
            <UserX className="h-4 w-4 text-[#86868b]" aria-hidden />
            Account controls
          </h2>
          <p className="mt-1 text-[12px] text-[#86868b]">
            Suspend blocks login and hides all owned storefronts. Staff memberships are unaffected.
          </p>
          {user.isSuspended ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => patchUser("unsuspend")}
              className="btn-accent mt-4"
            >
              {loading ? "Restoring…" : "Restore account"}
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <label htmlFor="suspend-reason" className="block text-[12px] font-medium text-[#6e6e73]">
                Reason (optional)
              </label>
              <input
                id="suspend-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Terms violation, fraud investigation…"
                className="cf-input max-w-md"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => patchUser("suspend")}
                className="cf-btn-inline cf-btn-inline-danger"
              >
                {loading ? "Suspending…" : "Suspend & hide stores"}
              </button>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}