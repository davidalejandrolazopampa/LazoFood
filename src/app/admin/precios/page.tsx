import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PriceRow } from "@/components/admin/price-row";

export const metadata: Metadata = { title: "Precio del día | Admin LazoFood" };

async function PriceTable() {
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
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category.id}>
          <h2 className="text-lg font-bold text-brand-sage">{category.name}</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/40">
                  <th className="pb-2 pr-4 font-medium">Producto</th>
                  <th className="pb-2 pr-4 font-medium">Unidad</th>
                  <th className="pb-2 pr-4 font-medium">Precio actual</th>
                  <th className="pb-2 pr-4 font-medium">Actualizado</th>
                  <th className="pb-2 font-medium">Nuevo precio</th>
                </tr>
              </thead>
              <tbody>
                {category.products.map((product) => (
                  <PriceRow
                    key={product.id}
                    productId={product.id}
                    name={product.name}
                    unit={product.unit}
                    imageUrl={product.imageUrl}
                    currentPrice={Number(product.dailyPrices[0]?.price ?? 0)}
                    updatedAt={
                      product.dailyPrices[0]
                        ? new Date(product.dailyPrices[0].validFrom).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

export default function PreciosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Precio del día
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Cada actualización agrega un precio nuevo al historial — nunca se
        sobrescribe el anterior.
      </p>

      <div className="mt-6">
        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />}
        >
          <PriceTable />
        </Suspense>
      </div>
    </div>
  );
}
