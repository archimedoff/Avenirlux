import { formatUsd } from "@/lib/booking-utils";

export { formatUsd };

export function formatCurrency(n: number) {
  return formatUsd(n);
}

export function formatPercent(n: number) {
  return `${Math.round(n)}%`;
}
