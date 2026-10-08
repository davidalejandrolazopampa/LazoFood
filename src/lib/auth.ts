import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = "lazofood_session";
const SESSION_TTL_DAYS = 7;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, token, expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getUserByToken(token: string | undefined): Promise<User | null> {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

// Roles que pueden entrar a /admin. Los roles de cliente (dueño/staff de la
// empresa compradora) no deben ver el panel interno.
export const STAFF_ROLES = ["ADMIN", "SALES", "WAREHOUSE", "DRIVER"] as const;

// Server Actions son endpoints públicos: el layout de /admin protege las
// páginas, pero no las acciones. Cada acción del panel debe llamar esto.
export async function requireStaff(): Promise<User> {
  const cookieStore = await cookies();
  const user = await getUserByToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user || !STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
    throw new Error("No autorizado");
  }
  return user;
}
