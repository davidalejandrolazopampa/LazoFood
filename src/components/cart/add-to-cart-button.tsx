"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";

export function AddToCartButton({
  productId,
  name,
  unit,
  price,
  minOrderQty,
}: {
  productId: string;
  name: string;
  unit: string;
  price: number;
  minOrderQty: number;
}) {
  const { addLine } = useCart();
  const [qty, setQty] = useState(minOrderQty);
  const [justAdded, setJustAdded] = useState(false);

  const step = unit === "KG" ? 0.5 : 1;

  function handleAdd() {
    addLine({ productId, name, unit, price }, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-full border border-black/10">
        <button
          type="button"
          aria-label="Reducir cantidad"
          className="px-3 py-1.5 text-foreground/60 hover:text-brand-tomato"
          onClick={() => setQty((q) => Math.max(minOrderQty, round2(q - step)))}
        >
          −
        </button>
        <span className="min-w-10 text-center text-sm tabular-nums">{qty}</span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          className="px-3 py-1.5 text-foreground/60 hover:text-brand-tomato"
          onClick={() => setQty((q) => round2(q + step))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-brand-sage px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-tomato"
      >
        {justAdded ? "Agregado ✓" : "Agregar"}
      </button>
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
