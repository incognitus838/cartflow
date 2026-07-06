import Link from "next/link";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireBusiness } from "@/lib/auth-server";
import { toNumber } from "@/lib/decimal";
import { formatCurrency } from "@/lib/utils";
import { getLowStockProducts } from "@/lib/inventory";
import { getBusinessStats } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const { business } = await requireBusiness();
  const [stats, lowStockProducts] = await Promise.all([
    getBusinessStats(business.id),
    getLowStockProducts(business.id),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const storeUrl = `${appUrl}/${business.slug}`;

  const cards = [
    {
      label: "Active products",
      value: String(stats.productCount),
      icon: Package,
      href: "/dashboard/products",
    },
    {
      label: "Pending orders",
      value: String(stats.pendingOrders),
      icon: ShoppingCart,
      href: "/dashboard/orders?status=PENDING",
      highlight: stats.pendingOrders > 0,
    },
    {
      label: "Revenue",
      value: formatCurrency(toNumber(stats.revenue), business.currency),
      icon: TrendingUp,
      href: "/dashboard/orders",
    },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Welcome back — here's how ${business.name} is doing.`}
      />

      <section aria-labelledby="seller-kpis">
        <h2 id="seller-kpis" className="sr-only">
          Store key metrics
        </h2>
        <ul className="grid list-none gap-4 sm:grid-cols-3" role="list">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.label}>
                <Link
                  href={card.href}
                  className={`cf-stat-card block transition-shadow hover:shadow-md ${
                    card.highlight ? "border-[#b8956a]/30 bg-[#fffdf9]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="cf-stat-label">{card.label}</span>
                    <Icon
                      className={`h-4 w-4 ${card.highlight ? "text-[#b8956a]" : "text-[#86868b]"}`}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <p className="cf-stat-value">{card.value}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {lowStockProducts.length > 0 ? (
        <section
          aria-labelledby="low-stock-alert"
          className="mt-8 rounded-[var(--cf-radius-lg)] border border-[#b8956a]/25 bg-[#fffdf9] p-6"
        >
          <h2 id="low-stock-alert" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            {lowStockProducts.length} product{lowStockProducts.length === 1 ? "" : "s"} running low
          </h2>
          <p className="mt-2 text-[13px] text-[#86868b]">
            Restock soon to avoid missed orders on your storefront.
          </p>
          <Link href="/dashboard/products" className="btn-primary mt-4 inline-block">
            Review inventory
          </Link>
        </section>
      ) : null}

      {stats.productCount === 0 ? (
        <section
          aria-labelledby="first-product-cta"
          className="mt-8 rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-6"
        >
          <h2 id="first-product-cta" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Next step: add your first product
          </h2>
          <p className="mt-2 text-[13px] text-[#86868b]">
            Your store link is ready. Add products so customers can start ordering.
          </p>
          <Link href="/dashboard/products" className="btn-primary mt-4 inline-block">
            Add products
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="customize-store" className="mt-8 cf-stat-card">
        <h2 id="customize-store" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
          Customer view & branding
        </h2>
        <p className="mt-2 text-[13px] text-[#86868b]">
          Preview your storefront as shoppers see it and customize theme, tagline, and layout.
        </p>
        <Link href="/dashboard/storefront" className="btn-primary mt-4 inline-block">
          Open storefront editor
        </Link>
      </section>

      <section aria-labelledby="share-store" className="mt-8 cf-stat-card">
        <h2 id="share-store" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
          Share your store
        </h2>
        <p className="mt-2 text-[13px] text-[#86868b]">
          Send this link on WhatsApp, Instagram, or anywhere you sell:
        </p>
        <p className="mt-3 rounded-[var(--cf-radius-sm)] bg-[#f5f5f7] px-4 py-3 font-mono text-[13px] text-[#b8956a]">
          {storeUrl}
        </p>
      </section>
    </>
  );
}