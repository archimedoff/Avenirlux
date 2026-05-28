import { redirect } from "next/navigation";

type BookingPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

/** Legacy route — forwards to /checkout */
export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  redirect(`/checkout${q.toString() ? `?${q}` : ""}`);
}
