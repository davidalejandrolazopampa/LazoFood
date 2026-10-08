export const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Por confirmar", className: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmado", className: "bg-blue-100 text-blue-800" },
  PICKING: { label: "En preparación", className: "bg-blue-100 text-blue-800" },
  OUT_FOR_DELIVERY: { label: "En reparto", className: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Entregado", className: "bg-green-100 text-green-800" },
  INVOICED: { label: "Facturado", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800" },
};
