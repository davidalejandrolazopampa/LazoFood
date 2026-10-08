"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/components/cart/cart-context";
import { submitOrder, type CheckoutState } from "./actions";

const initialState: CheckoutState = {};

export default function CheckoutPage() {
  const { lines, subtotal } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitOrder, initialState);

  useEffect(() => {
    if (lines.length === 0) router.replace("/carrito");
  }, [lines.length, router]);

  if (lines.length === 0) return null;

  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Checkout
        </h1>
        <p className="mt-2 text-foreground/70">
          Tu pedido queda registrado como <strong>por confirmar</strong>. Un
          asesor valida stock y te escribe para coordinar el pago (crédito o
          contado).
        </p>

        {state.error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-8">
          <input type="hidden" name="cartJson" value={JSON.stringify(lines)} />

          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">
              Datos de tu empresa
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Razón social"
                name="legalName"
                error={state.fieldErrors?.legalName}
              />
              <Field
                label="Nombre comercial"
                name="tradeName"
                error={state.fieldErrors?.tradeName}
              />
              <Field
                label="RUC (11 dígitos)"
                name="taxId"
                error={state.fieldErrors?.taxId}
              />
              <Field
                label="Tipo de negocio"
                name="businessType"
                placeholder="pollería, restaurante, cevichería..."
                error={state.fieldErrors?.businessType}
              />
              <Field
                label="Email de facturación (opcional)"
                name="billingEmail"
                type="email"
                error={state.fieldErrors?.billingEmail}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">
              Sede de entrega
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre de la sede"
                name="branchName"
                placeholder="Ej. Sede Surco"
                error={state.fieldErrors?.branchName}
              />
              <Field
                label="Distrito"
                name="district"
                error={state.fieldErrors?.district}
              />
              <Field
                className="sm:col-span-2"
                label="Dirección"
                name="address"
                error={state.fieldErrors?.address}
              />
              <Field
                label="Ventana de entrega (opcional)"
                name="deliveryWindow"
                placeholder="05:00-07:00"
                error={state.fieldErrors?.deliveryWindow}
              />
              <Field
                label="Fecha de entrega solicitada"
                name="requestedDate"
                type="date"
                error={state.fieldErrors?.requestedDate}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">
              Contacto
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre de contacto"
                name="contactName"
                error={state.fieldErrors?.contactName}
              />
              <Field
                label="Teléfono (con código de país)"
                name="contactPhone"
                placeholder="+51999111222"
                error={state.fieldErrors?.contactPhone}
              />
              <Field
                className="sm:col-span-2"
                label="Notas (opcional)"
                name="notes"
                error={state.fieldErrors?.notes}
              />
            </div>
          </fieldset>

          <div className="flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <p className="text-sm text-foreground/60">Subtotal estimado</p>
            <p className="text-2xl font-bold text-brand-tomato">
              S/ {subtotal.toFixed(2)}
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-brand-tomato px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-tomato-dark disabled:opacity-60"
          >
            {pending ? "Enviando pedido..." : "Confirmar pedido"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-foreground/80">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-brand-sage focus:outline-none"
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
