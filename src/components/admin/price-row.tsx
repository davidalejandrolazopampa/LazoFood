"use client";

import { useActionState, useRef, useEffect } from "react";
import Image from "next/image";
import { updatePrice, type UpdatePriceState } from "@/app/admin/precios/actions";

const initialState: UpdatePriceState = {};

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

export function PriceRow({
  productId,
  name,
  unit,
  imageUrl,
  currentPrice,
  updatedAt,
}: {
  productId: string;
  name: string;
  unit: string;
  imageUrl: string | null;
  currentPrice: number;
  updatedAt: string;
}) {
  const [state, formAction, pending] = useActionState(updatePrice, initialState);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [state.ok]);

  return (
    <tr className="border-b border-black/5">
      <td className="flex items-center gap-3 py-3 pr-4">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            width={36}
            height={36}
            className="rounded-lg bg-[#f2efe4]"
          />
        )}
        <span className="font-medium text-foreground">{name}</span>
      </td>
      <td className="py-3 pr-4 text-sm text-foreground/60">
        {unitLabel[unit] ?? unit.toLowerCase()}
      </td>
      <td className="py-3 pr-4 font-semibold text-brand-tomato">
        S/ {currentPrice.toFixed(2)}
      </td>
      <td className="py-3 pr-4 text-xs text-foreground/40">{updatedAt}</td>
      <td className="py-3">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="productId" value={productId} />
          <input
            ref={inputRef}
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Nuevo precio"
            required
            className="w-28 rounded-lg border border-black/10 px-2 py-1.5 text-sm focus:border-brand-sage focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-sage px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
          >
            {pending ? "..." : "Actualizar"}
          </button>
        </form>
        {state.error && (
          <p className="mt-1 text-xs text-red-600">{state.error}</p>
        )}
      </td>
    </tr>
  );
}
