"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
});

export type UpdatePriceState = { error?: string; ok?: boolean };

export async function updatePrice(
  _prevState: UpdatePriceState,
  formData: FormData
): Promise<UpdatePriceState> {
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dato inválido" };
  }

  // Append-only: se inserta un precio nuevo, nunca se sobrescribe el
  // anterior (ver prisma/schema.prisma — DailyPrice).
  await prisma.dailyPrice.create({
    data: {
      productId: parsed.data.productId,
      price: parsed.data.price,
    },
  });

  revalidatePath("/admin/precios");
  revalidatePath("/catalogo");
  revalidatePath("/");

  return { ok: true };
}
