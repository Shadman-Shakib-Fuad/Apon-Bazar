import { redirect } from "next/navigation";
import CheckoutForm from "@/components/orders/CheckoutForm";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { shop } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Checkout</h1>
      <CheckoutForm shopId={shop ?? ""} />
    </div>
  );
}