import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AddBranchForm } from "@/components/cuenta/add-branch-form";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";
import { STATUS_LABEL } from "@/lib/order-status";
import { customerLogout } from "./actions";

export const metadata: Metadata = { title: "Mi cuenta | LazoFood" };

function AccountSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
      <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
    </div>
  );
}

async function AccountContent({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const { bienvenida } = await searchParams;
  const { company } = customer;
  const orders = await prisma.order.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { branch: true },
  });

  return (
    <div className="space-y-8">
      {bienvenida && (
        <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
          ¡Cuenta creada! Ya puedes{" "}
          <Link href="/catalogo" className="font-semibold underline">
            hacer tu primer pedido
          </Link>
          . En la vida real, un asesor revisaría tu RUC y te asignaría línea
          de crédito y precios negociados.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.tradeName}</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {company.legalName} · RUC {company.taxId}
            {company.businessType && ` · ${company.businessType}`}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Hola, {customer.name} ({customer.email})
          </p>
        </div>
        <form action={customerLogout}>
          <button type="submit" className="text-sm text-foreground/50 hover:text-brand-tomato">
            Cerrar sesión
          </button>
        </form>
      </div>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-sage">Crédito</h2>
        {company.creditAccount ? (
          <p className="mt-2 text-sm text-foreground/80">
            Línea de S/ {Number(company.creditAccount.creditLimit).toFixed(2)} a{" "}
            {company.creditAccount.paymentTermDays} días · Deuda vigente S/{" "}
            {Number(company.creditAccount.currentBalance).toFixed(2)} ·{" "}
            {company.creditAccount.onHold ? (
              <span className="font-semibold text-red-600">bloqueada por mora</span>
            ) : (
              <span className="font-semibold text-green-700">al día</span>
            )}
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground/60">
            Sin línea de crédito asignada todavía — tus pedidos se coordinan
            al contado hasta que un asesor la apruebe.
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-sage">Mis pedidos</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/60">
            Aún no tienes pedidos.{" "}
            <Link href="/catalogo" className="font-semibold text-brand-sage hover:text-brand-tomato">
              Ir al catálogo
            </Link>
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/40">
                  <th className="pb-2 pr-4 font-medium">Pedido</th>
                  <th className="pb-2 pr-4 font-medium">Sede</th>
                  <th className="pb-2 pr-4 font-medium">Entrega</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const status = STATUS_LABEL[o.status];
                  return (
                    <tr key={o.id} className="border-b border-black/5 last:border-0">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/pedido/${o.orderNumber}`}
                          className="font-mono font-semibold text-brand-sage hover:text-brand-tomato"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{o.branch.name}</td>
                      <td className="py-2 pr-4">{o.requestedDate.toISOString().slice(0, 10)}</td>
                      <td className="py-2 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status?.className}`}>
                          {status?.label ?? o.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">S/ {Number(o.subtotal).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-sage">
          Sedes de entrega ({company.branches.length})
        </h2>
        <ul className="mt-3 divide-y divide-black/5">
          {company.branches.map((b) => (
            <li key={b.id} className="py-2 text-sm">
              <p className="font-semibold text-foreground">{b.name}</p>
              <p className="text-foreground/60">
                {b.address}, {b.district}
                {b.deliveryWindow && ` · entrega ${b.deliveryWindow}`}
                {b.contactName && ` · ${b.contactName}`}
                {b.contactPhone && ` ${b.contactPhone}`}
              </p>
            </li>
          ))}
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand-sage hover:text-brand-tomato">
            + Agregar otra sede
          </summary>
          <div className="mt-4">
            <AddBranchForm />
          </div>
        </details>
      </section>
    </div>
  );
}

export default function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string }>;
}) {
  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <Suspense fallback={<AccountSkeleton />}>
          <AccountContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
