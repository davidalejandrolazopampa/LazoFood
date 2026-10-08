import { Suspense } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import {
  CustomerIdentityForm,
  CustomerIdentityBadge,
} from "@/components/catalogo/customer-identity";
import { prisma } from "@/lib/prisma";
import { resolvePrice, CUSTOMER_COOKIE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Catálogo | LazoFood",
};

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

async function getIdentifiedCompany() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!companyId) return null;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { priceList: { include: { items: true } } },
  });
  return company;
}

async function getCatalog() {
  try {
    const [categories, company] = await Promise.all([
      prisma.category.findMany({
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
      }),
      getIdentifiedCompany(),
    ]);

    const negotiatedByProduct = new Map(
      company?.priceList?.items.map((item) => [item.productId, item]) ?? []
    );

    return { categories, live: true as const, company, negotiatedByProduct };
  } catch {
    return {
      categories: [],
      live: false as const,
      company: null,
      negotiatedByProduct: new Map(),
    };
  }
}

function CatalogSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
      ))}
    </div>
  );
}

async function CatalogContent() {
  const { categories, live, company, negotiatedByProduct } = await getCatalog();

  return (
    <>
      <div className="mt-4">
        {company ? (
          <CustomerIdentityBadge tradeName={company.tradeName} />
        ) : (
          <CustomerIdentityForm />
        )}
      </div>

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
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {category.products.map((product) => {
                  const dailyPrice = Number(product.dailyPrices[0]?.price ?? 0);
                  const negotiated = negotiatedByProduct.get(product.id);
                  const price = resolvePrice(
                    dailyPrice,
                    negotiated
                      ? {
                          fixedPrice: negotiated.fixedPrice ? Number(negotiated.fixedPrice) : null,
                          discountPercent: negotiated.discountPercent
                            ? Number(negotiated.discountPercent)
                            : null,
                        }
                      : null
                  );
                  const hasDiscount = price !== dailyPrice;
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                    >
                      <div className="flex h-20 w-full items-center justify-center bg-[#f2efe4]">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-contain"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {product.name}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-foreground/40 line-through">
                              S/ {dailyPrice.toFixed(2)}
                            </p>
                          )}
                          <p className="mt-0.5 text-base font-bold text-brand-tomato">
                            S/ {price.toFixed(2)}
                            <span className="ml-1 text-xs font-normal text-foreground/50">
                              / {unitLabel[product.unit] ?? product.unit.toLowerCase()}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2">
                          <AddToCartButton
                            productId={product.id}
                            name={product.name}
                            unit={product.unit}
                            price={price}
                            minOrderQty={Number(product.minOrderQty)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </>
  );
}

export default function CatalogoPage() {
  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Catálogo — precio del día
        </h1>
        <p className="mt-2 text-foreground/70">
          Los precios mostrados son la lista general. Ingresa tu RUC si ya
          eres cliente para ver tu lista negociada.
        </p>

        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogContent />
        </Suspense>
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
