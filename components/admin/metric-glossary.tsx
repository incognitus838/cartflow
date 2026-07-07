import { METRIC_DEFINITIONS } from "@/lib/admin/metrics";

function GlossaryList({ compact = false }: { compact?: boolean }) {
  return (
    <dl className={compact ? "mt-3 space-y-3" : "mt-4 space-y-4"}>
      {Object.entries(METRIC_DEFINITIONS).map(([key, metric]) => (
        <div key={key} className="border-t border-black/[0.04] pt-3 first:border-0 first:pt-0 sm:pt-4">
          <dt className={`font-semibold text-[#1d1d1f] ${compact ? "text-[12px]" : "text-[13px]"}`}>
            {metric.label}
          </dt>
          <dd className={`mt-1 leading-relaxed text-[#6e6e73] ${compact ? "text-[11px]" : "text-[12px]"}`}>
            {metric.definition}
          </dd>
          {!compact ? (
            <dd className="mt-1.5 text-[11px] font-medium text-[#b8956a]">Action: {metric.action}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function MetricGlossary() {
  return (
    <section aria-labelledby="metric-glossary" className="cf-stat-card">
      <details className="sm:hidden">
        <summary className="cursor-pointer list-none text-[13px] font-semibold tracking-tight text-[#1d1d1f]">
          Metric definitions
          <span className="ml-2 text-[11px] font-medium text-[#b8956a]">Tap to expand</span>
        </summary>
        <GlossaryList compact />
      </details>

      <div className="hidden sm:block">
        <h2 id="metric-glossary" className="text-[14px] font-semibold tracking-tight text-[#1d1d1f]">
          Metric definitions
        </h2>
        <p className="mt-1 text-[12px] text-[#86868b]">
          Data-proven analysis — every number below has a spec and a decision it drives.
        </p>
        <GlossaryList />
      </div>
    </section>
  );
}