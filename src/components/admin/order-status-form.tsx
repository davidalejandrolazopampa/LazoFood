"use client";

import { useActionState } from "react";
import { updateOrderStatus, type UpdateOrderStatusState } from "@/app/admin/pedidos/actions";

const initialState: UpdateOrderStatusState = {};

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Por confirmar" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PICKING", label: "En preparación" },
  { value: "OUT_FOR_DELIVERY", label: "En reparto" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "INVOICED", label: "Facturado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusForm({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updateOrderStatus, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-brand-sage focus:outline-none"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-sage px-4 py-2 text-sm font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Actualizar estado"}
      </button>
      {state.ok && <span className="text-sm text-green-700">✓ Guardado</span>}
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
