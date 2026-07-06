"use client";

import { useId, type ReactNode } from "react";

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterToolbarProps<T extends string> = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  filters?: FilterOption<T>[];
  activeFilter?: T;
  onFilterChange?: (value: T) => void;
  filterLegend?: string;
  trailing?: ReactNode;
  resultCount?: number;
};

export function FilterToolbar<T extends string>({
  searchValue,
  onSearchChange,
  searchLabel = "Search",
  searchPlaceholder = "Search…",
  filters,
  activeFilter,
  onFilterChange,
  filterLegend = "Filter by status",
  trailing,
  resultCount,
}: FilterToolbarProps<T>) {
  const searchInputId = useId();

  return (
    <div className="mb-5 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form role="search" className="flex-1" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor={searchInputId} className="sr-only">
            {searchLabel}
          </label>
          <input
            id={searchInputId}
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="cf-input lg:max-w-md"
          />
        </form>
        {trailing}
      </div>

      {filters && filters.length > 0 && onFilterChange ? (
        <fieldset>
          <legend className="sr-only">{filterLegend}</legend>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;
              return (
                <button
                  key={filter.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFilterChange(filter.value)}
                  className={`cf-pill px-3.5 py-1.5 text-[12px] ${
                    active ? "cf-pill-active" : "text-[var(--cf-gray-600)]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {typeof resultCount === "number" ? (
        <output className="block text-[12px] text-[var(--cf-gray-400)]" aria-live="polite">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </output>
      ) : null}
    </div>
  );
}