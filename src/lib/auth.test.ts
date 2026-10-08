import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("password hashing", () => {
  it("round-trips: a hashed password verifies against the original", async () => {
    const hash = await hashPassword("demo1234");
    expect(await verifyPassword("demo1234", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("demo1234");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("never stores the password in plain text", async () => {
    const hash = await hashPassword("demo1234");
    expect(hash).not.toBe("demo1234");
    expect(hash.length).toBeGreaterThan(20);
  });
});
