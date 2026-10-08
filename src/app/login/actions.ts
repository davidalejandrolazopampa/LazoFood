"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword, SESSION_COOKIE, STAFF_ROLES } from "@/lib/auth";
import { startCustomerSession } from "@/lib/customer-session";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.passwordHash) {
    return { error: "Correo o contraseña incorrectos" };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Correo o contraseña incorrectos" };
  }

  // Mismo login para equipo interno y clientes; cada uno cae en su sitio.
  if (!STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
    if (!user.companyId) {
      return { error: "Esta cuenta no está asociada a ninguna empresa" };
    }
    await startCustomerSession(user.id, user.companyId);
    redirect("/mi-cuenta");
  }

  const { token, expiresAt } = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect("/admin");
}
