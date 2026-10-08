"use client";

import { useActionState } from "react";
import Image from "next/image";
import {
  saveNegotiatedPrice,
  type SaveNegotiatedPriceState,
} from "@/app/admin/clientes/actions";

const initialState: SaveNegotiatedPriceState = {};

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

export function NegotiatedPriceRow({
  companyId,
  productId,
  name,
  unit,
  imageUrl,
  dailyPrice,
  fixedPrice,
  discountPercent,
}: {
  companyId: string;
  productId: string;
  name: string;
  unit: string;
  imageUrl: string | null;
  dailyPrice: number;
  fixedPrice: number | null;
  discountPercent: number | null;
}) {
  const [state, formAction, pending] = useActionState(saveNegotiatedPrice, initialState);

  return (
    <tr className="border-b border-black/5">
      <td className="flex items-center gap-3 py-3 pr-4">
        {imageUrl && (
          <Image src={imageUrl} alt={name} width={28} height={28} className="rounded-lg bg-[#f2efe4]" />
        )}
        <span className="font-medium text-foreground">{name}</span>
      </td>
      <td className="py-3 pr-4 text-sm text-foreground/50">
        S/ {dailyPrice.toFixed(2)} / {unitLabel[unit] ?? unit.toLowerCase()}
      </td>
      <td className="py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="companyId" value={companyId} />
          <input type="hidden" name="productId" value={productId} />
          <input
            name="fixedPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Precio fijo"
            defaultValue={fixedPrice ?? ""}
            className="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-sm focus:border-brand-sage focus:outline-none"
          />
          <span className="text-xs text-foreground/40">o</span>
          <input
            name="discountPercent"
            type="number"
            step="1"
            min="0"
            max="100"
            placeholder="% desc."
            defaultValue={discountPercent ?? ""}
            className="w-20 rounded-lg border border-black/10 px-2 py-1.5 text-sm focus:border-brand-sage focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-sage px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
          >
            {pending ? "..." : "Guardar"}
          </button>
          {state.ok && <span className="text-xs text-green-700">✓</span>}
          {state.error && <span className="text-xs text-red-600">{state.error}</span>}
        </form>
      </td>
    </tr>
  );
}
