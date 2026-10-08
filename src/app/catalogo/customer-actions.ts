"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_COOKIE } from "@/lib/pricing";

export type IdentifyState = { error?: string };

export async function identifyCompany(
  _prevState: IdentifyState,
  formData: FormData
): Promise<IdentifyState> {
  const parsed = z
    .object({ taxId: z.string().regex(/^\d{11}$/, "RUC debe tener 11 dígitos") })
    .safeParse({ taxId: formData.get("taxId") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "RUC inválido" };
  }

  const company = await prisma.company.findUnique({ where: { taxId: parsed.data.taxId } });
  if (!company) {
    return { error: "No encontramos una cuenta con ese RUC. Verifica o haz tu primer pedido como invitado." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, company.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/catalogo");
  revalidatePath("/");

  return {};
}

export async function clearIdentifiedCompany() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
  revalidatePath("/catalogo");
  revalidatePath("/");
}
