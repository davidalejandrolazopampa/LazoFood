// Fixtures compartidos para tests de integración. Corren contra la base de
// datos real definida en DATABASE_URL (la misma que usa `npm run dev`),
// no una base de test aislada — por eso cada fixture usa un RUC/teléfono
// con prefijo "TEST-" fácil de distinguir, y todo se borra en
// afterEach/afterAll. Para CI real, lo correcto es apuntar DATABASE_URL a
// una base descartable.
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function createTestCompany() {
  // taxId no tiene una restricción de formato a nivel de base de datos (el
  // regex de 11 dígitos solo se valida en el Server Action de checkout),
  // así que para fixtures de test usamos un UUID — nada de reconstruir un
  // RUC falso a partir de Date.now(), que puede colisionar entre archivos
  // de test corriendo en paralelo (cada uno con su propio contador de
  // módulo, pero compitiendo por el mismo milisegundo).
  const unique = randomUUID();
  const taxId = `TEST-${unique}`;
  // User.phone es @unique — mismo motivo que el taxId, nada derivado de
  // Date.now() solo (resolución de 1ms, insuficiente entre tests rápidos).
  const phoneDigits = unique.replace(/-/g, "").slice(0, 10);
  const contactPhone = `+1${phoneDigits}`;

  const company = await prisma.company.create({
    data: {
      legalName: `Test Company ${unique} S.A.C.`,
      tradeName: `Test Company ${unique}`,
      taxId,
      businessType: "restaurante",
      branches: {
        create: [
          {
            name: "Sede Test",
            address: "Av. Test 123",
            district: "Test District",
            contactName: "Test Contact",
            contactPhone,
          },
        ],
      },
    },
    include: { branches: true },
  });

  const user = await prisma.user.create({
    data: {
      phone: company.branches[0].contactPhone!,
      name: "Test User",
      role: UserRole.CUSTOMER_OWNER,
      companyId: company.id,
    },
  });

  return { company, branch: company.branches[0], user };
}

export async function cleanupTestCompany(companyId: string) {
  const orders = await prisma.order.findMany({ where: { companyId } });
  for (const order of orders) {
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  }
  await prisma.order.deleteMany({ where: { companyId } });

  const priceList = await prisma.customerPriceList.findUnique({ where: { companyId } });
  if (priceList) {
    await prisma.customerPriceListItem.deleteMany({ where: { priceListId: priceList.id } });
    await prisma.customerPriceList.delete({ where: { id: priceList.id } });
  }

  await prisma.user.deleteMany({ where: { companyId } });
  await prisma.branch.deleteMany({ where: { companyId } });
  await prisma.company.delete({ where: { id: companyId } });
}

export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: `LF-${year}-` } },
  });
  return `LF-${year}-${String(count + 1).padStart(5, "0")}`;
}
