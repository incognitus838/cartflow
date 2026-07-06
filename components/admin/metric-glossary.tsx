import { METRIC_DEFINITIONS } from "@/lib/admin/metrics";

export function MetricGlossary() {
  return (
    <section aria-labelledby="metric-glossary" className="cf-stat-card">
      <h2 id="metric-glossary" className="text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
        Metric definitions
      </h2>
      <p className="mt-1 text-[12px] text-[#86868b]">
        Data-proven analysis — every number below has a spec and a decision it drives.
      </p>
      <dl className="mt-4 space-y-4">
        {Object.entries(METRIC_DEFINITIONS).map(([key, metric]) => (
          <div key={key} className="border-t border-black/[0.04] pt-4 first:border-0 first:pt-0">
            <dt className="text-[13px] font-semibold text-[#1d1d1f]">{metric.label}</dt>
            <dd className="mt-1 text-[12px] leading-relaxed text-[#6e6e73]">{metric.definition}</dd>
            <dd className="mt-1.5 text-[11px] font-medium text-[#b8956a]">
              Action: {metric.action}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}