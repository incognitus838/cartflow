"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FolderTree, Package } from "lucide-react";

type ProductsTab = "products" | "structure";

type ProductsTabsProps = {
  active: ProductsTab;
  canProducts: boolean;
  canCatalog: boolean;
};

export function ProductsTabs({ active, canProducts, canCatalog }: ProductsTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function href(tab: ProductsTab) {
    if (tab === "products") return pathname;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "structure");
    return `${pathname}?${params.toString()}`;
  }

  const tabs: Array<{ id: ProductsTab; label: string; icon: typeof Package; show: boolean }> = [
    { id: "products", label: "Products", icon: Package, show: canProducts },
    { id: "structure", label: "Categories & tags", icon: FolderTree, show: canCatalog },
  ];

  const visible = tabs.filter((tab) => tab.show);
  if (visible.length <= 1) return null;

  return (
    <nav
      className="mb-6 flex gap-1 rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-[#f5f5f7] p-1"
      aria-label="Products sections"
    >
      {visible.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={href(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-[#1d1d1f] shadow-sm"
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}