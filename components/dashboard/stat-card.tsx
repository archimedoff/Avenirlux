type Props = {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  accent?: boolean;
};

export function StatCard({ label, value, hint, trend, accent }: Props) {
  return (
    <article className={`dash-stat-card ${accent ? "dash-stat-card--accent" : ""}`}>
      <p className="dash-stat-label">{label}</p>
      <p className="dash-stat-value">{value}</p>
      {(hint || trend) && (
        <p className="dash-stat-meta">
          {trend && <span className="dash-stat-trend">{trend}</span>}
          {hint}
        </p>
      )}
    </article>
  );
}
