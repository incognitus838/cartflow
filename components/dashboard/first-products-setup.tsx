"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { FileSpreadsheet, Loader2, PackagePlus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

type AddedProduct = {
  id: string;
  title: string;
  price: number;
};

type Props = {
  currency: string;
  defaultCategory: string;
  initialCount?: number;
};

function parsePrice(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function parseCsv(text: string): Array<{ title: string; price: number; description?: string }> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const rows: Array<{ title: string; price: number; description?: string }> = [];
  let start = 0;
  const header = lines[0].toLowerCase();
  if (header.includes("name") || header.includes("title") || header.includes("price")) {
    start = 1;
  }

  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    const title = parts[0];
    const price = parsePrice(parts[1]);
    if (!title || title.length < 2 || !Number.isFinite(price) || price < 0) continue;
    const description = parts[2] || undefined;
    rows.push({ title, price, description });
  }
  return rows;
}

export function FirstProductsSetup({
  currency,
  defaultCategory,
  initialCount = 0,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"pick" | "quick" | "csv">("pick");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [added, setAdded] = useState<AddedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvBusy, setCsvBusy] = useState(false);
  const [importProgress, setImportProgress] = useState<string | null>(null);

  const totalAdded = initialCount + added.length;

  const currencyHint = useMemo(() => {
    if (currency === "NGN") return "₦";
    if (currency === "GHS") return "₵";
    if (currency === "USD") return "$";
    return currency;
  }, [currency]);

  async function bulkCreate(
    products: Array<{ title: string; price: number; description?: string }>,
  ) {
    const res = await fetch("/api/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defaultCategory: defaultCategory || "General",
        products,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      created?: number;
      failed?: number;
      products?: AddedProduct[];
      errors?: Array<{ index: number; title?: string; error: string }>;
    };
    if (!res.ok) {
      throw new Error(data.error || "Could not import products");
    }
    return data;
  }

  async function onQuickAdd(e: FormEvent) {
    e.preventDefault();
    const name = title.trim();
    const amount = parsePrice(price);
    if (name.length < 2) {
      toast.error("Enter a product name");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setLoading(true);
    try {
      const data = await bulkCreate([{ title: name, price: amount }]);
      if (data.products?.length) {
        setAdded((prev) => [...prev, ...data.products!]);
        setTitle("");
        setPrice("");
        toast.success(`Added “${data.products[0].title}”`);
        router.refresh();
      } else {
        toast.error(data.errors?.[0]?.error || "Could not add product");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add product");
    } finally {
      setLoading(false);
    }
  }

  async function onCsvFile(file: File) {
    setCsvBusy(true);
    setImportProgress("Reading file…");
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast.error("No valid rows. Use: name, price, description (optional)");
        return;
      }
      if (rows.length > 100) {
        toast.error("Import up to 100 products at a time.");
        return;
      }

      setImportProgress(`Importing ${rows.length} products…`);
      const data = await bulkCreate(rows);
      if (data.products?.length) {
        setAdded((prev) => [...prev, ...data.products!]);
      }
      toast.success(
        `Imported ${data.created ?? 0} product${(data.created ?? 0) === 1 ? "" : "s"}` +
          (data.failed ? ` (${data.failed} failed)` : ""),
      );
      if (data.errors?.[0]) {
        toast.message(`First error: ${data.errors[0].error}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that file");
    } finally {
      setCsvBusy(false);
      setImportProgress(null);
    }
  }

  return (
    <section
      aria-labelledby="add-products-heading"
      className="rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#1a7f5a]">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2
            id="add-products-heading"
            className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]"
          >
            Add your products
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#6e6e73]">
            Your store can only sell what it knows about. Add a few items now — you can always add
            more later.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("quick")}
          className={`rounded-[var(--cf-radius-md)] border p-4 text-left transition ${
            mode === "quick"
              ? "border-[#1a7f5a]/40 bg-[#f6fdf9] ring-1 ring-[#1a7f5a]/20"
              : "border-black/[0.06] bg-[#fbfbfd] hover:border-black/15"
          }`}
        >
          <PackagePlus className="h-5 w-5 text-[#1a7f5a]" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 text-[14px] font-semibold text-[#1d1d1f]">Quick add</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">
            Type a name and price. Best for a few items to start.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("csv")}
          className={`rounded-[var(--cf-radius-md)] border p-4 text-left transition ${
            mode === "csv"
              ? "border-[#1a7f5a]/40 bg-[#f6fdf9] ring-1 ring-[#1a7f5a]/20"
              : "border-black/[0.06] bg-[#fbfbfd] hover:border-black/15"
          }`}
        >
          <FileSpreadsheet className="h-5 w-5 text-[#1a7f5a]" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 text-[14px] font-semibold text-[#1d1d1f]">Upload CSV</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">
            Have a spreadsheet? Import your whole catalogue at once.
          </p>
        </button>
      </div>

      {mode === "quick" ? (
        <form
          onSubmit={(e) => void onQuickAdd(e)}
          className="mt-5 space-y-3 border-t border-black/[0.06] pt-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="qp-title" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Product name
              </label>
              <input
                id="qp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shea body butter 250ml"
                className="cf-input w-full py-2.5 text-[13px]"
              />
            </div>
            <div>
              <label htmlFor="qp-price" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Price ({currencyHint})
              </label>
              <input
                id="qp-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="5000"
                className="cf-input w-full py-2.5 text-[13px]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 py-2.5 text-[13px] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            {loading ? "Adding…" : "Add product"}
          </button>
        </form>
      ) : null}

      {mode === "csv" ? (
        <div className="mt-5 space-y-3 border-t border-black/[0.06] pt-5">
          <p className="text-[12px] text-[#86868b]">
            CSV columns: <span className="font-mono text-[#1d1d1f]">name, price</span> or{" "}
            <span className="font-mono text-[#1d1d1f]">name, price, description</span>. First row can
            be a header. Max 100 rows per upload.
          </p>
          {importProgress ? (
            <p className="text-[13px] font-medium text-[#1a7f5a]">{importProgress}</p>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]">
            {csvBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
            )}
            {csvBusy ? "Importing…" : "Choose CSV file"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={csvBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onCsvFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      ) : null}

      <div className="mt-6 rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-[#fbfbfd] p-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-[#86868b]">
          Added products · {totalAdded}
        </p>
        {added.length === 0 && initialCount === 0 ? (
          <p className="mt-2 text-[13px] text-[#86868b]">
            Nothing added yet. Pick an option above to start building your catalogue.
          </p>
        ) : (
          <ul className="mt-3 space-y-2" role="list">
            {added.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.04] bg-white px-3 py-2 text-[13px]"
              >
                <span className="font-medium text-[#1d1d1f]">{p.title}</span>
                <span className="tabular-nums text-[#6e6e73]">
                  {currencyHint}
                  {p.price.toLocaleString()}
                </span>
              </li>
            ))}
            {initialCount > 0 && added.length === 0 ? (
              <li className="text-[13px] text-[#86868b]">
                You already have {initialCount} product{initialCount === 1 ? "" : "s"} in your store.
              </li>
            ) : null}
          </ul>
        )}
        {totalAdded > 0 ? (
          <Link
            href="/dashboard/products"
            className="mt-3 inline-flex text-[13px] font-medium text-[#b8956a] hover:underline"
          >
            Manage all products →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
