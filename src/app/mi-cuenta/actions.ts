"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { CUSTOMER_COOKIE } from "@/lib/pricing";
import { getCurrentCustomer } from "@/lib/customer-session";

const branchSchema = z.object({
  name: z.string().trim().min(2, "Nombre de la sede requerido"),
  address: z.string().trim().min(5, "Dirección requerida"),
  district: z.string().trim().min(2, "Distrito requerido"),
  deliveryWindow: z.string().trim().optional().or(z.literal("")),
  contactName: z.string().trim().min(2, "Contacto requerido"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "Teléfono inválido (incluye código de país)"),
});

export type AddBranchState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function addBranch(
  _prevState: AddBranchState,
  formData: FormData
): Promise<AddBranchState> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const parsed = branchSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { error: "Revisa los campos marcados.", fieldErrors };
  }

  const duplicate = await prisma.branch.findFirst({
    where: { companyId: customer.company.id, address: parsed.data.address, active: true },
  });
  if (duplicate) {
    return { error: "Ya tienes una sede con esa dirección.", fieldErrors: { address: "Dirección repetida" } };
  }

  await prisma.branch.create({
    data: {
      ...parsed.data,
      deliveryWindow: parsed.data.deliveryWindow || undefined,
      companyId: customer.company.id,
    },
  });

  revalidatePath("/mi-cuenta");
  return { ok: true };
}

export async function customerLogout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(CUSTOMER_COOKIE);
  redirect("/");
}
