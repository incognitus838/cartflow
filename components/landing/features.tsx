import {
  BarChart3,
  CreditCard,
  Package,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Share2,
    title: "Share anywhere",
    description:
      "One elegant link for WhatsApp, Instagram, and DMs. Customers browse and checkout without friction.",
  },
  {
    icon: CreditCard,
    title: "Manual bank transfer",
    description:
      "Customers pay to your bank account, upload a receipt, and you approve in your dashboard. Paystack & Flutterwave coming soon.",
  },
  {
    icon: Package,
    title: "Inventory that syncs",
    description:
      "Stock deducts when you mark orders paid. Low-stock banner on your overview so you never oversell.",
  },
  {
    icon: BarChart3,
    title: "Orders dashboard",
    description:
      "Track pending, paid, shipped, and delivered in one refined workspace built for how you fulfill.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    description:
      "Buttery smooth on every device. Designed for thumb-scrolling buyers and sellers on the go.",
  },
  {
    icon: Sparkles,
    title: "Minutes to launch",
    description:
      "Add products, copy your store URL, share on WhatsApp. No themes, no code, no complexity.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-black/[0.06] bg-white px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="cf-heading text-[32px] sm:text-[40px]">
            Meticulously crafted.
            <span className="block text-[#86868b]">Intuitively powerful.</span>
          </h2>
          <p className="cf-subtext mt-5 text-[17px]">
            Everything chat selling is missing — in one premium platform built for African entrepreneurs.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="cf-card group p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-black/[0.06] bg-[#fbfbfd] text-[#1d1d1f] transition-colors group-hover:border-[#b8956a]/30 group-hover:text-[#b8956a]">
                <feature.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}