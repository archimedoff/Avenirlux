"use client";

import type { AnalyticsPoint } from "@/lib/dashboard/analytics";

type Props = { data: AnalyticsPoint[]; height?: number; formatValue?: (n: number) => string };

export function BarChart({ data, height = 160, formatValue }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue ?? ((n: number) => String(n));

  return (
    <div className="dash-chart" style={{ height }}>
      <div className="dash-chart-bars" style={{ height: height - 28 }}>
        {data.map((point) => (
          <div key={point.label} className="dash-chart-bar-col">
            <div
              className="dash-chart-bar"
              style={{ height: `${(point.value / max) * 100}%` }}
              title={`${point.label}: ${fmt(point.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="dash-chart-labels">
        {data.map((point) => (
          <span key={point.label} className="dash-chart-label">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
