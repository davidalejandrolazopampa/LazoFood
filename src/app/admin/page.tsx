import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function Stats() {
  const [pendingOrders, totalProducts, totalCompanies] = await Promise.all([
    prisma.order.count({ where: { status: "SUBMITTED" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.company.count({ where: { active: true } }),
  ]);

  const cards = [
    { label: "Pedidos por confirmar", value: pendingOrders, href: "/admin/pedidos", highlight: pendingOrders > 0 },
    { label: "Productos activos", value: totalProducts, href: "/admin/precios" },
    { label: "Empresas registradas", value: totalCompanies, href: "/admin/pedidos" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-colors hover:ring-brand-sage"
        >
          <p
            className={`text-3xl font-bold ${card.highlight ? "text-brand-tomato" : "text-foreground"}`}
          >
            {card.value}
          </p>
          <p className="mt-1 text-sm text-foreground/60">{card.label}</p>
        </Link>
      ))}
    </div>
  );
}

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Panel LazoFood
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Carga el precio del día y revisa los pedidos entrantes.
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
              ))}
            </div>
          }
        >
          <Stats />
        </Suspense>
      </div>
    </div>
  );
}
