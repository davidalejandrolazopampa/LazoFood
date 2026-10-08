// Datos de ejemplo para desarrollo local.
// Ejecutar con: npm run db:seed
import { PrismaClient, UserRole, UnitOfMeasure } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categorías
  const [verduras, frutas, tuberculos] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "verduras" },
      update: {},
      create: { name: "Verduras", slug: "verduras" },
    }),
    prisma.category.upsert({
      where: { slug: "frutas" },
      update: {},
      create: { name: "Frutas", slug: "frutas" },
    }),
    prisma.category.upsert({
      where: { slug: "tuberculos" },
      update: {},
      create: { name: "Tubérculos", slug: "tuberculos" },
    }),
  ]);

  // Productos + precio del día
  const productsData = [
    { sku: "VER-001", name: "Limón", categoryId: verduras.id, unit: UnitOfMeasure.KG, price: 3.5 },
    { sku: "VER-002", name: "Tomate", categoryId: verduras.id, unit: UnitOfMeasure.KG, price: 2.8 },
    { sku: "VER-003", name: "Cebolla roja", categoryId: verduras.id, unit: UnitOfMeasure.KG, price: 2.2 },
    { sku: "FRU-001", name: "Palta Hass", categoryId: frutas.id, unit: UnitOfMeasure.KG, price: 6.0 },
    { sku: "FRU-002", name: "Plátano de seda", categoryId: frutas.id, unit: UnitOfMeasure.KG, price: 2.5 },
    { sku: "TUB-001", name: "Papa blanca", categoryId: tuberculos.id, unit: UnitOfMeasure.SACK, price: 45.0 },
    { sku: "TUB-002", name: "Camote amarillo", categoryId: tuberculos.id, unit: UnitOfMeasure.KG, price: 1.8 },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: p.categoryId,
        unit: p.unit,
      },
    });

    await prisma.dailyPrice.create({
      data: {
        productId: product.id,
        price: p.price,
      },
    });
  }

  // Empresa cliente de ejemplo con lista de precios negociada y crédito
  const company = await prisma.company.upsert({
    where: { taxId: "20123456789" },
    update: {},
    create: {
      legalName: "Pollos del Norte S.A.C.",
      tradeName: "Pollería El Buen Sazón",
      taxId: "20123456789",
      businessType: "pollería",
      billingEmail: "compras@buensazon.pe",
      creditAccount: {
        create: {
          creditLimit: 15000,
          paymentTermDays: 15,
        },
      },
      branches: {
        create: [
          {
            name: "Sede Surco",
            address: "Av. Caminos del Inca 1234",
            district: "Surco",
            deliveryWindow: "05:00-07:00",
            orderCutoffTime: "18:00",
            contactName: "Juan Pérez",
            contactPhone: "+51999111222",
          },
        ],
      },
    },
  });

  const owner = await prisma.user.upsert({
    where: { phone: "+51999111222" },
    update: {},
    create: {
      phone: "+51999111222",
      name: "Juan Pérez",
      role: UserRole.CUSTOMER_OWNER,
      companyId: company.id,
    },
  });

  await prisma.user.upsert({
    where: { phone: "+51999000000" },
    update: {},
    create: {
      phone: "+51999000000",
      name: "Admin LazoFood",
      role: UserRole.ADMIN,
    },
  });

  console.log("Seed completo:", { company: company.tradeName, owner: owner.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
