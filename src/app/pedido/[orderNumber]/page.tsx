import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { prisma } from "@/lib/prisma";

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

function PedidoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
      <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
    </div>
  );
}

async function PedidoDetail({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      company: true,
      branch: true,
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  return (
    <>
      <ClearCartOnMount />
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-4xl">✓</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Pedido recibido
        </h1>
        <p className="mt-1 text-foreground/70">
          Número de pedido{" "}
          <span className="font-mono font-semibold text-brand-sage">
            {order.orderNumber}
          </span>
        </p>
        <p className="mt-4 text-sm text-foreground/60">
          Queda <strong>por confirmar</strong>. Un asesor de LazoFood
          validará stock y crédito, y se contactará a{" "}
          <strong>{order.branch.contactPhone}</strong> para coordinar la
          entrega.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="font-semibold text-foreground">
          {order.company.tradeName} — {order.branch.name}
        </h2>
        <p className="text-sm text-foreground/60">
          {order.branch.address}, {order.branch.district}
        </p>
        <p className="mt-1 text-sm text-foreground/60">
          Entrega solicitada:{" "}
          {order.requestedDate.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-5 divide-y divide-black/5 border-t border-black/5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="text-foreground/80">
                {item.product.name} — {Number(item.quantityOrdered)}{" "}
                {unitLabel[item.product.unit] ?? item.product.unit.toLowerCase()}
              </span>
              <span className="font-semibold text-foreground">
                S/{" "}
                {(Number(item.quantityOrdered) * Number(item.unitPriceApplied)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
          <span className="font-semibold text-foreground/80">
            Subtotal estimado
          </span>
          <span className="text-xl font-bold text-brand-tomato">
            S/ {Number(order.subtotal).toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );
}

export default function PedidoPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <Suspense fallback={<PedidoSkeleton />}>
          <PedidoDetail params={params} />
        </Suspense>

        <div className="mt-6 text-center">
          <Link
            href="/catalogo"
            className="inline-block rounded-full bg-brand-sage px-6 py-3 text-sm font-semibold text-white hover:bg-brand-tomato"
          >
            Seguir comprando
          </Link>
        </div>
      </main>
    </div>
  );
}
