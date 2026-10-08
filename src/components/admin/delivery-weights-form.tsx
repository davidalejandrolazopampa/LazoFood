"use client";

import { useActionState } from "react";
import Image from "next/image";
import {
  saveDeliveredQuantities,
  type SaveDeliveredState,
} from "@/app/admin/pedidos/actions";

const initialState: SaveDeliveredState = {};

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

type Item = {
  id: string;
  quantityOrdered: number;
  quantityDelivered: number | null;
  unitPriceApplied: number;
  product: { name: string; unit: string; imageUrl: string | null };
};

export function DeliveryWeightsForm({
  orderNumber,
  items,
}: {
  orderNumber: string;
  items: Item[];
}) {
  const [state, formAction, pending] = useActionState(saveDeliveredQuantities, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <div className="divide-y divide-black/5">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 py-3">
            {item.product.imageUrl && (
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                width={32}
                height={32}
                className="rounded-lg bg-[#f2efe4]"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.product.name}
              </p>
              <p className="text-xs text-foreground/50">
                Pedido: {item.quantityOrdered}{" "}
                {unitLabel[item.product.unit] ?? item.product.unit.toLowerCase()} · S/{" "}
                {item.unitPriceApplied.toFixed(2)} c/u
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-foreground/60">Entregado</span>
              <input
                name={`qty_${item.id}`}
                type="number"
                min="0"
                step={item.product.unit === "KG" ? 0.1 : 1}
                defaultValue={item.quantityDelivered ?? item.quantityOrdered}
                className="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-right tabular-nums focus:border-brand-sage focus:outline-none"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-sage px-4 py-2 text-sm font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar peso real y recalcular subtotal"}
        </button>
        {state.ok && <span className="text-sm text-green-700">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
