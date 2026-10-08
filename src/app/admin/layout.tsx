import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col bg-[#f4f3ee]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin">
              <Image src="/brand/logo.svg" alt="LazoFood" width={110} height={60} />
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-foreground/70">
              <Link href="/admin/precios" className="hover:text-brand-tomato">
                Precio del día
              </Link>
              <Link href="/admin/pedidos" className="hover:text-brand-tomato">
                Pedidos
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-foreground/50 hover:text-brand-sage">
            ← Volver al sitio
          </Link>
        </div>
      </header>

      <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-800">
        Panel interno sin autenticación todavía — solo para desarrollo. Antes
        de operar con clientes reales necesita login y control de rol.
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
