import { describe, it, expect } from "vitest";
import { resolvePrice } from "./pricing";

describe("resolvePrice", () => {
  it("uses the daily price when there is no negotiated condition", () => {
    expect(resolvePrice(2.8, null)).toBe(2.8);
    expect(resolvePrice(2.8, undefined)).toBe(2.8);
  });

  it("uses the daily price when the negotiated row has neither field set", () => {
    expect(resolvePrice(2.8, { fixedPrice: null, discountPercent: null })).toBe(2.8);
  });

  it("a fixed price overrides the daily price entirely", () => {
    expect(resolvePrice(2.8, { fixedPrice: 1.5 })).toBe(1.5);
  });

  it("a fixed price of 0 is honored (not treated as falsy/unset)", () => {
    expect(resolvePrice(2.8, { fixedPrice: 0 })).toBe(0);
  });

  it("fixed price wins even when a discount is also set", () => {
    expect(resolvePrice(2.8, { fixedPrice: 1.5, discountPercent: 50 })).toBe(1.5);
  });

  it("applies a percentage discount to the daily price", () => {
    expect(resolvePrice(10, { discountPercent: 20 })).toBe(8);
  });

  it("a 0% discount leaves the daily price unchanged", () => {
    expect(resolvePrice(10, { discountPercent: 0 })).toBe(10);
  });

  it("a 100% discount floors at 0, never negative", () => {
    expect(resolvePrice(10, { discountPercent: 150 })).toBe(0);
  });
});
