"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

const schema = z.object({
  companyId: z.string().min(1),
  productId: z.string().min(1),
  // Vienen como string del formulario; "" significa "sin pactar / quitar".
  fixedPrice: z.string(),
  discountPercent: z.string(),
});

export type SaveNegotiatedPriceState = { error?: string; ok?: boolean };

export async function saveNegotiatedPrice(
  _prevState: SaveNegotiatedPriceState,
  formData: FormData
): Promise<SaveNegotiatedPriceState> {
  await requireStaff();
  const parsed = schema.safeParse({
    companyId: formData.get("companyId"),
    productId: formData.get("productId"),
    fixedPrice: formData.get("fixedPrice") ?? "",
    discountPercent: formData.get("discountPercent") ?? "",
  });
  if (!parsed.success) return { error: "Datos inválidos" };

  const fixedPrice = parsed.data.fixedPrice.trim() === "" ? null : Number(parsed.data.fixedPrice);
  const discountPercent =
    parsed.data.discountPercent.trim() === "" ? null : Number(parsed.data.discountPercent);

  if (fixedPrice !== null && (isNaN(fixedPrice) || fixedPrice < 0)) {
    return { error: "Precio fijo inválido" };
  }
  if (discountPercent !== null && (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
    return { error: "Descuento debe ser 0-100%" };
  }

  const priceList = await prisma.customerPriceList.upsert({
    where: { companyId: parsed.data.companyId },
    update: {},
    create: { companyId: parsed.data.companyId },
  });

  if (fixedPrice === null && discountPercent === null) {
    // Sin precio fijo ni descuento: quitar la condición pactada para este producto.
    await prisma.customerPriceListItem.deleteMany({
      where: { priceListId: priceList.id, productId: parsed.data.productId },
    });
  } else {
    await prisma.customerPriceListItem.upsert({
      where: {
        priceListId_productId: { priceListId: priceList.id, productId: parsed.data.productId },
      },
      update: { fixedPrice, discountPercent },
      create: {
        priceListId: priceList.id,
        productId: parsed.data.productId,
        fixedPrice,
        discountPercent,
      },
    });
  }

  revalidatePath(`/admin/clientes/${parsed.data.companyId}`);
  revalidatePath("/admin/clientes");
  revalidatePath("/catalogo");

  return { ok: true };
}
