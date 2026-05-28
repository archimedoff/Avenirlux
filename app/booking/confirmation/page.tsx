import { redirect } from "next/navigation";

type ConfirmationPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

/** Legacy route — forwards to /confirmation */
export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  redirect(`/confirmation${q.toString() ? `?${q}` : ""}`);
}
