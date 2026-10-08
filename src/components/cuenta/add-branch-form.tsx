"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field } from "@/components/form-field";
import { addBranch, type AddBranchState } from "@/app/mi-cuenta/actions";

const initialState: AddBranchState = {};

export function AddBranchForm() {
  const [state, formAction, pending] = useActionState(addBranch, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const err = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre de la sede" name="name" placeholder="Ej. Sede Miraflores" error={err.name} />
        <Field label="Distrito" name="district" error={err.district} />
        <Field className="sm:col-span-2" label="Dirección" name="address" error={err.address} />
        <Field label="Contacto en la sede" name="contactName" error={err.contactName} />
        <Field
          label="Teléfono del contacto"
          name="contactPhone"
          placeholder="+51999111222"
          error={err.contactPhone}
        />
        <Field
          label="Ventana de entrega (opcional)"
          name="deliveryWindow"
          placeholder="05:00-07:00"
          error={err.deliveryWindow}
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Sede agregada.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-sage px-5 py-2 text-sm font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Agregar sede"}
      </button>
    </form>
  );
}
