import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { CUSTOMER_COOKIE } from "@/lib/pricing";

export const CUSTOMER_ROLES = ["CUSTOMER_OWNER", "CUSTOMER_STAFF"] as const;

// Usuario de empresa cliente con sesión iniciada, con su empresa y sedes.
// null si no hay sesión o si la sesión es de alguien del equipo interno.
export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          company: {
            include: {
              branches: { where: { active: true }, orderBy: { name: "asc" } },
              creditAccount: true,
            },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const { user } = session;
  if (!CUSTOMER_ROLES.includes(user.role as (typeof CUSTOMER_ROLES)[number])) return null;
  if (!user.company) return null;
  return { ...user, company: user.company };
}

// Inicia sesión de cliente: cookie de sesión + cookie de empresa, para que
// el catálogo muestre directamente su lista de precios negociada.
export async function startCustomerSession(userId: string, companyId: string) {
  const { token, expiresAt } = await createSession(userId);
  const cookieStore = await cookies();
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
  cookieStore.set(SESSION_COOKIE, token, base);
  cookieStore.set(CUSTOMER_COOKIE, companyId, base);
}
