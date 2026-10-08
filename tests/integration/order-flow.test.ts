// Replica la transacción que hace checkout/actions.ts#submitOrder. No se
// llama la Server Action directamente porque usa redirect()/cookies(), que
// dependen del runtime de requests de Next y no existen fuera de él — la
// misma razón por la que todo este módulo se verificó manualmente contra
// la base real durante el desarrollo. Esto formaliza esa verificación.
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

describe("creación de pedido (checkout)", () => {
  it("crea el pedido con el subtotal correcto y un orderNumber único con el formato LF-{año}-{secuencia}", async () => {
    const { company, branch, user } = await createTestCompany();
    companyIdToClean = company.id;

    const product = await prisma.product.findFirst({ where: { active: true } });
    if (!product) throw new Error("Seed el catálogo antes de correr los tests (npm run db:seed)");

    const orderNumber = await nextOrderNumber();
    const quantity = 3;
    const unitPrice = 5.5;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        companyId: company.id,
        branchId: branch.id,
        createdById: user.id,
        status: OrderStatus.SUBMITTED,
        requestedDate: new Date(),
        subtotal: quantity * unitPrice,
        items: {
          create: [{ productId: product.id, quantityOrdered: quantity, unitPriceApplied: unitPrice }],
        },
      },
      include: { items: true },
    });

    expect(order.orderNumber).toMatch(/^LF-\d{4}-\d{5}$/);
    expect(order.status).toBe(OrderStatus.SUBMITTED);
    expect(Number(order.subtotal)).toBeCloseTo(16.5);
    expect(order.items).toHaveLength(1);
    expect(Number(order.items[0].quantityOrdered)).toBe(3);
  });

  it("falla si se intenta repetir el mismo orderNumber (debe ser único)", async () => {
    const { company, branch, user } = await createTestCompany();
    companyIdToClean = company.id;

    const product = await prisma.product.findFirst({ where: { active: true } });
    if (!product) throw new Error("Seed el catálogo antes de correr los tests");

    const orderNumber = await nextOrderNumber();
    const create = () =>
      prisma.order.create({
        data: {
          orderNumber,
          companyId: company.id,
          branchId: branch.id,
          createdById: user.id,
          status: OrderStatus.SUBMITTED,
          requestedDate: new Date(),
          subtotal: 10,
          items: { create: [{ productId: product.id, quantityOrdered: 1, unitPriceApplied: 10 }] },
        },
      });

    await create();
    await expect(create()).rejects.toThrow();
  });
});
