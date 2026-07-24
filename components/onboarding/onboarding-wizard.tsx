"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LogoUploadField,
  type LogoUploadValue,
} from "@/components/shared/logo-upload-field";
import { SELL_TYPES, type SellTypeId } from "@/lib/catalog/sell-types";
import { isValidSlug, suggestSlug } from "@/lib/slug";
import { getPublicStoreHost } from "@/lib/storefront/paths";

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "USD", label: "US Dollar ($)" },
];

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

type OnboardingWizardProps = {
  mode?: "register" | "add";
};

export function OnboardingWizard({ mode = "register" }: OnboardingWizardProps) {
  const isRegister = mode === "register";
  const isAddStore = mode === "add";
  const totalSteps = isRegister ? 6 : 5;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sellTypeId, setSellTypeId] = useState<SellTypeId | null>(null);
  const [currency, setCurrency] = useState("NGN");
  const [logoUpload, setLogoUpload] = useState<LogoUploadValue | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Step map (register): 1 account, 2 store name, 3 sell type, 4 branding, 5 contact, 6 bank
  // Add store: same without account (1 store name … 5 bank)
  const stepAccount = isRegister ? 1 : 0;
  const stepStore = isRegister ? 2 : 1;
  const stepSell = isRegister ? 3 : 2;
  const stepBrand = isRegister ? 4 : 3;
  const stepContact = isRegister ? 5 : 4;
  const stepBank = isRegister ? 6 : 5;

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

    if (isRegister) {
      if (!ownerName.trim() || ownerEmail.trim().length < 3 || password.length < 8) {
        toast.error("Go back to step 1 and complete your account details.");
        return;
      }
    }

    if (!name.trim()) {
      toast.error(`Go back to step ${stepStore} and enter your business name.`);
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
      const payload = {
        name: name.trim(),
        slug: finalSlug,
        currency,
        logoBase64: logoUpload?.base64,
        logoMimeType: logoUpload?.mimeType,
        phone: phone || undefined,
        whatsapp: whatsapp || phone || undefined,
        description: description || undefined,
        bankName: bankName.trim(),
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber: bankAccountNumber.replace(/\s/g, ""),
        sellTypeId: sellTypeId ?? undefined,
      };

      const res = await fetch(isRegister ? "/api/business/register" : "/api/business/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? {
                ownerName: ownerName.trim(),
                ownerEmail: ownerEmail.trim().toLowerCase(),
                password,
                ...payload,
              }
            : payload,
        ),
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
      {isAddStore ? (
        <Link
          href="/dashboard/stores"
          className="mb-4 inline-block text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
        >
          ← Back to my stores
        </Link>
      ) : (
        <p className="mb-4 text-[13px] text-[#6e6e73]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#b8956a] hover:underline">
            Log in
          </Link>
        </p>
      )}
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#b8956a]">
          Step {step} of {totalSteps}
        </p>
        <h1 className="mt-2 cf-page-title text-[1.75rem]">
          {isAddStore ? "Add a new store" : "Start your store"}
        </h1>
        <p className="mt-2 text-[13px] text-[#6e6e73]">
          {isAddStore
            ? "Each store gets its own catalog, checkout link, and approval review."
            : "Your account is only created when you finish setup — nothing is saved until then."}
        </p>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-[#1a7f5a]" : "bg-black/[0.08]"}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
        {isRegister && step === stepAccount ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Your full name</label>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                autoComplete="name"
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="Ada Okonkwo"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                autoComplete="email"
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="button"
              disabled={ownerName.trim().length < 2 || !ownerEmail.includes("@") || password.length < 8}
              onClick={() => setStep(stepStore)}
              className="btn-primary w-full py-2.5"
            >
              Continue
            </button>
          </div>
        ) : null}

        {step === stepStore ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Business name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="Ada Styles"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Store URL</label>
              <div className="flex items-center rounded-lg border border-black/[0.08] focus-within:border-[#b8956a] focus-within:ring-2 focus-within:ring-[#b8956a]/20">
                <span className="pl-3 text-sm text-[#86868b]">{getPublicStoreHost()}/</span>
                <input
                  value={slugTouched ? slug : previewSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  className="flex-1 border-0 bg-transparent py-2.5 pr-3 text-[13px] text-[#1d1d1f] outline-none"
                  placeholder="ada-styles"
                />
              </div>
              {slugTouched && slug && !isValidSlug(slug) ? (
                <p className="mt-1.5 text-[12px] text-red-600">
                  Use 3–48 characters: lowercase letters, numbers, and hyphens.
                </p>
              ) : null}
            </div>
            <div className="flex gap-3">
              {isRegister ? (
                <button
                  type="button"
                  onClick={() => setStep(stepAccount)}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(stepSell)}
                className={`btn-primary py-2.5 ${isRegister ? "flex-1" : "w-full"}`}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === stepSell ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1d1d1f]">What do you sell?</h2>
              <p className="mt-1 text-[13px] text-[#6e6e73]">
                This shapes your store&apos;s look — you can change it anytime.
              </p>
            </div>
            <div className="grid gap-2.5">
              {SELL_TYPES.map((type) => {
                const selected = sellTypeId === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSellTypeId(type.id)}
                    className={`rounded-xl border px-4 py-3.5 text-left transition ${
                      selected
                        ? "border-[#1a7f5a]/50 bg-[#f6fdf9] ring-1 ring-[#1a7f5a]/25"
                        : "border-black/[0.08] bg-white hover:border-black/15"
                    }`}
                  >
                    <p className="text-[14px] font-semibold text-[#1d1d1f]">{type.label}</p>
                    <p className="mt-0.5 text-[12px] text-[#86868b]">{type.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(stepStore)}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!sellTypeId}
                  onClick={() => setStep(stepBrand)}
                  className="btn-primary flex-1 py-2.5 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSellTypeId(null);
                  setStep(stepBrand);
                }}
                className="text-center text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f]"
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : null}

        {step === stepBrand ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="cf-input w-full py-2.5 text-[13px]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="store-logo-upload" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Store logo <span className="text-[#86868b]">(optional)</span>
              </label>
              <LogoUploadField
                id="store-logo-upload"
                value={logoUpload}
                onChange={setLogoUpload}
                onError={(message) => toast.error(message)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Short description <span className="text-[#86868b]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="A short line about your brand"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(stepSell)}
                className="btn-secondary flex-1 py-2.5"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(stepContact)}
                className="btn-primary flex-1 py-2.5"
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === stepContact ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Phone / WhatsApp
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="+2348012345678"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                WhatsApp number <span className="text-[#86868b]">(if different)</span>
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="cf-input w-full py-2.5 text-[13px]"
                placeholder="Same as phone"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(stepBrand)}
                className="btn-secondary flex-1 py-2.5"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!bankAccountName.trim() && name.trim()) {
                    setBankAccountName(name.trim());
                  }
                  setStep(stepBank);
                }}
                className="btn-primary flex-1 py-2.5"
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === stepBank ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <div>
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Bank transfer details</h2>
              <p className="mt-1 text-[12px] text-[#86868b]">
                Customers pay you by bank transfer and upload a receipt. This is shown on your
                checkout page.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Bank name</label>
              <input
                required
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  if (fieldErrors.bankName) {
                    setFieldErrors((current) => ({ ...current, bankName: undefined }));
                  }
                }}
                className={`cf-input w-full py-2.5 text-[13px] ${
                  showError("bankName")
                    ? "border-red-400"
                    : ""
                }`}
                placeholder="Your bank"
              />
              {showError("bankName") ? (
                <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.bankName}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">Account name</label>
              <input
                required
                value={bankAccountName}
                onChange={(e) => {
                  setBankAccountName(e.target.value);
                  if (fieldErrors.bankAccountName) {
                    setFieldErrors((current) => ({ ...current, bankAccountName: undefined }));
                  }
                }}
                className={`cf-input w-full py-2.5 text-[13px] ${
                  showError("bankAccountName")
                    ? "border-red-400"
                    : ""
                }`}
                placeholder="Name on the account"
              />
              {showError("bankAccountName") ? (
                <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.bankAccountName}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
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
                className={`cf-input w-full py-2.5 font-mono text-[13px] ${
                  showError("bankAccountNumber")
                    ? "border-red-400"
                    : ""
                }`}
                placeholder="10-digit account number"
                inputMode="numeric"
              />
              {showError("bankAccountNumber") ? (
                <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.bankAccountNumber}</p>
              ) : (
                <p className="mt-1.5 text-xs text-[#86868b]">6–20 digits, numbers only</p>
              )}
            </div>
            <div className="rounded-[var(--cf-radius-md)] bg-[#f5f5f7] p-4 text-[13px] text-[#6e6e73]">
              <p className="font-medium text-[#1d1d1f]">Your store link</p>
              <p className="mt-1 font-mono text-[#b8956a]">
                {getPublicStoreHost()}/{finalSlug}
              </p>
              {sellTypeId ? (
                <p className="mt-2 text-[12px] text-[#86868b]">
                  Catalog: {SELL_TYPES.find((t) => t.id === sellTypeId)?.label}
                </p>
              ) : null}
              {submitAttempted && !slugValid ? (
                <p className="mt-2 text-[12px] text-red-600">
                  {fieldErrors.slug ??
                    `Store URL must be 3–48 characters. Go back to step ${stepStore} to edit it.`}
                </p>
              ) : null}
            </div>
            {!bankStepValid && !submitAttempted ? (
              <p className="text-[12px] text-amber-800">
                Fill in all bank fields above to launch your store.
              </p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(stepContact)}
                disabled={loading}
                className="btn-secondary flex-1 py-2.5"
              >
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
                {loading ? "Creating…" : isAddStore ? "Submit store" : "Launch store"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
