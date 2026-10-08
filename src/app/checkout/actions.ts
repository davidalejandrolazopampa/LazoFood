"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { UserRole, OrderStatus, type Prisma } from "@prisma/client";
import { getCurrentCustomer } from "@/lib/customer-session";

const cartLineSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().positive(),
});

const checkoutSchema = z.object({
  legalName: z.string().min(2, "Razón social requerida"),
  tradeName: z.string().min(2, "Nombre comercial requerido"),
  taxId: z.string().regex(/^\d{11}$/, "RUC debe tener 11 dígitos"),
  businessType: z.string().min(1),
  billingEmail: z.string().email().optional().or(z.literal("")),
  branchName: z.string().min(2, "Nombre de la sede requerido"),
  address: z.string().min(5, "Dirección requerida"),
  district: z.string().min(2, "Distrito requerido"),
  deliveryWindow: z.string().optional().or(z.literal("")),
  contactName: z.string().min(2, "Nombre de contacto requerido"),
  contactPhone: z
    .string()
    .regex(/^\+?\d{9,15}$/, "Teléfono inválido (incluye código de país)"),
  requestedDate: z.string().min(1, "Fecha de entrega requerida"),
  notes: z.string().optional().or(z.literal("")),
  cartJson: z.string().min(1),
});

// Cliente con sesión: la empresa y el usuario ya existen, solo elige sede.
const memberCheckoutSchema = z.object({
  branchId: z.string().min(1, "Elige una sede"),
  requestedDate: z.string().min(1, "Fecha de entrega requerida"),
  notes: z.string().optional().or(z.literal("")),
  cartJson: z.string().min(1),
});

type CartLine = z.infer<typeof cartLineSchema>;

function parseCart(cartJson: string): CartLine[] | null {
  try {
    return z.array(cartLineSchema).min(1).parse(JSON.parse(cartJson));
  } catch {
    return null;
  }
}

function toFieldErrors(issues: z.core.$ZodIssue[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    fieldErrors[String(issue.path[0])] ??= issue.message;
  }
  return fieldErrors;
}

async function createOrder(
  tx: Prisma.TransactionClient,
  data: {
    companyId: string;
    branchId: string;
    createdById: string;
    requestedDate: string;
    notes?: string;
    cartLines: CartLine[];
  }
) {
  const year = new Date().getFullYear();
  const ordersThisYear = await tx.order.count({
    where: { orderNumber: { startsWith: `LF-${year}-` } },
  });
  const orderNumber = `LF-${year}-${String(ordersThisYear + 1).padStart(5, "0")}`;

  const subtotal = data.cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  await tx.order.create({
    data: {
      orderNumber,
      companyId: data.companyId,
      branchId: data.branchId,
      createdById: data.createdById,
      status: OrderStatus.SUBMITTED,
      requestedDate: new Date(data.requestedDate),
      notes: data.notes || undefined,
      subtotal,
      items: {
        create: data.cartLines.map((line) => ({
          productId: line.productId,
          quantityOrdered: line.quantity,
          unitPriceApplied: line.price,
        })),
      },
    },
  });

  return orderNumber;
}

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitOrder(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData.entries());
  const customer = await getCurrentCustomer();

  if (customer) {
    const parsed = memberCheckoutSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Revisa los campos marcados.", fieldErrors: toFieldErrors(parsed.error.issues) };
    }
    const cartLines = parseCart(parsed.data.cartJson);
    if (!cartLines) return { error: "Tu carrito está vacío o es inválido. Vuelve al catálogo." };

    // La sede viene del formulario: verificar que sea de su empresa.
    if (!customer.company.branches.some((b) => b.id === parsed.data.branchId)) {
      return { error: "Sede inválida.", fieldErrors: { branchId: "Elige una de tus sedes" } };
    }

    const orderNumber = await prisma.$transaction((tx) =>
      createOrder(tx, {
        companyId: customer.company.id,
        branchId: parsed.data.branchId,
        createdById: customer.id,
        requestedDate: parsed.data.requestedDate,
        notes: parsed.data.notes,
        cartLines,
      })
    );
    redirect(`/pedido/${orderNumber}`);
  }

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;
  const cartLines = parseCart(data.cartJson);
  if (!cartLines) return { error: "Tu carrito está vacío o es inválido. Vuelve al catálogo." };

  // Un invitado no puede pedir (ni sobrescribir datos) a nombre de una
  // empresa o un teléfono que ya tienen cuenta con contraseña.
  const [registeredCompany, registeredPhone] = await Promise.all([
    prisma.company.findFirst({
      where: { taxId: data.taxId, users: { some: { passwordHash: { not: null } } } },
    }),
    prisma.user.findFirst({ where: { phone: data.contactPhone, passwordHash: { not: null } } }),
  ]);
  if (registeredCompany) {
    return {
      error: "Esta empresa ya tiene cuenta. Ingresa para hacer el pedido.",
      fieldErrors: { taxId: "RUC con cuenta — ingresa primero" },
    };
  }
  if (registeredPhone) {
    return {
      error: "Este teléfono pertenece a una cuenta. Ingresa para hacer el pedido.",
      fieldErrors: { contactPhone: "Teléfono con cuenta — ingresa primero" },
    };
  }

  const orderNumber = await prisma.$transaction(async (tx) => {
    const company = await tx.company.upsert({
      where: { taxId: data.taxId },
      update: {
        legalName: data.legalName,
        tradeName: data.tradeName,
        businessType: data.businessType,
        billingEmail: data.billingEmail || undefined,
      },
      create: {
        legalName: data.legalName,
        tradeName: data.tradeName,
        taxId: data.taxId,
        businessType: data.businessType,
        billingEmail: data.billingEmail || undefined,
      },
    });

    let branch = await tx.branch.findFirst({
      where: { companyId: company.id, address: data.address },
    });
    if (!branch) {
      branch = await tx.branch.create({
        data: {
          companyId: company.id,
          name: data.branchName,
          address: data.address,
          district: data.district,
          deliveryWindow: data.deliveryWindow || undefined,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
        },
      });
    }

    const user = await tx.user.upsert({
      where: { phone: data.contactPhone },
      update: { name: data.contactName, companyId: company.id },
      create: {
        phone: data.contactPhone,
        name: data.contactName,
        role: UserRole.CUSTOMER_OWNER,
        companyId: company.id,
      },
    });

    return createOrder(tx, {
      companyId: company.id,
      branchId: branch.id,
      createdById: user.id,
      requestedDate: data.requestedDate,
      notes: data.notes,
      cartLines,
    });
  });

  redirect(`/pedido/${orderNumber}`);
}
