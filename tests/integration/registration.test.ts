// registerCompany es la transacción detrás de /registro. Se prueba directo
// (no el Server Action) por la misma razón que order-flow.test.ts: el
// action depende de cookies()/redirect(), que solo existen dentro de Next.
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { registerCompany, registrationSchema, type RegistrationInput } from "@/lib/registration";
import { createTestCompany, cleanupTestCompany } from "./helpers";

const companiesToClean: string[] = [];

afterEach(async () => {
  for (const id of companiesToClean.splice(0)) {
    await cleanupTestCompany(id);
  }
});

// registerCompany exige RUC de 11 dígitos (pasa por el schema), así que no
// puede usar el prefijo TEST- de helpers.ts. Se usa el rango 1xxxxxxxxxx,
// que no corresponde a RUC de empresa (esos empiezan con 10 o 20).
function uniqueInput(overrides: Partial<RegistrationInput> = {}): RegistrationInput {
  const digits = randomUUID().replace(/\D/g, "").padEnd(12, "7");
  return {
    legalName: "Cevichería Prueba S.A.C.",
    tradeName: "Cevichería Prueba",
    taxId: `1${digits.slice(0, 10)}`,
    businessType: "cevichería",
    branchName: "Sede Barranco",
    address: "Av. Grau 456",
    district: "Barranco",
    deliveryWindow: "06:00-08:00",
    ownerName: "Ana Prueba",
    phone: `+1${digits.slice(0, 10)}`,
    email: `test-${randomUUID()}@example.com`,
    password: "secreta123",
    passwordConfirm: "secreta123",
    ...overrides,
  };
}

describe("registro de empresa", () => {
  it("crea empresa, primera sede y usuario dueño con contraseña hasheada", async () => {
    const input = uniqueInput();
    const result = await registerCompany(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    companiesToClean.push(result.companyId);

    const company = await prisma.company.findUniqueOrThrow({
      where: { id: result.companyId },
      include: { branches: true, users: true },
    });
    expect(company.taxId).toBe(input.taxId);
    expect(company.branches).toHaveLength(1);
    expect(company.branches[0].district).toBe("Barranco");
    expect(company.users).toHaveLength(1);

    const [user] = company.users;
    expect(user.role).toBe("CUSTOMER_OWNER");
    expect(user.passwordHash).not.toBe(input.password);
    expect(await verifyPassword(input.password, user.passwordHash!)).toBe(true);
  });

  it("rechaza un RUC que ya tiene cuenta", async () => {
    const input = uniqueInput();
    const first = await registerCompany(input);
    if (first.ok) companiesToClean.push(first.companyId);

    const second = await registerCompany(
      uniqueInput({ taxId: input.taxId })
    );
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.fieldErrors?.taxId).toBeDefined();
  });

  it("rechaza un correo que ya está en uso", async () => {
    const input = uniqueInput();
    const first = await registerCompany(input);
    if (first.ok) companiesToClean.push(first.companyId);

    const second = await registerCompany(uniqueInput({ email: input.email }));
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.fieldErrors?.email).toBeDefined();
  });

  it("reclama una empresa creada como invitado en el checkout en vez de duplicarla", async () => {
    // Empresa y usuario sin contraseña, como los deja el checkout invitado.
    const { company, branch, user } = await createTestCompany();
    companiesToClean.push(company.id);

    const result = await registerCompany(
      uniqueInput({ taxId: company.taxId, phone: user.phone, address: branch.address })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.companyId).toBe(company.id);
    expect(result.userId).toBe(user.id);
    const branches = await prisma.branch.count({ where: { companyId: company.id } });
    expect(branches).toBe(1); // misma dirección: no se duplica la sede
    const claimed = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(claimed.passwordHash).not.toBeNull();
  });

  it("el schema exige que las contraseñas coincidan", () => {
    const parsed = registrationSchema.safeParse(uniqueInput({ passwordConfirm: "otra-cosa" }));
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["passwordConfirm"]);
  });
});
