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
