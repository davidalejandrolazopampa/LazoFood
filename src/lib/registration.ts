// Alta de empresa cliente: crea Company + primera Branch + usuario dueño
// (CUSTOMER_OWNER) con contraseña, en una sola transacción.
//
// Vive fuera del Server Action para poder probarlo en tests de integración
// (el action usa cookies()/redirect(), que solo existen dentro de Next).
//
// Caso no obvio: una empresa puede existir ya en la base sin cuenta, porque
// el checkout como invitado crea Company/Branch/User por RUC y teléfono sin
// contraseña. Si nadie de esa empresa tiene contraseña todavía, el registro
// "reclama" esa empresa en vez de rechazar el RUC — si no, un cliente que
// pidió como invitado nunca podría crear su cuenta.
import { z } from "zod";
import { UserRole, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const registrationSchema = z
  .object({
    legalName: z.string().trim().min(2, "Razón social requerida"),
    tradeName: z.string().trim().min(2, "Nombre comercial requerido"),
    taxId: z.string().trim().regex(/^\d{11}$/, "RUC debe tener 11 dígitos"),
    businessType: z.string().trim().min(1, "Tipo de negocio requerido"),
    branchName: z.string().trim().min(2, "Nombre de la sede requerido"),
    address: z.string().trim().min(5, "Dirección requerida"),
    district: z.string().trim().min(2, "Distrito requerido"),
    deliveryWindow: z.string().trim().optional().or(z.literal("")),
    ownerName: z.string().trim().min(2, "Tu nombre es requerido"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d{9,15}$/, "Teléfono inválido (incluye código de país)"),
    email: z.string().trim().toLowerCase().email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Las contraseñas no coinciden",
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationResult =
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function registerCompany(input: RegistrationInput): Promise<RegistrationResult> {
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx): Promise<RegistrationResult> => {
    const existing = await tx.company.findUnique({
      where: { taxId: input.taxId },
      include: { users: { where: { passwordHash: { not: null } }, select: { id: true } } },
    });
    if (existing && existing.users.length > 0) {
      return {
        ok: false,
        error: "Esta empresa ya tiene una cuenta.",
        fieldErrors: { taxId: "RUC ya registrado — ingresa con tu correo" },
      };
    }

    const emailOwner = await tx.user.findUnique({ where: { email: input.email } });
    if (emailOwner) {
      return {
        ok: false,
        error: "Revisa los campos marcados.",
        fieldErrors: { email: "Este correo ya está en uso" },
      };
    }

    const phoneOwner = await tx.user.findUnique({ where: { phone: input.phone } });
    if (phoneOwner && (phoneOwner.passwordHash || phoneOwner.companyId !== existing?.id)) {
      return {
        ok: false,
        error: "Revisa los campos marcados.",
        fieldErrors: { phone: "Este teléfono ya está en uso" },
      };
    }

    const companyData = {
      legalName: input.legalName,
      tradeName: input.tradeName,
      businessType: input.businessType,
      billingEmail: input.email,
      billingPhone: input.phone,
    } satisfies Prisma.CompanyUpdateInput;

    const company = existing
      ? await tx.company.update({ where: { id: existing.id }, data: companyData })
      : await tx.company.create({ data: { ...companyData, taxId: input.taxId } });

    const sameBranch = await tx.branch.findFirst({
      where: { companyId: company.id, address: input.address },
    });
    if (!sameBranch) {
      await tx.branch.create({
        data: {
          companyId: company.id,
          name: input.branchName,
          address: input.address,
          district: input.district,
          deliveryWindow: input.deliveryWindow || undefined,
          contactName: input.ownerName,
          contactPhone: input.phone,
        },
      });
    }

    const userData = {
      name: input.ownerName,
      email: input.email,
      passwordHash,
      role: UserRole.CUSTOMER_OWNER,
      companyId: company.id,
    };
    const user = phoneOwner
      ? await tx.user.update({ where: { id: phoneOwner.id }, data: userData })
      : await tx.user.create({ data: { ...userData, phone: input.phone } });

    return { ok: true, userId: user.id, companyId: company.id };
  });
}
