// Resuelve el precio que ve un cliente para un producto: si tiene una
// lista negociada con precio fijo para ese producto, ese gana; si tiene un
// % de descuento, se aplica sobre el precio del día; si no hay nada
// pactado, se usa el precio del día tal cual.
export function resolvePrice(
  dailyPrice: number,
  negotiated?: { fixedPrice?: number | null; discountPercent?: number | null } | null
): number {
  if (!negotiated) return dailyPrice;
  if (negotiated.fixedPrice != null) return negotiated.fixedPrice;
  if (negotiated.discountPercent != null) {
    return Math.max(0, dailyPrice * (1 - negotiated.discountPercent / 100));
  }
  return dailyPrice;
}

export const CUSTOMER_COOKIE = "lazofood_company";
