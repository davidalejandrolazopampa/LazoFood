import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { DeliveryWeightsForm } from "@/components/admin/delivery-weights-form";

async function OrderDetail({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      company: { include: { creditAccount: true } },
      branch: true,
      createdBy: true,
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-foreground/60">
              {order.company.tradeName} — {order.branch.name}
            </p>
          </div>
          <OrderStatusForm orderNumber={order.orderNumber} currentStatus={order.status} />
        </div>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-foreground/70">Entrega</p>
            <p className="text-foreground/60">
              {order.branch.address}, {order.branch.district}
            </p>
            <p className="text-foreground/60">
              Fecha solicitada:{" "}
              {order.requestedDate.toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            {order.branch.deliveryWindow && (
              <p className="text-foreground/60">Ventana: {order.branch.deliveryWindow}</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground/70">Contacto</p>
            <p className="text-foreground/60">{order.createdBy.name}</p>
            <p className="text-foreground/60">{order.branch.contactPhone}</p>
            <p className="mt-2 font-semibold text-foreground/70">RUC</p>
            <p className="text-foreground/60">{order.company.taxId}</p>
          </div>
        </div>

        {order.company.creditAccount && (
          <div className="mt-4 rounded-xl bg-brand-sage/10 p-3 text-sm text-brand-sage">
            Línea de crédito: S/ {Number(order.company.creditAccount.creditLimit).toFixed(2)} ·{" "}
            {order.company.creditAccount.paymentTermDays} días ·{" "}
            {order.company.creditAccount.onHold ? "⚠ bloqueado por mora" : "al día"}
          </div>
        )}

        {order.notes && (
          <p className="mt-4 rounded-xl bg-black/[0.03] p-3 text-sm text-foreground/70">
            <strong>Notas:</strong> {order.notes}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="font-semibold text-foreground">Peso / cantidad real al despacho</h2>
        <p className="mt-1 text-xs text-foreground/50">
          El producto se pesa recién al empacar — el subtotal se calcula
          sobre lo entregado, no sobre lo pedido.
        </p>
        <div className="mt-4">
          <DeliveryWeightsForm
            orderNumber={order.orderNumber}
            items={order.items.map((item) => ({
              id: item.id,
              quantityOrdered: Number(item.quantityOrdered),
              quantityDelivered:
                item.quantityDelivered !== null ? Number(item.quantityDelivered) : null,
              unitPriceApplied: Number(item.unitPriceApplied),
              product: {
                name: item.product.name,
                unit: item.product.unit,
                imageUrl: item.product.imageUrl,
              },
            }))}
          />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
          <span className="font-semibold text-foreground/80">Subtotal</span>
          <span className="text-xl font-bold text-brand-tomato">
            S/ {Number(order.subtotal).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return (
    <div>
      <Link
        href="/admin/pedidos"
        className="text-sm font-medium text-brand-sage hover:text-brand-tomato"
      >
        ← Todos los pedidos
      </Link>
      <div className="mt-4">
        <Suspense
          fallback={<div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />}
        >
          <OrderDetail params={params} />
        </Suspense>
      </div>
    </div>
  );
}
