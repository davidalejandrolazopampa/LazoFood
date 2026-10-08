// Replica la lógica de saveDeliveredQuantities (admin/pedidos/actions.ts):
// el subtotal del pedido debe recalcularse sobre lo realmente entregado,
// no sobre lo pedido, porque el producto se pesa recién al despachar.
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { createTestCompany, cleanupTestCompany, nextOrderNumber } from "./helpers";

let companyIdToClean: string | null = null;

afterEach(async () => {
  if (companyIdToClean) {
    await cleanupTestCompany(companyIdToClean);
    companyIdToClean = null;
  }
});

describe("peso real al despacho", () => {
  it("recalcula el subtotal del pedido sobre la cantidad entregada, no la pedida", async () => {
    const { company, branch, user } = await createTestCompany();
    companyIdToClean = company.id;

    const product = await prisma.product.findFirst({ where: { active: true } });
    if (!product) throw new Error("Seed el catálogo antes de correr los tests");

    const unitPrice = 2.8;
    const order = await prisma.order.create({
      data: {
        orderNumber: await nextOrderNumber(),
        companyId: company.id,
        branchId: branch.id,
        createdById: user.id,
        status: OrderStatus.CONFIRMED,
        requestedDate: new Date(),
        subtotal: 10 * unitPrice, // 28.00 estimado sobre lo pedido
        items: {
          create: [{ productId: product.id, quantityOrdered: 10, unitPriceApplied: unitPrice }],
        },
      },
      include: { items: true },
    });

    const item = order.items[0];
    const delivered = 9.6;
    const lineTotal = delivered * unitPrice;

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: item.id },
        data: { quantityDelivered: delivered, lineTotal },
      });
      await tx.order.update({ where: { id: order.id }, data: { subtotal: lineTotal } });
    });

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });

    expect(Number(updated.items[0].quantityDelivered)).toBe(9.6);
    expect(Number(updated.items[0].lineTotal)).toBeCloseTo(26.88);
    expect(Number(updated.subtotal)).toBeCloseTo(26.88);
    // El subtotal original sobre lo pedido (28.00) ya no debe ser el vigente.
    expect(Number(updated.subtotal)).not.toBeCloseTo(28.0);
  });
});
