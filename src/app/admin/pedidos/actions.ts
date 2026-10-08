"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const schema = z.object({
  orderNumber: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
});

export type UpdateOrderStatusState = { error?: string; ok?: boolean };

export async function updateOrderStatus(
  _prevState: UpdateOrderStatusState,
  formData: FormData
): Promise<UpdateOrderStatusState> {
  const parsed = schema.safeParse({
    orderNumber: formData.get("orderNumber"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Estado inválido" };
  }

  const timestampField =
    parsed.data.status === "CONFIRMED"
      ? { confirmedAt: new Date() }
      : parsed.data.status === "DELIVERED"
        ? { deliveredAt: new Date() }
        : {};

  await prisma.order.update({
    where: { orderNumber: parsed.data.orderNumber },
    data: { status: parsed.data.status, ...timestampField },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${parsed.data.orderNumber}`);

  return { ok: true };
}

export type SaveDeliveredState = { error?: string; ok?: boolean };

// Registra el peso/cantidad realmente despachado por ítem (puede diferir
// de lo pedido: el producto se pesa recién al empacar) y recalcula el
// subtotal del pedido sobre lo entregado, no sobre lo pedido — así la
// factura refleja lo que de verdad salió del almacén.
export async function saveDeliveredQuantities(
  _prevState: SaveDeliveredState,
  formData: FormData
): Promise<SaveDeliveredState> {
  const orderNumber = formData.get("orderNumber");
  if (typeof orderNumber !== "string" || !orderNumber) {
    return { error: "Pedido inválido" };
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) return { error: "Pedido no encontrado" };

  const updates: { itemId: string; quantityDelivered: number }[] = [];
  for (const item of order.items) {
    const raw = formData.get(`qty_${item.id}`);
    const parsed = z.coerce.number().min(0).safeParse(raw);
    if (!parsed.success) {
      return { error: `Cantidad inválida para un producto` };
    }
    updates.push({ itemId: item.id, quantityDelivered: parsed.data });
  }

  await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    for (const u of updates) {
      const item = order.items.find((i) => i.id === u.itemId)!;
      const lineTotal = u.quantityDelivered * Number(item.unitPriceApplied);
      subtotal += lineTotal;
      await tx.orderItem.update({
        where: { id: u.itemId },
        data: { quantityDelivered: u.quantityDelivered, lineTotal },
      });
    }
    await tx.order.update({
      where: { id: order.id },
      data: { subtotal },
    });
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderNumber}`);
  revalidatePath(`/pedido/${orderNumber}`);

  return { ok: true };
}
