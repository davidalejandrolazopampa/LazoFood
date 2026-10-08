"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Field } from "@/components/form-field";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(register, initialState);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Registra tu empresa
        </h1>
        <p className="mt-2 text-foreground/70">
          Con una cuenta ves tu lista de precios negociada, pides a cualquiera
          de tus sedes sin volver a llenar datos y sigues tus pedidos. ¿Ya
          tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand-sage hover:text-brand-tomato">
            Ingresa
          </Link>
          .
        </p>

        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Demo de portafolio: usa datos inventados. Cualquier RUC de 11
          dígitos sirve (no se consulta a SUNAT).
        </p>

        {state.error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</div>
        )}

        <form action={formAction} className="mt-8 space-y-8">
          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">Empresa</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Razón social" name="legalName" defaultValue={v.legalName} error={err.legalName} />
              <Field label="Nombre comercial" name="tradeName" defaultValue={v.tradeName} error={err.tradeName} />
              <Field label="RUC (11 dígitos)" name="taxId" defaultValue={v.taxId} error={err.taxId} />
              <Field
                label="Tipo de negocio"
                name="businessType"
                placeholder="pollería, restaurante, cevichería..."
                defaultValue={v.businessType}
                error={err.businessType}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">Primera sede de entrega</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre de la sede"
                name="branchName"
                placeholder="Ej. Sede Surco"
                defaultValue={v.branchName}
                error={err.branchName}
              />
              <Field label="Distrito" name="district" defaultValue={v.district} error={err.district} />
              <Field
                className="sm:col-span-2"
                label="Dirección"
                name="address"
                defaultValue={v.address}
                error={err.address}
              />
              <Field
                label="Ventana de entrega (opcional)"
                name="deliveryWindow"
                placeholder="05:00-07:00"
                defaultValue={v.deliveryWindow}
                error={err.deliveryWindow}
              />
            </div>
            <p className="mt-3 text-xs text-foreground/50">
              Puedes agregar más sedes después desde &quot;Mi cuenta&quot;.
            </p>
          </fieldset>

          <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <legend className="px-1 text-sm font-semibold text-brand-sage">Tu usuario</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Tu nombre" name="ownerName" defaultValue={v.ownerName} error={err.ownerName} />
              <Field
                label="Teléfono (con código de país)"
                name="phone"
                placeholder="+51999111222"
                defaultValue={v.phone}
                error={err.phone}
              />
              <Field
                className="sm:col-span-2"
                label="Correo (para ingresar y recibir facturas)"
                name="email"
                type="email"
                defaultValue={v.email}
                error={err.email}
              />
              <Field label="Contraseña" name="password" type="password" error={err.password} />
              <Field
                label="Repite la contraseña"
                name="passwordConfirm"
                type="password"
                error={err.passwordConfirm}
              />
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-brand-tomato px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-tomato-dark disabled:opacity-60"
          >
            {pending ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </main>
    </div>
  );
}
