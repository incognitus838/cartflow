"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "USD", label: "US Dollar ($)" },
];

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

export function StoreSettingsForm({ initial, appUrl }: StoreSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Store profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Store name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Store URL</label>
            <div className="flex items-center rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <span className="pl-3 text-sm text-slate-400">{appUrl.replace(/\/$/, "")}/</span>
              <input
                required
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo URL</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="https://..."
            />
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="mt-3 h-14 w-14 rounded-xl border border-slate-100 object-cover"
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Contact & checkout</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="+2348012345678"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Same as phone"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Default delivery fee
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Bank transfer details</h2>
        <p className="mt-1 text-xs text-slate-500">
          Shown to customers at checkout. Online payments (Paystack, etc.) coming later — manual
          transfer only for now.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Bank name</label>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Your bank"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Account name
              </label>
              <input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Your business name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Account number
              </label>
              <input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Account number"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Inventory</h2>
        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={autoDeductInventory}
            onChange={(e) => setAutoDeductInventory(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-800">
              Auto-deduct stock on paid orders
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              When enabled, inventory is reduced automatically when an order is marked paid.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notification email override
            </label>
            <input
              type="email"
              value={ownerNotifyEmail}
              onChange={(e) => setOwnerNotifyEmail(e.target.value)}
              placeholder="Defaults to your account email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={notifyOnNewOrder}
              onChange={(e) => setNotifyOnNewOrder(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Email/SMS on new orders</span>
              <span className="mt-1 block text-xs text-slate-500">
                Get notified when a customer places an order.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={notifyCustomerOnStatus}
              onChange={(e) => setNotifyCustomerOnStatus(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                Notify customer on status changes
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Send email/SMS when you update order status.
              </span>
            </span>
          </label>
        </div>
      </section>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}