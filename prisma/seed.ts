// Datos de ejemplo para desarrollo local.
// Ejecutar con: npm run db:seed
import { PrismaClient, UserRole, UnitOfMeasure } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS, type ProduceCategory } from "./data/products";

const prisma = new PrismaClient();

// Cuenta de demo para probar /admin. Login básico de desarrollo, no apto
// para producción (ver nota en src/app/admin/layout.tsx).
const DEMO_EMAIL = "demo@lazofood.pe";
const DEMO_PASSWORD = "demo1234";

const CATEGORY_LABEL: Record<ProduceCategory, string> = {
  verduras: "Verduras",
  frutas: "Frutas",
  tuberculos: "Tubérculos",
};

async function main() {
  // Categorías
  const categoryIds: Record<ProduceCategory, string> = {} as Record<ProduceCategory, string>;
  for (const slug of Object.keys(CATEGORY_LABEL) as ProduceCategory[]) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: CATEGORY_LABEL[slug], slug },
    });
    categoryIds[slug] = category.id;
  }

  // Catálogo completo (ver prisma/data/products.ts) + precio del día + imagen
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId: categoryIds[p.category],
        unit: p.unit as UnitOfMeasure,
        minOrderQty: p.minOrderQty ?? 1,
        imageUrl: `/products/icons/${p.emoji}.svg`,
      },
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: categoryIds[p.category],
        unit: p.unit as UnitOfMeasure,
        minOrderQty: p.minOrderQty ?? 1,
        imageUrl: `/products/icons/${p.emoji}.svg`,
      },
    });

    const hasPriceToday = await prisma.dailyPrice.findFirst({
      where: { productId: product.id },
      orderBy: { validFrom: "desc" },
    });
    if (!hasPriceToday || Number(hasPriceToday.price) !== p.price) {
      await prisma.dailyPrice.create({
        data: {
          productId: product.id,
          price: p.price,
        },
      });
    }
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

  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.user.upsert({
    where: { phone: "+51999000000" },
    update: { email: DEMO_EMAIL, passwordHash: demoPasswordHash, name: "Admin Demo" },
    create: {
      phone: "+51999000000",
      email: DEMO_EMAIL,
      passwordHash: demoPasswordHash,
      name: "Admin Demo",
      role: UserRole.ADMIN,
    },
  });

  console.log("Seed completo:", { company: company.tradeName, owner: owner.name });
  console.log(`Login de prueba: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
