import { UsersPanel } from "@/components/admin/users-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminUserStats, listAdminUsers } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, stats] = await Promise.all([listAdminUsers({ take: 500 }), getAdminUserStats()]);

  const roleCount = (role: string) =>
    stats.roleBreakdown.find((r) => r.role === role)?.count ?? 0;

  return (
    <>
      <PageHeader
        title="Users"
        description="Full platform directory — click any user for signup date, GMV, sales, subscriptions, and suspend controls."
        alert={
          <p className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white px-4 py-3 text-[13px] text-[#6e6e73]">
            <span className="font-semibold text-[#1d1d1f]">What are members?</span>{" "}
            <span className="text-[#86868b]">Memberships</span> are{" "}
            <span className="font-medium">BusinessMember</span> records — invited team who can open a
            store&apos;s seller dashboard without owning it. Owners create stores; staff get access via
            membership.
          </p>
        }
      />

      <section aria-labelledby="user-kpis" className="mb-8">
        <h2 id="user-kpis" className="sr-only">
          User metrics
        </h2>
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-5" role="list">
          {[
            { label: "Total accounts", value: stats.total },
            { label: "Admins", value: roleCount("ADMIN") },
            { label: "Owners", value: roleCount("OWNER") },
            { label: "Staff accounts", value: roleCount("STAFF") },
            { label: "Owners with stores", value: stats.ownersWithStores },
          ].map((card) => (
            <li key={card.label}>
              <article className="cf-stat-card">
                <p className="cf-stat-label">{card.label}</p>
                <p className="cf-stat-value">{card.value}</p>
              </article>
            </li>
          ))}
        </ul>
        {stats.staffOnly > 0 ? (
          <p className="mt-3 text-[12px] text-[#86868b]">
            {stats.staffOnly} user{stats.staffOnly === 1 ? "" : "s"} with staff access only (no owned
            stores)
          </p>
        ) : null}
      </section>

      <UsersPanel
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isSuspended: user.isSuspended,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          ownedBusinesses: user.ownedBusinesses.map((store) => ({
            ...store,
            createdAt: store.createdAt.toISOString(),
            updatedAt: store.updatedAt.toISOString(),
            planStartedAt: store.planStartedAt?.toISOString() ?? null,
          })),
          memberships: user.memberships.map((membership) => ({
            ...membership,
            createdAt: membership.createdAt.toISOString(),
          })),
          _count: user._count,
        }))}
      />
    </>
  );
}