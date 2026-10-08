// Replica saveNegotiatedPrice (admin/clientes/actions.ts) combinado con
// resolvePrice, que es lo que realmente ve el cliente en /catalogo.
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { resolvePrice } from "@/lib/pricing";
import { createTestCompany, cleanupTestCompany } from "./helpers";

let companyIdToClean: string | null = null;

afterEach(async () => {
  if (companyIdToClean) {
    await cleanupTestCompany(companyIdToClean);
    companyIdToClean = null;
  }
});

describe("lista de precios negociada", () => {
  it("un precio fijo pactado gana sobre el precio del día al resolver", async () => {
    const { company } = await createTestCompany();
    companyIdToClean = company.id;

    const product = await prisma.product.findFirst({ where: { active: true } });
    if (!product) throw new Error("Seed el catálogo antes de correr los tests");

    const priceList = await prisma.customerPriceList.create({ data: { companyId: company.id } });
    await prisma.customerPriceListItem.create({
      data: { priceListId: priceList.id, productId: product.id, fixedPrice: 1.5 },
    });

    const item = await prisma.customerPriceListItem.findUniqueOrThrow({
      where: { priceListId_productId: { priceListId: priceList.id, productId: product.id } },
    });

    const resolved = resolvePrice(999, {
      fixedPrice: item.fixedPrice ? Number(item.fixedPrice) : null,
      discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
    });

    expect(resolved).toBe(1.5);
  });

  it("borrar el ítem pactado hace que el cliente vuelva a ver el precio del día", async () => {
    const { company } = await createTestCompany();
    companyIdToClean = company.id;

    const product = await prisma.product.findFirst({ where: { active: true } });
    if (!product) throw new Error("Seed el catálogo antes de correr los tests");

    const priceList = await prisma.customerPriceList.create({ data: { companyId: company.id } });
    await prisma.customerPriceListItem.create({
      data: { priceListId: priceList.id, productId: product.id, discountPercent: 20 },
    });

    await prisma.customerPriceListItem.deleteMany({
      where: { priceListId: priceList.id, productId: product.id },
    });

    const remaining = await prisma.customerPriceListItem.findUnique({
      where: { priceListId_productId: { priceListId: priceList.id, productId: product.id } },
    });
    expect(remaining).toBeNull();

    const dailyPrice = 7.0;
    expect(resolvePrice(dailyPrice, null)).toBe(dailyPrice);
  });
});
