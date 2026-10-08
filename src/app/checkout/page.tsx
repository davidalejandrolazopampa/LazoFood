import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentCustomer } from "@/lib/customer-session";

async function CheckoutWithSession() {
  const customer = await getCurrentCustomer();
  return (
    <CheckoutForm
      customer={
        customer && customer.company.branches.length > 0
          ? {
              name: customer.name,
              tradeName: customer.company.tradeName,
              branches: customer.company.branches.map((b) => ({
                id: b.id,
                name: b.name,
                address: b.address,
                district: b.district,
              })),
            }
          : null
      }
    />
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />}>
          <CheckoutWithSession />
        </Suspense>
      </main>
    </div>
  );
}
