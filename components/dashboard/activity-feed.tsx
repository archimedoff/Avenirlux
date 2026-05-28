import { formatCurrency } from "@/lib/dashboard/format";

type Item = { id: string; label: string; amount: number; at: string };

export function ActivityFeed({ items }: { items: Item[] }) {
  return (
    <ul className="dash-activity">
      {items.map((item) => (
        <li key={item.id} className="dash-activity-item">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.label}</p>
            <p className="text-xs text-[var(--foreground-subtle)]">{new Date(item.at).toLocaleDateString()}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatCurrency(item.amount)}</p>
        </li>
      ))}
    </ul>
  );
}
