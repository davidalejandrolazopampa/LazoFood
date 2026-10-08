import { describe, expect, it } from "vitest";
import { formatCalendarDate } from "./dates";

describe("formatCalendarDate", () => {
  it("no corre una fecha DATE al día anterior en zonas horarias detrás de UTC", () => {
    // Así llega de Prisma una columna @db.Date con valor 2026-10-10.
    const fromDb = new Date("2026-10-10T00:00:00.000Z");
    expect(formatCalendarDate(fromDb)).toContain("10");
    expect(formatCalendarDate(fromDb)).not.toContain("09");
  });
});
