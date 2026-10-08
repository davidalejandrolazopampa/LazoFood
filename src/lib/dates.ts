// Order.requestedDate es una columna DATE (sin hora): Prisma la entrega como
// medianoche UTC. Formatearla en la zona horaria del servidor (Lima, UTC-5)
// la corre al día anterior — un pedido para el 10 se mostraba como el 9.
// Por eso las fechas de calendario se formatean siempre en UTC.
export function formatCalendarDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" }
) {
  return date.toLocaleDateString("es-PE", { ...options, timeZone: "UTC" });
}
