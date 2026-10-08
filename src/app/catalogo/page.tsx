import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Catálogo | LazoFood",
};

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

async function getCatalog() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        products: {
          where: { active: true },
          orderBy: { name: "asc" },
          include: {
            dailyPrices: { orderBy: { validFrom: "desc" }, take: 1 },
          },
        },
      },
    });
    return { categories, live: true as const };
  } catch {
    return { categories: [], live: false as const };
  }
}

export default async function CatalogoPage() {
  const { categories, live } = await getCatalog();

  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Catálogo — precio del día
        </h1>
        <p className="mt-2 text-foreground/70">
          Los precios mostrados son la lista general. Al activar tu cuenta,
          verás tu lista negociada.
        </p>

        {!live && (
          <div className="mt-6 rounded-2xl bg-amber-100 p-4 text-sm text-amber-800">
            No hay conexión a la base de datos todavía (
            <code className="font-mono">DATABASE_URL</code>). Levanta Postgres
            y corre <code className="font-mono">npm run db:seed</code> para
            ver el catálogo real.
          </div>
        )}

        {live && categories.every((c) => c.products.length === 0) && (
          <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-foreground/70 ring-1 ring-black/5">
            Todavía no hay productos cargados. Corre{" "}
            <code className="font-mono">npm run db:seed</code> para cargar el
            catálogo de ejemplo.
          </div>
        )}

        <div className="mt-10 space-y-14">
          {categories
            .filter((c) => c.products.length > 0)
            .map((category) => (
              <section key={category.id}>
                <h2 className="text-xl font-bold text-brand-sage">
                  {category.name}
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {category.products.map((product) => {
                    const price = Number(product.dailyPrices[0]?.price ?? 0);
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {product.name}
                          </p>
                          <p className="mt-1 text-2xl font-bold text-brand-tomato">
                            S/ {price.toFixed(2)}
                            <span className="ml-1 text-sm font-normal text-foreground/50">
                              / {unitLabel[product.unit] ?? product.unit.toLowerCase()}
                            </span>
                          </p>
                        </div>
                        <div className="mt-4">
                          <AddToCartButton
                            productId={product.id}
                            name={product.name}
                            unit={product.unit}
                            price={price}
                            minOrderQty={Number(product.minOrderQty)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      </main>

      <footer className="border-t border-black/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-foreground/50">
          <Image src="/brand/logo.svg" alt="LazoFood" width={90} height={49} />
          <p>© 2026 LazoFood. Lima, Perú.</p>
        </div>
      </footer>
    </div>
  );
}
