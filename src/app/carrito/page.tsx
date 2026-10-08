"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/components/cart/cart-context";

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

export default function CarritoPage() {
  const { lines, updateQuantity, removeLine, subtotal } = useCart();

  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tu carrito
        </h1>

        {lines.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
            <p className="text-foreground/70">Tu carrito está vacío.</p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block rounded-full bg-brand-sage px-6 py-3 text-sm font-semibold text-white hover:bg-brand-tomato"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 divide-y divide-black/5 rounded-2xl bg-white ring-1 ring-black/5">
              {lines.map((line) => (
                <div
                  key={line.productId}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-semibold text-foreground">{line.name}</p>
                    <p className="text-sm text-foreground/50">
                      S/ {line.price.toFixed(2)} /{" "}
                      {unitLabel[line.unit] ?? line.unit.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      step={line.unit === "KG" ? 0.5 : 1}
                      value={line.quantity}
                      onChange={(e) =>
                        updateQuantity(line.productId, Number(e.target.value))
                      }
                      className="w-20 rounded-lg border border-black/10 px-2 py-1.5 text-right tabular-nums"
                    />
                    <p className="w-24 text-right font-semibold text-foreground">
                      S/ {(line.price * line.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLine(line.productId)}
                      aria-label={`Quitar ${line.name}`}
                      className="text-foreground/40 hover:text-brand-tomato"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <p className="text-sm text-foreground/60">
                Subtotal estimado — el monto final se ajusta al peso real
                entregado
              </p>
              <p className="text-2xl font-bold text-brand-tomato">
                S/ {subtotal.toFixed(2)}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Link
                href="/catalogo"
                className="rounded-full border border-brand-sage/30 px-6 py-3 text-sm font-semibold text-brand-sage hover:bg-brand-sage/10"
              >
                Seguir comprando
              </Link>
              <Link
                href="/checkout"
                className="rounded-full bg-brand-tomato px-6 py-3 text-sm font-semibold text-white hover:bg-brand-tomato-dark"
              >
                Continuar al checkout
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
