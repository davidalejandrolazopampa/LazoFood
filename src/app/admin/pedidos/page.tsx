import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL } from "@/lib/order-status";

export const metadata: Metadata = { title: "Pedidos | Admin LazoFood" };

async function OrdersTable() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { company: true, branch: true },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-foreground/60 ring-1 ring-black/5">
        Todavía no hay pedidos. Aparecerán aquí en cuanto un cliente confirme
        su carrito en el checkout.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/40">
            <th className="p-4 font-medium">Pedido</th>
            <th className="p-4 font-medium">Cliente</th>
            <th className="p-4 font-medium">Entrega</th>
            <th className="p-4 font-medium">Subtotal</th>
            <th className="p-4 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.DRAFT;
            return (
              <tr key={order.id} className="border-b border-black/5 last:border-0">
                <td className="p-4">
                  <Link
                    href={`/admin/pedidos/${order.orderNumber}`}
                    className="font-mono font-semibold text-brand-sage hover:text-brand-tomato"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-4">
                  <p className="font-medium text-foreground">{order.company.tradeName}</p>
                  <p className="text-xs text-foreground/50">{order.branch.name}</p>
                </td>
                <td className="p-4 text-foreground/70">
                  {order.requestedDate.toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td className="p-4 font-semibold text-foreground">
                  S/ {Number(order.subtotal).toFixed(2)}
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PedidosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Pedidos
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Los 50 pedidos más recientes, de todas las empresas.
      </p>

      <div className="mt-6">
        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />}
        >
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  );
}
