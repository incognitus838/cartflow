import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Perfect for testing and curated small collections.",
    features: [
      "Up to 10 products",
      "Store link (/your-shop)",
      "Order dashboard",
      "Manual bank transfer",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₦4,999",
    period: "/month",
    description: "Growing sellers who need more catalog and analytics.",
    features: [
      "Unlimited products",
      "Manual payments + receipt upload",
      "Low-stock overview banner",
      "Basic analytics",
      // "Paystack & Flutterwave", // implement later
    ],
    cta: "Get Starter",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₦12,999",
    period: "/month",
    description: "Higher-volume stores with richer insights.",
    features: [
      "Everything in Starter",
      "Extended analytics",
      "Up to 5 team seats",
      "Email support",
      // "Custom domain", // implement later
    ],
    cta: "Get Pro",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-black/[0.06] bg-white px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="cf-heading text-[32px] sm:text-[40px]">Transparent pricing.</h2>
          <p className="cf-subtext mt-5 text-[17px]">
            Start free. Upgrade when you&apos;re ready to scale beyond DMs.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`cf-card flex flex-col p-8 ${
                tier.highlighted ? "border-[#1d1d1f] ring-1 ring-[#1d1d1f]/10" : ""
              }`}
            >
              {tier.highlighted ? (
                <span className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#b8956a]">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">{tier.name}</h3>
              <p className="mt-2 text-[14px] text-[#6e6e73]">{tier.description}</p>
              <p className="mt-6">
                <span className="text-[40px] font-semibold tracking-tight tabular-nums text-[#1d1d1f]">
                  {tier.price}
                </span>
                <span className="text-[14px] text-[#86868b]">{tier.period}</span>
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[14px] text-[#6e6e73]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1d1d1f]" strokeWidth={2} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-8 block text-center text-[14px] ${
                  tier.highlighted ? "btn-primary" : "btn-secondary"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}