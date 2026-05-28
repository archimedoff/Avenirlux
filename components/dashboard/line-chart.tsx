"use client";

import type { AnalyticsPoint } from "@/lib/dashboard/analytics";

type Props = { data: AnalyticsPoint[]; height?: number };

export function LineChart({ data, height = 140 }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 100;
  const h = 60;
  const points = data.map((d, i) => {
    const x = data.length <= 1 ? w / 2 : (i / (data.length - 1)) * w;
    const y = h - (d.value / max) * h;
    return `${x},${y}`;
  });
  const area = `0,${h} ${points.join(" ")} ${w},${h}`;

  return (
    <div className="dash-line-chart" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="dash-line-chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dashLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(9,9,11,0.12)" />
            <stop offset="100%" stopColor="rgba(9,9,11,0)" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#dashLineFill)" />
        <polyline points={points.join(" ")} fill="none" stroke="var(--luxury-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dash-chart-labels">
        {data.filter((_, i) => i % 2 === 0).map((point) => (
          <span key={point.label} className="dash-chart-label">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
