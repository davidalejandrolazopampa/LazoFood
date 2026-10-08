"use server";

import { redirect } from "next/navigation";
import { registerCompany, registrationSchema } from "@/lib/registration";
import { startCustomerSession } from "@/lib/customer-session";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  // Se devuelven los valores para no vaciar el formulario ante un error,
  // salvo las contraseñas.
  const values = { ...raw };
  delete values.password;
  delete values.passwordConfirm;

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { error: "Revisa los campos marcados.", fieldErrors, values };
  }

  const result = await registerCompany(parsed.data);
  if (!result.ok) {
    return { error: result.error, fieldErrors: result.fieldErrors, values };
  }

  await startCustomerSession(result.userId, result.companyId);
  redirect("/mi-cuenta?bienvenida=1");
}
