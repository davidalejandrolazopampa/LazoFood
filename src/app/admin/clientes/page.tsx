import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Clientes | Admin LazoFood" };

async function CompaniesTable() {
  const companies = await prisma.company.findMany({
    orderBy: { tradeName: "asc" },
    include: {
      creditAccount: true,
      priceList: { include: { _count: { select: { items: true } } } },
      _count: { select: { orders: true } },
    },
  });

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-foreground/60 ring-1 ring-black/5">
        Todavía no hay empresas registradas. Aparecen automáticamente cuando
        alguien completa el checkout.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/40">
            <th className="p-4 font-medium">Empresa</th>
            <th className="p-4 font-medium">RUC</th>
            <th className="p-4 font-medium">Crédito</th>
            <th className="p-4 font-medium">Pedidos</th>
            <th className="p-4 font-medium">Precios negociados</th>
            <th className="p-4" />
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id} className="border-b border-black/5 last:border-0">
              <td className="p-4 font-medium text-foreground">{c.tradeName}</td>
              <td className="p-4 font-mono text-foreground/60">{c.taxId}</td>
              <td className="p-4 text-foreground/60">
                {c.creditAccount
                  ? `S/ ${Number(c.creditAccount.creditLimit).toFixed(0)} · ${c.creditAccount.paymentTermDays}d`
                  : "—"}
              </td>
              <td className="p-4 text-foreground/60">{c._count.orders}</td>
              <td className="p-4 text-foreground/60">
                {c.priceList?._count.items ?? 0} productos
              </td>
              <td className="p-4 text-right">
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="font-semibold text-brand-sage hover:text-brand-tomato"
                >
                  Editar precios →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Clientes
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Define precios fijos o descuentos por cliente. Un cliente ingresa su
        RUC en el catálogo público para verlos.
      </p>

      <div className="mt-6">
        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />}
        >
          <CompaniesTable />
        </Suspense>
      </div>
    </div>
  );
}
