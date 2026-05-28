import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you requested does not exist or may have moved."
      action={{ href: "/", label: "Return home" }}
    />
  );
}
