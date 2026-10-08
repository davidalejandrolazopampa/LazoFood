// Llama al Server Action real de checkout (no una réplica, a diferencia de
// order-flow.test.ts) simulando cookies() y redirect() de Next, para
// cubrir las reglas que dependen de la sesión: un cliente con cuenta solo
// puede pedir a sus propias sedes, y un invitado no puede pedir a nombre de
// una empresa que ya tiene cuenta.
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => void cookieJar.set(name, value),
    delete: (name: string) => void cookieJar.delete(name),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url);
  },
}));

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`redirect ${url}`);
  }
}

const { prisma } = await import("@/lib/prisma");
const { SESSION_COOKIE } = await import("@/lib/auth");
const { registerCompany } = await import("@/lib/registration");
const { startCustomerSession } = await import("@/lib/customer-session");
const { submitOrder } = await import("@/app/checkout/actions");
const { createTestCompany, cleanupTestCompany } = await import("./helpers");

const companiesToClean: string[] = [];

beforeEach(() => cookieJar.clear());
afterEach(async () => {
  for (const id of companiesToClean.splice(0)) {
    await prisma.session.deleteMany({ where: { user: { companyId: id } } });
    await cleanupTestCompany(id);
  }
});

async function registeredCustomer() {
  const digits = randomUUID().replace(/\D/g, "").padEnd(12, "3");
  const result = await registerCompany({
    legalName: "Checkout Test S.A.C.",
    tradeName: "Checkout Test",
    taxId: `1${digits.slice(0, 10)}`,
    businessType: "restaurante",
    branchName: "Sede Test",
    address: "Av. Test 999",
    district: "Lince",
    ownerName: "Test Owner",
    phone: `+1${digits.slice(0, 10)}`,
    email: `test-${randomUUID()}@example.com`,
    password: "secreta123",
    passwordConfirm: "secreta123",
  });
  if (!result.ok) throw new Error(result.error);
  companiesToClean.push(result.companyId);
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: result.companyId },
    include: { branches: true },
  });
  return { ...result, company };
}

async function cartJson() {
  const product = await prisma.product.findFirst({ where: { active: true } });
  if (!product) throw new Error("Seed el catálogo antes de correr los tests (npm run db:seed)");
  return JSON.stringify([
    { productId: product.id, name: product.name, unit: product.unit, price: 4, quantity: 2.5 },
  ]);
}

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function submit(fields: Record<string, string>) {
  try {
    return { state: await submitOrder({}, form(fields)) };
  } catch (e) {
    if (e instanceof RedirectSignal) return { redirect: e.url };
    throw e;
  }
}

describe("checkout con sesión de cliente", () => {
  it("crea el pedido en una sede propia sin pedir datos de empresa", async () => {
    const { userId, companyId, company } = await registeredCustomer();
    await startCustomerSession(userId, companyId);
    expect(cookieJar.get(SESSION_COOKIE)).toBeDefined();

    const result = await submit({
      branchId: company.branches[0].id,
      requestedDate: "2026-10-10",
      cartJson: await cartJson(),
    });

    expect(result.redirect).toMatch(/^\/pedido\/LF-\d{4}-\d{5}$/);
    const order = await prisma.order.findFirstOrThrow({ where: { companyId } });
    expect(order.createdById).toBe(userId);
    expect(Number(order.subtotal)).toBeCloseTo(10);
  });

  it("rechaza una sede que pertenece a otra empresa", async () => {
    const { userId, companyId } = await registeredCustomer();
    const other = await createTestCompany();
    companiesToClean.push(other.company.id);
    await startCustomerSession(userId, companyId);

    const result = await submit({
      branchId: other.branch.id,
      requestedDate: "2026-10-10",
      cartJson: await cartJson(),
    });

    expect(result.state?.fieldErrors?.branchId).toBeDefined();
    expect(await prisma.order.count({ where: { companyId } })).toBe(0);
  });
});

describe("checkout como invitado", () => {
  it("no permite pedir con el RUC de una empresa que ya tiene cuenta", async () => {
    const { company } = await registeredCustomer();

    const result = await submit({
      legalName: "Otra Razón Social S.A.C.",
      tradeName: "Suplantador",
      taxId: company.taxId,
      businessType: "x",
      branchName: "Sede X",
      address: "Av. Falsa 123",
      district: "Lima",
      contactName: "Alguien",
      contactPhone: "+19998887776",
      requestedDate: "2026-10-10",
      cartJson: await cartJson(),
    });

    expect(result.state?.fieldErrors?.taxId).toBeDefined();
    const unchanged = await prisma.company.findUniqueOrThrow({ where: { id: company.id } });
    expect(unchanged.tradeName).toBe("Checkout Test");
  });
});
