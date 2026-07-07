"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Monitor, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type { CatalogLayout, StorefrontTheme } from "@prisma/client";
import { StorefrontPreview } from "@/components/dashboard/storefront-preview";
import {
  CATALOG_LAYOUT_OPTIONS,
  type StorefrontProfile,
  STOREFRONT_THEME_OPTIONS,
} from "@/lib/business/storefront-profile-shared";
import { DEFAULT_ACCENT, isValidAccentColor } from "@/lib/storefront/theme";
import type { StorefrontProductCard } from "@/components/storefront/product-card";

export type StorefrontCustomizerStore = {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  currency: string;
};

type StorefrontCustomizerProps = {
  initialProfile: StorefrontProfile;
  store: StorefrontCustomizerStore;
  products: StorefrontProductCard[];
  catalogTotalCount: number;
  appUrl: string;
};

const THEME_SWATCH: Record<StorefrontTheme, string> = {
  CLASSIC: "linear-gradient(135deg, #fbfbfd 50%, #ffffff 50%)",
  WARM: "linear-gradient(135deg, #fffdf9 50%, #f5ebe0 50%)",
  DARK: "linear-gradient(135deg, #1d1d1f 50%, #2d2d2f 50%)",
};

export function StorefrontCustomizer({
  initialProfile,
  store,
  products,
  catalogTotalCount,
  appUrl,
}: StorefrontCustomizerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("desktop");
  const [dirty, setDirty] = useState(false);

  const liveUrl = `${appUrl}/${store.slug}`;

  const draft = useMemo(
    () => ({
      profile,
      store,
      products: products.slice(0, previewModeProducts(profile.catalogLayout)),
      catalogTotalCount,
    }),
    [profile, store, products, catalogTotalCount],
  );

  function updateProfile(patch: Partial<StorefrontProfile>) {
    setProfile((p) => ({ ...p, ...patch }));
    setDirty(true);
  }

  async function handleSave() {
    if (profile.accentColor && !isValidAccentColor(profile.accentColor)) {
      toast.error("Accent color must be a valid hex code (e.g. #b8956a)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/business/storefront-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storefrontTheme: profile.storefrontTheme,
          accentColor: profile.accentColor === DEFAULT_ACCENT ? "" : profile.accentColor,
          heroTagline: profile.heroTagline ?? "",
          welcomeMessage: profile.welcomeMessage ?? "",
          showContactButton: profile.showContactButton,
          catalogLayout: profile.catalogLayout,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not save");
        return;
      }
      setProfile(data.profile);
      setDirty(false);
      toast.success("Storefront saved — customers will see your changes");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="cf-dash-sticky-toolbar -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[13px] font-semibold text-[#1d1d1f]">Storefront designer</p>
          <p className="text-[11px] text-[#86868b]">
            {dirty ? "Unsaved changes" : "All changes saved"}
            {" · "}
            <span className="font-mono">/{store.slug}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cf-btn-inline cf-btn-inline-ghost text-[12px]"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Live store
          </a>
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-[13px] disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            {loading ? "Saving…" : dirty ? "Save changes" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,340px)_1fr]">
        <aside className="space-y-4" aria-label="Storefront customization">
          <section className="cf-stat-card space-y-4">
            <div>
              <h2 className="text-[13px] font-semibold text-[#1d1d1f]">Appearance</h2>
              <p className="mt-0.5 text-[12px] text-[#86868b]">Theme and accent color</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {STOREFRONT_THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={profile.storefrontTheme === option.value}
                  onClick={() => updateProfile({ storefrontTheme: option.value })}
                  className={`rounded-[14px] border p-2 text-left transition-all ${
                    profile.storefrontTheme === option.value
                      ? "border-[#1d1d1f] ring-2 ring-[#1d1d1f]/10"
                      : "border-black/[0.06] hover:border-black/[0.12]"
                  }`}
                >
                  <span
                    className="mb-2 block h-10 w-full rounded-[10px] border border-black/[0.06]"
                    style={{ background: THEME_SWATCH[option.value] }}
                    aria-hidden
                  />
                  <span className="block text-[11px] font-semibold text-[#1d1d1f]">{option.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="accentColor" className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-[#86868b]">
                Accent
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="accentColor"
                  type="color"
                  value={profile.accentColor}
                  onChange={(e) => updateProfile({ accentColor: e.target.value })}
                  className="h-11 w-12 cursor-pointer rounded-[12px] border border-black/[0.08] bg-white"
                />
                <input
                  type="text"
                  value={profile.accentColor}
                  onChange={(e) => updateProfile({ accentColor: e.target.value })}
                  className="cf-input flex-1 font-mono text-[13px]"
                  placeholder="#b8956a"
                />
              </div>
            </div>
          </section>

          <section className="cf-stat-card space-y-4">
            <div>
              <h2 className="text-[13px] font-semibold text-[#1d1d1f]">Messaging</h2>
              <p className="mt-0.5 text-[12px] text-[#86868b]">What customers read first</p>
            </div>

            <div>
              <label htmlFor="heroTagline" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Tagline
              </label>
              <input
                id="heroTagline"
                type="text"
                value={profile.heroTagline ?? ""}
                onChange={(e) => updateProfile({ heroTagline: e.target.value || null })}
                placeholder={store.description ?? "Short line under your store name"}
                className="cf-input"
                maxLength={120}
              />
            </div>

            <div>
              <label htmlFor="welcomeMessage" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Welcome banner
              </label>
              <textarea
                id="welcomeMessage"
                value={profile.welcomeMessage ?? ""}
                onChange={(e) => updateProfile({ welcomeMessage: e.target.value || null })}
                placeholder="e.g. Free delivery in Lagos this week"
                className="cf-input min-h-[80px] resize-y"
                maxLength={280}
              />
            </div>
          </section>

          <section className="cf-stat-card space-y-4">
            <div>
              <h2 className="text-[13px] font-semibold text-[#1d1d1f]">Layout</h2>
              <p className="mt-0.5 text-[12px] text-[#86868b]">Catalog presentation</p>
            </div>

            <div
              className="inline-flex w-full rounded-full border border-black/[0.06] bg-[#f5f5f7] p-1"
              role="group"
              aria-label="Catalog layout"
            >
              {CATALOG_LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={profile.catalogLayout === option.value}
                  onClick={() => updateProfile({ catalogLayout: option.value as CatalogLayout })}
                  className={`flex-1 rounded-full py-2 text-[12px] font-medium transition-all ${
                    profile.catalogLayout === option.value
                      ? "bg-white text-[#1d1d1f] shadow-sm"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-black/[0.06] bg-[#fbfbfd] px-4 py-3">
              <span className="text-[13px] text-[#1d1d1f]">WhatsApp chat button</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-[#1d1d1f]"
                checked={profile.showContactButton}
                onChange={(e) => updateProfile({ showContactButton: e.target.checked })}
              />
            </label>
          </section>

          <p className="text-[12px] leading-relaxed text-[#86868b]">
            Logo, store name, and bank details are in{" "}
            <Link href="/dashboard/settings" className="font-medium text-[#b8956a] hover:underline">
              Settings
            </Link>
            .
          </p>
        </aside>

        <section aria-label="Customer preview">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-[#1d1d1f]">Live preview</p>
            <div
              className="inline-flex rounded-full border border-black/[0.06] bg-[#f5f5f7] p-1"
              role="group"
              aria-label="Preview viewport"
            >
              <button
                type="button"
                aria-pressed={viewport === "mobile"}
                onClick={() => setViewport("mobile")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  viewport === "mobile" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b]"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden />
                Mobile
              </button>
              <button
                type="button"
                aria-pressed={viewport === "desktop"}
                onClick={() => setViewport("desktop")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  viewport === "desktop" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b]"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" aria-hidden />
                Desktop
              </button>
            </div>
          </div>
          <StorefrontPreview draft={draft} viewport={viewport} />
        </section>
      </div>
    </div>
  );
}

function previewModeProducts(layout: CatalogLayout) {
  return layout === "LIST" ? 3 : 4;
}