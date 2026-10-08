"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { Field } from "@/components/form-field";
import { submitOrder, type CheckoutState } from "@/app/checkout/actions";

const initialState: CheckoutState = {};

// Cliente con sesión: ya conocemos su empresa y sedes, solo elige a cuál
// sede va el pedido. Invitado: llena todo y la empresa se crea al vuelo.
export type CheckoutCustomer = {
  name: string;
  tradeName: string;
  branches: { id: string; name: string; address: string; district: string }[];
};

export function CheckoutForm({ customer }: { customer: CheckoutCustomer | null }) {
  const { lines, subtotal, ready } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitOrder, initialState);

  useEffect(() => {
    if (ready && lines.length === 0) router.replace("/carrito");
  }, [ready, lines.length, router]);

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />;
  }
  if (lines.length === 0) return null;

  const err = state.fieldErrors ?? {};

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
      <p className="mt-2 text-foreground/70">
        Tu pedido queda registrado como <strong>por confirmar</strong>. Un
        asesor valida stock y te escribe para coordinar el pago (crédito o
        contado).
      </p>
      {!customer && (
        <p className="mt-2 text-sm text-foreground/60">
          ¿Pides seguido?{" "}
          <Link href="/registro" className="font-semibold text-brand-sage hover:text-brand-tomato">
            Registra tu empresa
          </Link>{" "}
          o{" "}
          <Link href="/login" className="font-semibold text-brand-sage hover:text-brand-tomato">
            ingresa
          </Link>{" "}
          y no vuelvas a llenar estos datos.
        </p>
      )}

      {state.error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</div>
      )}

      <form action={formAction} className="mt-8 space-y-8">
        <input type="hidden" name="cartJson" value={JSON.stringify(lines)} />

        {customer ? (
          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">
              Pedido de {customer.tradeName}
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-foreground/80">Sede de entrega</span>
                <select
                  name="branchId"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:border-brand-sage focus:outline-none"
                >
                  {customer.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.address}, {b.district}
                    </option>
                  ))}
                </select>
                {err.branchId && <span className="mt-1 block text-xs text-red-600">{err.branchId}</span>}
              </label>
              <Field
                label="Fecha de entrega solicitada"
                name="requestedDate"
                type="date"
                error={err.requestedDate}
              />
              <Field label="Notas (opcional)" name="notes" error={err.notes} />
            </div>
            <p className="mt-3 text-xs text-foreground/50">
              ¿Otra dirección?{" "}
              <Link href="/mi-cuenta" className="font-semibold text-brand-sage hover:text-brand-tomato">
                Agrega una sede en Mi cuenta
              </Link>
              .
            </p>
          </fieldset>
        ) : (
          <>
            <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <legend className="px-1 text-sm font-semibold text-brand-sage">Datos de tu empresa</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Razón social" name="legalName" error={err.legalName} />
                <Field label="Nombre comercial" name="tradeName" error={err.tradeName} />
                <Field label="RUC (11 dígitos)" name="taxId" error={err.taxId} />
                <Field
                  label="Tipo de negocio"
                  name="businessType"
                  placeholder="pollería, restaurante, cevichería..."
                  error={err.businessType}
                />
                <Field
                  label="Email de facturación (opcional)"
                  name="billingEmail"
                  type="email"
                  error={err.billingEmail}
                />
              </div>
            </fieldset>

            <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <legend className="px-1 text-sm font-semibold text-brand-sage">Sede de entrega</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de la sede" name="branchName" placeholder="Ej. Sede Surco" error={err.branchName} />
                <Field label="Distrito" name="district" error={err.district} />
                <Field className="sm:col-span-2" label="Dirección" name="address" error={err.address} />
                <Field
                  label="Ventana de entrega (opcional)"
                  name="deliveryWindow"
                  placeholder="05:00-07:00"
                  error={err.deliveryWindow}
                />
                <Field
                  label="Fecha de entrega solicitada"
                  name="requestedDate"
                  type="date"
                  error={err.requestedDate}
                />
              </div>
            </fieldset>

            <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <legend className="px-1 text-sm font-semibold text-brand-sage">Contacto</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de contacto" name="contactName" error={err.contactName} />
                <Field
                  label="Teléfono (con código de país)"
                  name="contactPhone"
                  placeholder="+51999111222"
                  error={err.contactPhone}
                />
                <Field className="sm:col-span-2" label="Notas (opcional)" name="notes" error={err.notes} />
              </div>
            </fieldset>
          </>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <p className="text-sm text-foreground/60">Subtotal estimado</p>
          <p className="text-2xl font-bold text-brand-tomato">S/ {subtotal.toFixed(2)}</p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand-tomato px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-tomato-dark disabled:opacity-60"
        >
          {pending ? "Enviando pedido..." : "Confirmar pedido"}
        </button>
      </form>
    </>
  );
}
