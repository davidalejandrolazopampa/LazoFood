import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

type CatalogPreviewItem = {
  id: string;
  name: string;
  unit: string;
  price: number;
  imageUrl: string | null;
};

const unitLabel: Record<string, string> = {
  KG: "kg",
  UNIT: "und",
  CRATE: "jaba",
  SACK: "saco",
};

// Vista previa estática: se usa solo si todavía no hay una base de datos
// conectada (DATABASE_URL), para que la landing no se caiga en desarrollo.
const FALLBACK_PREVIEW: CatalogPreviewItem[] = [
  { id: "p1", name: "Tomate", unit: "KG", price: 2.8, imageUrl: "/products/VER-001.svg" },
  { id: "p2", name: "Limón", unit: "KG", price: 3.5, imageUrl: "/products/FRU-001.svg" },
  { id: "p3", name: "Palta Hass", unit: "KG", price: 7.5, imageUrl: "/products/FRU-012.svg" },
  { id: "p4", name: "Papa blanca", unit: "SACK", price: 45.0, imageUrl: "/products/TUB-001.svg" },
];

async function getCatalogPreview(): Promise<{
  items: CatalogPreviewItem[];
  live: boolean;
}> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      take: 4,
      orderBy: { createdAt: "asc" },
      include: {
        dailyPrices: {
          orderBy: { validFrom: "desc" },
          take: 1,
        },
      },
    });

    if (products.length === 0) {
      return { items: FALLBACK_PREVIEW, live: false };
    }

    return {
      items: products.map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        price: Number(p.dailyPrices[0]?.price ?? 0),
        imageUrl: p.imageUrl,
      })),
      live: true,
    };
  } catch {
    // Sin base de datos conectada todavía: mostramos la vista previa.
    return { items: FALLBACK_PREVIEW, live: false };
  }
}

const features = [
  {
    title: "Precio del día",
    description:
      "Lista de precios que se actualiza a diario según mercado, con historial completo para auditoría.",
  },
  {
    title: "Listas negociadas",
    description:
      "Condiciones pactadas por empresa cliente: descuentos o precios fijos, independientes del precio del día.",
  },
  {
    title: "Crédito a 15/30 días",
    description:
      "Línea de crédito por empresa, estado de cuenta y bloqueo automático por mora.",
  },
  {
    title: "Peso real al despacho",
    description:
      "El pedido se ajusta al peso entregado, no al solicitado: la factura refleja lo que realmente llegó.",
  },
  {
    title: "Rutas por zona",
    description:
      "Pedidos agrupados por zona de reparto con corte horario y ventana de entrega por sede.",
  },
  {
    title: "Pedido recurrente",
    description:
      "Plantillas y \"repetir último pedido\" para la compra semanal que ya conoces.",
  },
];

function CatalogSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-black/5"
        />
      ))}
    </div>
  );
}

async function CatalogGrid() {
  const { items, live } = await getCatalogPreview();

  return (
    <>
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Precio del día
        </h2>
        {!live && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Vista previa — conecta DATABASE_URL para datos reales
          </span>
        )}
      </div>
      <Link
        href="/catalogo"
        className="mt-1 inline-block text-sm font-semibold text-brand-sage hover:text-brand-tomato"
      >
        Ver catálogo completo →
      </Link>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
          >
            <div className="aspect-square w-full bg-[#f2efe4]">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={240}
                  height={240}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-5">
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="mt-1 text-2xl font-bold text-brand-tomato">
                S/ {item.price.toFixed(2)}
                <span className="ml-1 text-sm font-normal text-foreground/50">
                  / {unitLabel[item.unit] ?? item.unit.toLowerCase()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-brand-sage/10 px-4 py-1 text-xs font-semibold tracking-wide text-brand-sage uppercase">
                Abastecimiento B2B
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Verduras, frutas y tubérculos frescos para tu pollería o
                restaurante
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-7 text-foreground/70">
                Pedidos recurrentes, precios negociados por cadena y crédito a
                15 o 30 días. Sin intermediarios, con la frescura del mercado
                mayorista directo a tu cocina.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="#contacto"
                  className="rounded-full bg-brand-tomato px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-tomato-dark"
                >
                  Quiero ser cliente
                </Link>
                <Link
                  href="/catalogo"
                  className="rounded-full border border-brand-sage/30 px-6 py-3 text-sm font-semibold text-brand-sage transition-colors hover:bg-brand-sage/10"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-semibold text-brand-sage">
                Hecho para tu operación diaria
              </p>
              <ul className="mt-4 space-y-3 text-sm text-foreground/70">
                <li>✓ Corte de pedido antes de las 6:00 p.m.</li>
                <li>✓ Entrega en ventana horaria por sede</li>
                <li>✓ Factura electrónica automática</li>
                <li>✓ Estado de cuenta y línea de crédito visible siempre</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="como-funciona" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
              Diseñado para el ritmo de un restaurante, no de un supermercado
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-black/5 p-6">
                  <h3 className="font-semibold text-brand-sage">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground/70">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Catálogo preview */}
        <section id="catalogo" className="mx-auto max-w-6xl px-6 py-20">
          <Suspense fallback={<CatalogSkeleton />}>
            <CatalogGrid />
          </Suspense>
        </section>

        {/* CTA / contacto */}
        <section id="contacto" className="bg-brand-sage py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              ¿Tu cadena ya compra verduras a ciegas cada semana?
            </h2>
            <p className="mt-4 text-white/80">
              Escríbenos y te activamos una cuenta con lista de precios
              negociada y línea de crédito en menos de 48 horas.
            </p>
            <a
              href="mailto:ventas@lazofood.pe"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-sage transition-colors hover:bg-brand-cream"
            >
              ventas@lazofood.pe
            </a>
          </div>
        </section>
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
