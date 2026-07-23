const steps = [
  {
    step: "01",
    title: "Create your store",
    description: "Sign up, name your business, and receive a refined URL — cartflow.com.ng/your-shop.",
  },
  {
    step: "02",
    title: "Curate your collection",
    description: "Upload imagery, set prices, track inventory. Variants for sizes and options when needed.",
  },
  {
    step: "03",
    title: "Share on WhatsApp",
    description: "Drop your store link in chats and status. Customers browse and checkout effortlessly.",
  },
  {
    step: "04",
    title: "Fulfill with clarity",
    description:
      "Orders arrive with customer details and payment receipts. Approve payment and stock updates when you're ready.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#fbfbfd] px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="cf-heading text-[32px] sm:text-[40px]">Four steps to launch.</h2>
          <p className="cf-subtext mt-5 text-[17px]">
            From first product to first paid order — designed for sellers who value elegance and speed.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="group">
              <span className="text-[13px] font-medium tabular-nums tracking-widest text-[#b8956a]">
                {item.step}
              </span>
              <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">{item.description}</p>
              <div className="mt-4 h-px w-8 bg-black/[0.08] transition-all duration-500 group-hover:w-16 group-hover:bg-[#b8956a]/50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}