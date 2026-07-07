"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Settings, Store, Users } from "lucide-react";

type SettingsTabsProps = {
  active: "store" | "team" | "stores";
};

export function SettingsTabs({ active }: SettingsTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const base = pathname;

  function href(tab: "store" | "team" | "stores") {
    if (tab === "store") return base;
    if (tab === "stores") return "/dashboard/stores";
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "team");
    return `${base}?${params.toString()}`;
  }

  const tabs = [
    { id: "store" as const, label: "Store", icon: Settings },
    { id: "team" as const, label: "Team", icon: Users },
    { id: "stores" as const, label: "My stores", icon: Store },
  ];

  return (
    <nav
      className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
      aria-label="Settings sections"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={href(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
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