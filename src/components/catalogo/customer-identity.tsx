"use client";

import { useActionState } from "react";
import {
  identifyCompany,
  clearIdentifiedCompany,
  type IdentifyState,
} from "@/app/catalogo/customer-actions";

const initialState: IdentifyState = {};

export function CustomerIdentityForm() {
  const [state, formAction, pending] = useActionState(identifyCompany, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        name="taxId"
        placeholder="Tu RUC (11 dígitos)"
        maxLength={11}
        className="w-48 rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-brand-sage focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-sage px-4 py-2 text-sm font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
      >
        {pending ? "Buscando..." : "Ver mi lista de precios"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}

export function CustomerIdentityBadge({ tradeName }: { tradeName: string }) {
  return (
    <form action={clearIdentifiedCompany} className="flex items-center gap-3 text-sm">
      <span className="rounded-full bg-brand-sage/10 px-3 py-1.5 font-medium text-brand-sage">
        Precios de {tradeName}
      </span>
      <button type="submit" className="text-foreground/50 hover:text-brand-tomato">
        Salir
      </button>
    </form>
  );
}
