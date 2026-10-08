import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NegotiatedPriceRow } from "@/components/admin/negotiated-price-row";

async function PriceListEditor({ companyId }: { companyId: string }) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { priceList: { include: { items: true } } },
  });
  if (!company) notFound();

  const negotiatedByProduct = new Map(
    company.priceList?.items.map((item) => [item.productId, item]) ?? []
  );

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: { dailyPrices: { orderBy: { validFrom: "desc" }, take: 1 } },
      },
    },
  });

  return (
    <div>
      <Link href="/admin/clientes" className="text-sm font-medium text-brand-sage hover:text-brand-tomato">
        ← Todos los clientes
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        {company.tradeName}
      </h1>
      <p className="text-sm text-foreground/60">
        RUC {company.taxId} · Lista negociada: {negotiatedByProduct.size} de{" "}
        {categories.reduce((sum, c) => sum + c.products.length, 0)} productos
      </p>
      <p className="mt-2 text-xs text-foreground/50">
        Define un <strong>precio fijo</strong> (ignora el precio del día) o
        un <strong>% de descuento</strong> (se aplica sobre el precio del
        día vigente). Dejar ambos vacíos y guardar quita la condición
        pactada para ese producto.
      </p>

      <div className="mt-6 space-y-10">
        {categories
          .filter((c) => c.products.length > 0)
          .map((category) => (
            <section key={category.id}>
              <h2 className="text-lg font-bold text-brand-sage">{category.name}</h2>
              <div className="mt-3 overflow-x-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/40">
                      <th className="pb-2 pr-4 font-medium">Producto</th>
                      <th className="pb-2 pr-4 font-medium">Precio del día</th>
                      <th className="pb-2 font-medium">Condición pactada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.products.map((product) => {
                      const negotiated = negotiatedByProduct.get(product.id);
                      return (
                        <NegotiatedPriceRow
                          key={product.id}
                          companyId={company.id}
                          productId={product.id}
                          name={product.name}
                          unit={product.unit}
                          imageUrl={product.imageUrl}
                          dailyPrice={Number(product.dailyPrices[0]?.price ?? 0)}
                          fixedPrice={negotiated?.fixedPrice ? Number(negotiated.fixedPrice) : null}
                          discountPercent={
                            negotiated?.discountPercent ? Number(negotiated.discountPercent) : null
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}

export default function CompanyPriceListPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />}
    >
      <PriceListEditorResolver params={params} />
    </Suspense>
  );
}

async function PriceListEditorResolver({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <PriceListEditor companyId={companyId} />;
}
