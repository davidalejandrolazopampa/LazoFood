"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

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

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitOrder(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Revisa los campos marcados.", fieldErrors };
  }

  const data = parsed.data;

  let cartLines: z.infer<typeof cartLineSchema>[];
  try {
    cartLines = z.array(cartLineSchema).min(1).parse(JSON.parse(data.cartJson));
  } catch {
    return { error: "Tu carrito está vacío o es inválido. Vuelve al catálogo." };
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

    const year = new Date().getFullYear();
    const ordersThisYear = await tx.order.count({
      where: { orderNumber: { startsWith: `LF-${year}-` } },
    });
    const orderNumber = `LF-${year}-${String(ordersThisYear + 1).padStart(5, "0")}`;

    const subtotal = cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    await tx.order.create({
      data: {
        orderNumber,
        companyId: company.id,
        branchId: branch.id,
        createdById: user.id,
        requestedDate: new Date(data.requestedDate),
        notes: data.notes || undefined,
        subtotal,
        items: {
          create: cartLines.map((line) => ({
            productId: line.productId,
            quantityOrdered: line.quantity,
            unitPriceApplied: line.price,
          })),
        },
      },
    });

    return orderNumber;
  });

  redirect(`/pedido/${orderNumber}`);
}
