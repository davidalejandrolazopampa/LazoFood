"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-brand-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/">
          <Image src="/brand/logo.svg" alt="LazoFood" width={150} height={82} priority />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
          <Link href="/catalogo" className="hover:text-brand-tomato">
            Catálogo
          </Link>
          <Link href="/#como-funciona" className="hover:text-brand-tomato">
            Cómo funciona
          </Link>
          <Link href="/#contacto" className="hover:text-brand-tomato">
            Contacto
          </Link>
        </nav>
        <Link
          href="/carrito"
          className="relative flex items-center gap-2 rounded-full bg-brand-sage px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-tomato"
        >
          Carrito
          {itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-tomato px-1 text-xs font-bold">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
