"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  ExternalLink,
  Landmark,
  Lock,
  Package,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "USD", label: "US Dollar ($)" },
] as const;

export type StoreSettingsInitial = {
  name: string;
  slug: string;
  description: string;
  currency: string;
  deliveryFee: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  autoDeductInventory: boolean;
  notifyOnNewOrder: boolean;
  notifyCustomerOnStatus: boolean;
  ownerNotifyEmail: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

type StoreSettingsFormProps = {
  initial: StoreSettingsInitial;
  appUrl: string;
};

type SectionId = "profile" | "contact" | "bank" | "inventory" | "notifications";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function currencyLabel(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.label ?? code;
}

function maskAccountNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits || "—";
  return `•••• ${digits.slice(-4)}`;
}

function StatusPill({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        on ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500",
      )}
    >
      {on ? "On" : "Off"}
    </span>
  );
}

function ViewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
}

type SettingsSectionProps = {
  id: SectionId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  view: ReactNode;
  edit: ReactNode;
  accent?: "default" | "amber";
};

function SettingsSection({
  title,
  description,
  icon: Icon,
  editing,
  onEdit,
  onCancel,
  view,
  edit,
  accent = "default",
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        editing
          ? "border-emerald-200 ring-2 ring-emerald-500/10"
          : accent === "amber"
            ? "border-amber-200/80"
            : "border-slate-200",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 sm:px-6",
          accent === "amber" ? "border-amber-100 bg-amber-50/40" : "border-slate-100 bg-slate-50/60",
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              accent === "amber" ? "bg-amber-100 text-amber-800" : "bg-white text-slate-600 shadow-sm",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
        {editing ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
      <div className="p-5 sm:p-6">{editing ? edit : view}</div>
    </section>
  );
}

function ToggleRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-slate-800">{title}</span>
        <span className="mt-1 block text-xs text-slate-500">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-emerald-600" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </label>
  );
}

export function StoreSettingsForm({ initial, appUrl }: StoreSettingsFormProps) {
  const router = useRouter();
  const baseUrl = appUrl.replace(/\/$/, "");
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionId | null>(null);

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description);
  const [currency, setCurrency] = useState(initial.currency);
  const [deliveryFee, setDeliveryFee] = useState(initial.deliveryFee);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [phone, setPhone] = useState(initial.phone);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [autoDeductInventory, setAutoDeductInventory] = useState(initial.autoDeductInventory);
  const [notifyOnNewOrder, setNotifyOnNewOrder] = useState(initial.notifyOnNewOrder);
  const [notifyCustomerOnStatus, setNotifyCustomerOnStatus] = useState(initial.notifyCustomerOnStatus);
  const [ownerNotifyEmail, setOwnerNotifyEmail] = useState(initial.ownerNotifyEmail);
  const [bankName, setBankName] = useState(initial.bankName);
  const [bankAccountName, setBankAccountName] = useState(initial.bankAccountName);
  const [bankAccountNumber, setBankAccountNumber] = useState(initial.bankAccountNumber);

  const snapshot = useMemo(
    () => ({
      name,
      slug,
      description,
      currency,
      deliveryFee,
      logoUrl,
      phone,
      whatsapp,
      autoDeductInventory,
      notifyOnNewOrder,
      notifyCustomerOnStatus,
      ownerNotifyEmail,
      bankName,
      bankAccountName,
      bankAccountNumber,
    }),
    [
      name,
      slug,
      description,
      currency,
      deliveryFee,
      logoUrl,
      phone,
      whatsapp,
      autoDeductInventory,
      notifyOnNewOrder,
      notifyCustomerOnStatus,
      ownerNotifyEmail,
      bankName,
      bankAccountName,
      bankAccountNumber,
    ],
  );

  const hasChanges = useMemo(
    () => JSON.stringify(snapshot) !== JSON.stringify(initial),
    [snapshot, initial],
  );

  function revertSection(section: SectionId) {
    if (section === "profile") {
      setName(initial.name);
      setSlug(initial.slug);
      setDescription(initial.description);
      setLogoUrl(initial.logoUrl);
    } else if (section === "contact") {
      setPhone(initial.phone);
      setWhatsapp(initial.whatsapp);
      setCurrency(initial.currency);
      setDeliveryFee(initial.deliveryFee);
    } else if (section === "bank") {
      setBankName(initial.bankName);
      setBankAccountName(initial.bankAccountName);
      setBankAccountNumber(initial.bankAccountNumber);
    } else if (section === "inventory") {
      setAutoDeductInventory(initial.autoDeductInventory);
    } else {
      setOwnerNotifyEmail(initial.ownerNotifyEmail);
      setNotifyOnNewOrder(initial.notifyOnNewOrder);
      setNotifyCustomerOnStatus(initial.notifyCustomerOnStatus);
    }
  }

  function startEdit(section: SectionId) {
    if (editingSection && editingSection !== section) {
      revertSection(editingSection);
    }
    setEditingSection(section);
  }

  function cancelEdit(section: SectionId) {
    revertSection(section);
    setEditingSection(null);
  }

  function discardAll() {
    setName(initial.name);
    setSlug(initial.slug);
    setDescription(initial.description);
    setCurrency(initial.currency);
    setDeliveryFee(initial.deliveryFee);
    setLogoUrl(initial.logoUrl);
    setPhone(initial.phone);
    setWhatsapp(initial.whatsapp);
    setAutoDeductInventory(initial.autoDeductInventory);
    setNotifyOnNewOrder(initial.notifyOnNewOrder);
    setNotifyCustomerOnStatus(initial.notifyCustomerOnStatus);
    setOwnerNotifyEmail(initial.ownerNotifyEmail);
    setBankName(initial.bankName);
    setBankAccountName(initial.bankAccountName);
    setBankAccountNumber(initial.bankAccountNumber);
    setEditingSection(null);
    toast.message("Changes discarded");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!hasChanges) return;
    setLoading(true);

    try {
      const res = await fetch("/api/business/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          currency,
          deliveryFee: Number(deliveryFee),
          logoUrl: logoUrl || undefined,
          phone: phone || undefined,
          whatsapp: whatsapp || undefined,
          autoDeductInventory,
          notifyOnNewOrder,
          notifyCustomerOnStatus,
          ownerNotifyEmail: ownerNotifyEmail || undefined,
          bankName: bankName || undefined,
          bankAccountName: bankAccountName || undefined,
          bankAccountNumber: bankAccountNumber || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not save settings");
        return;
      }

      toast.success("Settings saved");
      setEditingSection(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const storefrontUrl = `${baseUrl}/${slug}`;

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl space-y-5 pb-24">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-7 w-7 text-white/70" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/50">Live preview</p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">{name || "Your store"}</h2>
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:text-emerald-200"
            >
              {storefrontUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {description ? <p className="mt-2 line-clamp-2 text-sm text-white/70">{description}</p> : null}
          </div>
        </div>
      </section>

      {!editingSection ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <Lock className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
          Settings are read-only until you click <span className="font-medium text-slate-800">Edit</span> on a
          section. Save only when you&apos;re done — nothing is sent until then.
        </p>
      ) : null}

      <SettingsSection
        id="profile"
        title="Store profile"
        description="Name, URL, and branding customers see on your storefront."
        icon={Building2}
        editing={editingSection === "profile"}
        onEdit={() => startEdit("profile")}
        onCancel={() => cancelEdit("profile")}
        view={
          <dl className="space-y-4">
            <ViewRow label="Store name">{name || "—"}</ViewRow>
            <ViewRow label="Store URL">
              <span className="font-mono text-[13px]">/{slug}</span>
            </ViewRow>
            <ViewRow label="Description">{description || <span className="text-slate-400">Not set</span>}</ViewRow>
            <ViewRow label="Logo">
              {logoUrl ? (
                <img src={logoUrl} alt="Store logo" className="h-12 w-12 rounded-xl border border-slate-100 object-cover" />
              ) : (
                <span className="text-slate-400">No logo</span>
              )}
            </ViewRow>
          </dl>
        }
        edit={
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Store name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Store URL</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <span className="pl-3 text-sm text-slate-400">{baseUrl}/</span>
                <input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 border-0 bg-transparent py-2.5 pr-3 text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo URL</label>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={INPUT_CLASS}
                placeholder="https://..."
              />
            </div>
          </div>
        }
      />

      <SettingsSection
        id="contact"
        title="Contact & checkout"
        description="Phone, currency, and default delivery fee at checkout."
        icon={Phone}
        editing={editingSection === "contact"}
        onEdit={() => startEdit("contact")}
        onCancel={() => cancelEdit("contact")}
        view={
          <dl className="space-y-4">
            <ViewRow label="Phone">{phone || <span className="text-slate-400">Not set</span>}</ViewRow>
            <ViewRow label="WhatsApp">{whatsapp || phone || <span className="text-slate-400">Same as phone</span>}</ViewRow>
            <ViewRow label="Currency">{currencyLabel(currency)}</ViewRow>
            <ViewRow label="Delivery fee">
              {formatCurrency(Number(deliveryFee) || 0, currency)}
            </ViewRow>
          </dl>
        }
        edit={
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT_CLASS} placeholder="+2348012345678" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">WhatsApp</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={INPUT_CLASS} placeholder="Same as phone" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT_CLASS}>
                  {CURRENCIES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Default delivery fee</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        }
      />

      <SettingsSection
        id="bank"
        title="Bank transfer details"
        description="Shown to customers at checkout. Manual transfer only for now."
        icon={Landmark}
        accent="amber"
        editing={editingSection === "bank"}
        onEdit={() => startEdit("bank")}
        onCancel={() => cancelEdit("bank")}
        view={
          <dl className="space-y-4">
            <ViewRow label="Bank">{bankName || <span className="text-slate-400">Not set</span>}</ViewRow>
            <ViewRow label="Account name">{bankAccountName || <span className="text-slate-400">Not set</span>}</ViewRow>
            <ViewRow label="Account no.">
              <span className="font-mono">{maskAccountNumber(bankAccountNumber)}</span>
            </ViewRow>
          </dl>
        }
        edit={
          <div className="space-y-4">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Customers use these details to pay you. Double-check before saving.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bank name</label>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={INPUT_CLASS} placeholder="Your bank" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Account name</label>
                <input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Account number</label>
                <input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className={cn(INPUT_CLASS, "font-mono")}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        }
      />

      <SettingsSection
        id="inventory"
        title="Inventory"
        description="How stock is handled when orders are paid."
        icon={Package}
        editing={editingSection === "inventory"}
        onEdit={() => startEdit("inventory")}
        onCancel={() => cancelEdit("inventory")}
        view={
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Auto-deduct stock on paid orders</p>
              <p className="mt-1 text-xs text-slate-500">
                Inventory reduces automatically when an order is marked paid.
              </p>
            </div>
            <StatusPill on={autoDeductInventory} />
          </div>
        }
        edit={
          <ToggleRow
            checked={autoDeductInventory}
            onChange={setAutoDeductInventory}
            title="Auto-deduct stock on paid orders"
            description="When enabled, inventory is reduced automatically when an order is marked paid."
          />
        }
      />

      <SettingsSection
        id="notifications"
        title="Notifications"
        description="Email alerts for you and status updates for customers."
        icon={Bell}
        editing={editingSection === "notifications"}
        onEdit={() => startEdit("notifications")}
        onCancel={() => cancelEdit("notifications")}
        view={
          <dl className="space-y-4">
            <ViewRow label="Notify email">
              {ownerNotifyEmail || <span className="text-slate-400">Account email</span>}
            </ViewRow>
            <ViewRow label="New orders">
              <StatusPill on={notifyOnNewOrder} />
            </ViewRow>
            <ViewRow label="Customer updates">
              <StatusPill on={notifyCustomerOnStatus} />
            </ViewRow>
          </dl>
        }
        edit={
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notification email override</label>
              <input
                type="email"
                value={ownerNotifyEmail}
                onChange={(e) => setOwnerNotifyEmail(e.target.value)}
                placeholder="Defaults to your account email"
                className={INPUT_CLASS}
              />
            </div>
            <ToggleRow
              checked={notifyOnNewOrder}
              onChange={setNotifyOnNewOrder}
              title="Email/SMS on new orders"
              description="Get notified when a customer places an order."
            />
            <ToggleRow
              checked={notifyCustomerOnStatus}
              onChange={setNotifyCustomerOnStatus}
              title="Notify customer on status changes"
              description="Send email/SMS when you update order status."
            />
          </div>
        }
      />

      {hasChanges ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-amber-800">Unsaved changes</span>
              {editingSection ? ` in ${editingSection}` : ""} — review before saving.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={discardAll} className="btn-secondary px-4 py-2 text-sm">
                Discard
              </button>
              <button type="submit" disabled={loading} className="btn-primary px-5 py-2 text-sm">
                {loading ? "Saving…" : "Save settings"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400">
          No pending changes. Edit a section above to update your store.
        </p>
      )}
    </form>
  );
}