// DailyPrice es append-only por diseño (ver prisma/schema.prisma) — una
// actualización de precio nunca debe borrar ni sobrescribir el historial.
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

const createdPriceIds: string[] = [];

afterEach(async () => {
  if (createdPriceIds.length > 0) {
    await prisma.dailyPrice.deleteMany({ where: { id: { in: createdPriceIds } } });
    createdPriceIds.length = 0;
  }
});

describe("precio del día (append-only)", () => {
  it("una actualización de precio agrega una fila nueva sin borrar la anterior", async () => {
    const product = await prisma.product.findFirst({ where: { active: true } });
    if (!product) throw new Error("Seed el catálogo antes de correr los tests");

    const before = await prisma.dailyPrice.count({ where: { productId: product.id } });

    const newPrice = await prisma.dailyPrice.create({
      data: { productId: product.id, price: 999.99 },
    });
    createdPriceIds.push(newPrice.id);

    const after = await prisma.dailyPrice.count({ where: { productId: product.id } });
    expect(after).toBe(before + 1);

    const latest = await prisma.dailyPrice.findFirst({
      where: { productId: product.id },
      orderBy: { validFrom: "desc" },
    });
    expect(latest?.id).toBe(newPrice.id);
    expect(Number(latest?.price)).toBe(999.99);
  });
});
