import type { CSSProperties } from "react";
import type { StorefrontTheme } from "@prisma/client";
import type { StorefrontProfile } from "@/lib/business/storefront-profile-shared";

export const DEFAULT_ACCENT = "#b8956a";

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidAccentColor(value: string) {
  return HEX_COLOR.test(value.trim());
}

export function normalizeAccentColor(value: string | null | undefined) {
  if (!value) return DEFAULT_ACCENT;
  const trimmed = value.trim();
  if (!isValidAccentColor(trimmed)) return DEFAULT_ACCENT;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

type ThemeTokens = {
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  headerBg: string;
  border: string;
};

const BASE_THEMES: Record<StorefrontTheme, Omit<ThemeTokens, "accent">> = {
  CLASSIC: {
    bg: "#fbfbfd",
    surface: "#ffffff",
    text: "#1d1d1f",
    muted: "#86868b",
    headerBg: "rgba(251, 251, 253, 0.85)",
    border: "rgba(0, 0, 0, 0.06)",
  },
  WARM: {
    bg: "#fffdf9",
    surface: "#ffffff",
    text: "#1d1d1f",
    muted: "#8a7f72",
    headerBg: "rgba(255, 253, 249, 0.9)",
    border: "rgba(184, 149, 106, 0.15)",
  },
  DARK: {
    bg: "#1d1d1f",
    surface: "#2d2d2f",
    text: "#f5f5f7",
    muted: "#a1a1a6",
    headerBg: "rgba(29, 29, 31, 0.92)",
    border: "rgba(255, 255, 255, 0.1)",
  },
};

export function resolveThemeTokens(profile: Pick<StorefrontProfile, "storefrontTheme" | "accentColor">): ThemeTokens {
  const accent = normalizeAccentColor(profile.accentColor);
  return { accent, ...BASE_THEMES[profile.storefrontTheme] };
}

export function themeStyleVars(profile: Pick<StorefrontProfile, "storefrontTheme" | "accentColor">): CSSProperties {
  const tokens = resolveThemeTokens(profile);
  return {
    ["--store-accent" as string]: tokens.accent,
    ["--store-bg" as string]: tokens.bg,
    ["--store-surface" as string]: tokens.surface,
    ["--store-text" as string]: tokens.text,
    ["--store-muted" as string]: tokens.muted,
    ["--store-header-bg" as string]: tokens.headerBg,
    ["--store-border" as string]: tokens.border,
  };
}