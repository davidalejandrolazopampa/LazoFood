import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { logout } from "./logout-action";

// Todo /admin depende de la cookie de sesión en cada request (gate de
// login) — no tiene sentido pre-renderizarlo estáticamente.
export const instant = false;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const cookieStore = await cookies();
  const user = await getUserByToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!user) redirect("/login");

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
          <div className="flex items-center gap-4 text-sm">
            <span className="text-foreground/60">
              {user.name} <span className="text-foreground/40">({user.email})</span>
            </span>
            <form action={logout}>
              <button type="submit" className="text-foreground/50 hover:text-brand-tomato">
                Salir
              </button>
            </form>
            <Link href="/" className="text-foreground/50 hover:text-brand-sage">
              ← Sitio
            </Link>
          </div>
        </div>
      </header>

      <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-800">
        Acceso con cuenta de demo — login básico sin recuperación de
        contraseña ni verificación de correo. No usar todavía con datos de
        clientes reales.
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
