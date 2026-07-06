"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { isValidSlug, suggestSlug } from "@/lib/slug";

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "USD", label: "US Dollar ($)" },
];

const TOTAL_STEPS = 4;

type FieldErrors = {
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  slug?: string;
};

function validateBankFields(
  bankName: string,
  bankAccountName: string,
  bankAccountNumber: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!bankName.trim()) errors.bankName = "Bank name is required.";
  if (!bankAccountName.trim()) errors.bankAccountName = "Account name is required.";
  const digits = bankAccountNumber.replace(/\s/g, "");
  if (!digits) {
    errors.bankAccountNumber = "Account number is required.";
  } else if (!/^\d{6,20}$/.test(digits)) {
    errors.bankAccountNumber = "Enter 6–20 digits (no spaces).";
  }
  return errors;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [currency, setCurrency] = useState("NGN");
  const [logoUrl, setLogoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const previewSlug = useMemo(() => {
    if (slugTouched && slug) return slug;
    return suggestSlug(name);
  }, [name, slug, slugTouched]);

  const finalSlug = slugTouched && slug ? slug : previewSlug;

  const bankErrors = validateBankFields(bankName, bankAccountName, bankAccountNumber);
  const bankStepValid = Object.keys(bankErrors).length === 0;
  const slugValid = isValidSlug(finalSlug);

  async function handleSubmit() {
    setSubmitAttempted(true);

    if (!name.trim()) {
      toast.error("Go back to step 1 and enter your business name.");
      return;
    }

    const errors: FieldErrors = { ...bankErrors };
    if (!slugValid) {
      errors.slug =
        "Store URL must be 3–48 characters: lowercase letters, numbers, and hyphens only.";
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      toast.error(first);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/business/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          currency,
          logoUrl: logoUrl || undefined,
          phone: phone || undefined,
          whatsapp: whatsapp || phone || undefined,
          description: description || undefined,
          bankName: bankName.trim(),
          bankAccountName: bankAccountName.trim(),
          bankAccountNumber: bankAccountNumber.replace(/\s/g, ""),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Could not create store");
        return;
      }

      toast.success(
        data.pendingApproval
          ? "Store submitted for review — we'll notify you when it's approved."
          : "Your store is live!",
      );
      router.push(data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function showError(key: keyof FieldErrors) {
    return submitAttempted ? fieldErrors[key] : undefined;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Step {step} of {TOTAL_STEPS}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Set up your store</h1>
        <p className="mt-2 text-sm text-slate-600">
          You&apos;ll get a shareable link for WhatsApp in under a minute.
        </p>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-emerald-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Business name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ada Styles"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Store URL</label>
              <div className="flex items-center rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <span className="pl-3 text-sm text-slate-400">cartflow.app/</span>
                <input
                  value={slugTouched ? slug : previewSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  className="flex-1 border-0 bg-transparent py-2.5 pr-3 text-sm outline-none"
                  placeholder="ada-styles"
                />
              </div>
              {slugTouched && slug && !isValidSlug(slug) ? (
                <p className="mt-1.5 text-xs text-red-600">
                  Use 3–48 characters: lowercase letters, numbers, and hyphens.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="btn-primary w-full py-2.5"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Logo URL <span className="text-slate-400">(optional)</span>
              </label>
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Short description <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="What do you sell?"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-2.5">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 py-2.5">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone / WhatsApp
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="+2348012345678"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                WhatsApp number <span className="text-slate-400">(if different)</span>
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Same as phone"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-2.5">
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!bankAccountName.trim() && name.trim()) {
                    setBankAccountName(name.trim());
                  }
                  setStep(4);
                }}
                className="btn-primary flex-1 py-2.5"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Bank transfer details</h2>
              <p className="mt-1 text-xs text-slate-500">
                Customers pay you by bank transfer and upload a receipt. This is shown on your
                checkout page.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bank name</label>
              <input
                required
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  if (fieldErrors.bankName) {
                    setFieldErrors((current) => ({ ...current, bankName: undefined }));
                  }
                }}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  showError("bankName")
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
                placeholder="Your bank"
              />
              {showError("bankName") ? (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.bankName}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Account name</label>
              <input
                required
                value={bankAccountName}
                onChange={(e) => {
                  setBankAccountName(e.target.value);
                  if (fieldErrors.bankAccountName) {
                    setFieldErrors((current) => ({ ...current, bankAccountName: undefined }));
                  }
                }}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  showError("bankAccountName")
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
                placeholder="Name on the account"
              />
              {showError("bankAccountName") ? (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.bankAccountName}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Account number
              </label>
              <input
                required
                value={bankAccountNumber}
                onChange={(e) => {
                  setBankAccountNumber(e.target.value.replace(/\D/g, ""));
                  if (fieldErrors.bankAccountNumber) {
                    setFieldErrors((current) => ({ ...current, bankAccountNumber: undefined }));
                  }
                }}
                className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  showError("bankAccountNumber")
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
                placeholder="10-digit account number"
                inputMode="numeric"
              />
              {showError("bankAccountNumber") ? (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.bankAccountNumber}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">6–20 digits, numbers only</p>
              )}
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Your store link</p>
              <p className="mt-1 font-mono text-emerald-700">cartflow.app/{finalSlug}</p>
              {submitAttempted && !slugValid ? (
                <p className="mt-2 text-xs text-red-600">
                  {fieldErrors.slug ??
                    "Store URL must be 3–48 characters. Go back to step 1 to edit it."}
                </p>
              ) : null}
            </div>
            {!bankStepValid && !submitAttempted ? (
              <p className="text-xs text-amber-700">
                Fill in all bank fields above to launch your store.
              </p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={loading}
                className="btn-secondary flex-1 py-2.5"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-2.5"
              >
                {loading ? "Creating…" : "Launch store"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}