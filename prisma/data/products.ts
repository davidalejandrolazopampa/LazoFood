// Fuente única de verdad para el catálogo: la usan tanto el seed de Prisma
// como el script de descarga de íconos (scripts/fetch-product-icons.ts).
// ~120 productos pensados para cubrir la gran mayoría del volumen real de
// verduras, frutas y tubérculos que se comercializa en el mercado peruano,
// incluyendo variedades con nombre propio (papas, camotes) que son un
// argumento de venta real en el mayorista peruano.
//
// Los precios son estimados razonables para demo, no una fuente de mercado
// en vivo — el precio del día real se carga desde /admin/precios.
//
// Imágenes: cada producto apunta a un ícono de Twemoji (twitter/twemoji,
// licencia CC-BY 4.0) identificado por su código Unicode (`emoji`). Muchas
// variedades sin emoji propio (p. ej. "papa huayro" vs "papa canchán", o
// tubérculos andinos como la maca o la achira) comparten el ícono genérico
// más cercano — es una limitación real de usar un set de íconos en vez de
// fotografía de producto real, documentada aquí a propósito.

export type ProduceUnit = "KG" | "UNIT" | "CRATE" | "SACK";
export type ProduceCategory = "verduras" | "frutas" | "tuberculos";

export type ProduceItem = {
  sku: string;
  name: string;
  category: ProduceCategory;
  unit: ProduceUnit;
  price: number;
  minOrderQty?: number;
  /** Código(s) Unicode del ícono Twemoji, en minúsculas, separados por "-" */
  emoji: string;
};

// Códigos resueltos desde unicode-emoji-json (nombre -> codepoint), no
// adivinados de memoria. Se reutilizan entre productos de la misma familia
// cuando no existe un emoji específico (p. ej. todas las variedades de papa
// comparten 🥔).
const E = {
  tomato: "1f345",
  onion: "1f9c5",
  carrot: "1f955",
  melon: "1f348",
  cucumber: "1f952",
  beans: "1fad8",
  herb: "1f33f",
  leafyGreen: "1f96c",
  broccoli: "1f966",
  cherries: "1f352",
  eggplant: "1f346",
  hotPepper: "1f336",
  bellPepper: "1fad1",
  corn: "1f33d",
  mushroom: "1f344",
  lemon: "1f34b",
  tangerine: "1f34a",
  banana: "1f34c",
  redApple: "1f34e",
  pear: "1f350",
  grapes: "1f347",
  pineapple: "1f34d",
  mango: "1f96d",
  avocado: "1f951",
  watermelon: "1f349",
  strawberry: "1f353",
  peach: "1f351",
  kiwi: "1f95d",
  greenApple: "1f34f",
  coconut: "1f965",
  blueberries: "1fad0",
  potato: "1f954",
  sweetPotato: "1f360",
  garlic: "1f9c4",
} as const;

export const PRODUCTS: ProduceItem[] = [
  // ───────────────────────────── Verduras (44) ─────────────────────────────
  { sku: "VER-001", name: "Tomate", category: "verduras", unit: "KG", price: 2.8, emoji: E.tomato },
  { sku: "VER-002", name: "Cebolla roja", category: "verduras", unit: "KG", price: 2.2, emoji: E.onion },
  { sku: "VER-003", name: "Cebolla blanca", category: "verduras", unit: "KG", price: 2.0, emoji: E.onion },
  { sku: "VER-004", name: "Zanahoria", category: "verduras", unit: "KG", price: 2.0, emoji: E.carrot },
  { sku: "VER-005", name: "Zapallo macre", category: "verduras", unit: "UNIT", price: 4.5, emoji: E.melon },
  { sku: "VER-006", name: "Zapallo italiano", category: "verduras", unit: "KG", price: 2.6, emoji: E.cucumber },
  { sku: "VER-007", name: "Pepino", category: "verduras", unit: "KG", price: 2.3, emoji: E.cucumber },
  { sku: "VER-008", name: "Vainita", category: "verduras", unit: "KG", price: 3.2, emoji: E.beans },
  { sku: "VER-009", name: "Apio", category: "verduras", unit: "UNIT", price: 2.5, emoji: E.herb },
  { sku: "VER-010", name: "Poro", category: "verduras", unit: "UNIT", price: 2.4, emoji: E.herb },
  { sku: "VER-011", name: "Culantro", category: "verduras", unit: "UNIT", price: 1.5, emoji: E.herb },
  { sku: "VER-012", name: "Perejil", category: "verduras", unit: "UNIT", price: 1.5, emoji: E.herb },
  { sku: "VER-013", name: "Lechuga", category: "verduras", unit: "UNIT", price: 2.8, emoji: E.leafyGreen },
  { sku: "VER-014", name: "Col", category: "verduras", unit: "UNIT", price: 2.5, emoji: E.leafyGreen },
  { sku: "VER-015", name: "Coliflor", category: "verduras", unit: "UNIT", price: 4.0, emoji: E.broccoli },
  { sku: "VER-016", name: "Brócoli", category: "verduras", unit: "UNIT", price: 4.5, emoji: E.broccoli },
  { sku: "VER-017", name: "Espinaca", category: "verduras", unit: "UNIT", price: 2.0, emoji: E.leafyGreen },
  { sku: "VER-018", name: "Acelga", category: "verduras", unit: "UNIT", price: 2.0, emoji: E.leafyGreen },
  { sku: "VER-019", name: "Rabanito", category: "verduras", unit: "KG", price: 2.8, emoji: E.cherries },
  { sku: "VER-020", name: "Beterraga", category: "verduras", unit: "KG", price: 2.4, emoji: E.eggplant },
  { sku: "VER-021", name: "Ají amarillo", category: "verduras", unit: "KG", price: 5.5, emoji: E.hotPepper },
  { sku: "VER-022", name: "Rocoto", category: "verduras", unit: "KG", price: 5.0, emoji: E.hotPepper },
  { sku: "VER-023", name: "Pimiento", category: "verduras", unit: "KG", price: 4.8, emoji: E.bellPepper },
  { sku: "VER-024", name: "Choclo", category: "verduras", unit: "UNIT", price: 1.8, emoji: E.corn },
  { sku: "VER-025", name: "Haba", category: "verduras", unit: "KG", price: 3.5, emoji: E.beans },
  { sku: "VER-026", name: "Berenjena", category: "verduras", unit: "KG", price: 3.2, emoji: E.eggplant },
  { sku: "VER-027", name: "Pepinillo", category: "verduras", unit: "KG", price: 2.6, emoji: E.cucumber },
  { sku: "VER-028", name: "Nabo", category: "verduras", unit: "KG", price: 2.0, emoji: E.onion },
  { sku: "VER-029", name: "Alcachofa", category: "verduras", unit: "UNIT", price: 3.5, emoji: E.broccoli },
  { sku: "VER-030", name: "Champiñón", category: "verduras", unit: "KG", price: 7.0, emoji: E.mushroom },
  { sku: "VER-031", name: "Espárrago", category: "verduras", unit: "KG", price: 9.0, emoji: E.herb },
  { sku: "VER-032", name: "Cebolla china", category: "verduras", unit: "UNIT", price: 1.8, emoji: E.onion },
  { sku: "VER-033", name: "Tomate cherry", category: "verduras", unit: "KG", price: 5.5, emoji: E.tomato },
  { sku: "VER-034", name: "Zapallo loche", category: "verduras", unit: "UNIT", price: 5.0, emoji: E.melon },
  { sku: "VER-035", name: "Vainita china", category: "verduras", unit: "KG", price: 4.0, emoji: E.beans },
  { sku: "VER-036", name: "Pallar verde", category: "verduras", unit: "KG", price: 4.5, emoji: E.beans },
  { sku: "VER-037", name: "Col china", category: "verduras", unit: "UNIT", price: 3.0, emoji: E.leafyGreen },
  { sku: "VER-038", name: "Hinojo", category: "verduras", unit: "UNIT", price: 3.2, emoji: E.herb },
  { sku: "VER-039", name: "Arveja verde", category: "verduras", unit: "KG", price: 3.8, emoji: E.beans },
  { sku: "VER-040", name: "Maíz morado", category: "verduras", unit: "UNIT", price: 2.2, emoji: E.corn },
  { sku: "VER-041", name: "Berro", category: "verduras", unit: "UNIT", price: 2.0, emoji: E.herb },
  { sku: "VER-042", name: "Rúcula", category: "verduras", unit: "UNIT", price: 3.0, emoji: E.leafyGreen },
  { sku: "VER-043", name: "Ají limo", category: "verduras", unit: "KG", price: 7.0, emoji: E.hotPepper },
  { sku: "VER-044", name: "Col morada", category: "verduras", unit: "UNIT", price: 3.0, emoji: E.leafyGreen },

  // ───────────────────────────── Frutas (51) ─────────────────────────────
  { sku: "FRU-001", name: "Limón", category: "frutas", unit: "KG", price: 3.5, emoji: E.lemon },
  { sku: "FRU-002", name: "Naranja", category: "frutas", unit: "KG", price: 2.5, emoji: E.tangerine },
  { sku: "FRU-003", name: "Mandarina", category: "frutas", unit: "KG", price: 3.0, emoji: E.tangerine },
  { sku: "FRU-004", name: "Plátano de seda", category: "frutas", unit: "KG", price: 2.5, emoji: E.banana },
  { sku: "FRU-005", name: "Plátano de isla", category: "frutas", unit: "KG", price: 2.8, emoji: E.banana },
  { sku: "FRU-006", name: "Manzana", category: "frutas", unit: "KG", price: 4.0, emoji: E.redApple },
  { sku: "FRU-007", name: "Pera", category: "frutas", unit: "KG", price: 4.2, emoji: E.pear },
  { sku: "FRU-008", name: "Uva", category: "frutas", unit: "KG", price: 7.0, emoji: E.grapes },
  { sku: "FRU-009", name: "Piña", category: "frutas", unit: "UNIT", price: 5.0, emoji: E.pineapple },
  { sku: "FRU-010", name: "Papaya", category: "frutas", unit: "KG", price: 2.8, emoji: E.mango },
  { sku: "FRU-011", name: "Mango", category: "frutas", unit: "KG", price: 4.5, emoji: E.mango },
  { sku: "FRU-012", name: "Palta Hass", category: "frutas", unit: "KG", price: 7.5, emoji: E.avocado },
  { sku: "FRU-013", name: "Palta Fuerte", category: "frutas", unit: "KG", price: 6.0, emoji: E.avocado },
  { sku: "FRU-014", name: "Melón", category: "frutas", unit: "UNIT", price: 4.5, emoji: E.melon },
  { sku: "FRU-015", name: "Sandía", category: "frutas", unit: "UNIT", price: 3.5, emoji: E.watermelon },
  { sku: "FRU-016", name: "Fresa", category: "frutas", unit: "KG", price: 8.0, emoji: E.strawberry },
  { sku: "FRU-017", name: "Maracuyá", category: "frutas", unit: "KG", price: 4.0, emoji: E.tangerine },
  { sku: "FRU-018", name: "Chirimoya", category: "frutas", unit: "KG", price: 6.5, emoji: E.pear },
  { sku: "FRU-019", name: "Lúcuma", category: "frutas", unit: "KG", price: 7.0, emoji: E.peach },
  { sku: "FRU-020", name: "Granadilla", category: "frutas", unit: "KG", price: 5.5, emoji: E.tangerine },
  { sku: "FRU-021", name: "Tuna", category: "frutas", unit: "KG", price: 3.5, emoji: E.kiwi },
  { sku: "FRU-022", name: "Aguaymanto", category: "frutas", unit: "KG", price: 9.0, emoji: E.tangerine },
  { sku: "FRU-023", name: "Durazno", category: "frutas", unit: "KG", price: 5.0, emoji: E.peach },
  { sku: "FRU-024", name: "Membrillo", category: "frutas", unit: "KG", price: 3.8, emoji: E.pear },
  { sku: "FRU-025", name: "Toronja", category: "frutas", unit: "KG", price: 3.2, emoji: E.tangerine },
  { sku: "FRU-026", name: "Guanábana", category: "frutas", unit: "KG", price: 6.0, emoji: E.pear },
  { sku: "FRU-027", name: "Tamarillo", category: "frutas", unit: "KG", price: 4.5, emoji: E.tomato },
  { sku: "FRU-028", name: "Carambola", category: "frutas", unit: "KG", price: 5.0, emoji: E.greenApple },
  { sku: "FRU-029", name: "Pepino dulce", category: "frutas", unit: "KG", price: 4.0, emoji: E.melon },
  { sku: "FRU-030", name: "Níspero", category: "frutas", unit: "KG", price: 4.5, emoji: E.peach },
  { sku: "FRU-031", name: "Guayaba", category: "frutas", unit: "KG", price: 3.8, emoji: E.pear },
  { sku: "FRU-032", name: "Pacae", category: "frutas", unit: "KG", price: 3.0, emoji: E.beans },
  { sku: "FRU-033", name: "Caimito", category: "frutas", unit: "KG", price: 5.0, emoji: E.cherries },
  { sku: "FRU-034", name: "Coco", category: "frutas", unit: "UNIT", price: 4.0, emoji: E.coconut },
  { sku: "FRU-035", name: "Kiwi", category: "frutas", unit: "KG", price: 9.5, emoji: E.kiwi },
  { sku: "FRU-036", name: "Ciruela", category: "frutas", unit: "KG", price: 5.5, emoji: E.cherries },
  { sku: "FRU-037", name: "Mora", category: "frutas", unit: "KG", price: 7.5, emoji: E.grapes },
  { sku: "FRU-038", name: "Arándano", category: "frutas", unit: "KG", price: 14.0, emoji: E.blueberries },
  { sku: "FRU-039", name: "Camu camu", category: "frutas", unit: "KG", price: 10.0, emoji: E.cherries },
  { sku: "FRU-040", name: "Pitahaya", category: "frutas", unit: "UNIT", price: 8.0, emoji: E.strawberry },
  { sku: "FRU-041", name: "Tangelo", category: "frutas", unit: "KG", price: 3.5, emoji: E.tangerine },
  { sku: "FRU-042", name: "Lima", category: "frutas", unit: "KG", price: 3.0, emoji: E.lemon },
  { sku: "FRU-043", name: "Higo", category: "frutas", unit: "KG", price: 6.5, emoji: E.peach },
  { sku: "FRU-044", name: "Zapote", category: "frutas", unit: "KG", price: 5.0, emoji: E.peach },
  { sku: "FRU-045", name: "Frambuesa", category: "frutas", unit: "KG", price: 15.0, emoji: E.strawberry },
  { sku: "FRU-046", name: "Caqui", category: "frutas", unit: "KG", price: 5.5, emoji: E.tomato },
  { sku: "FRU-047", name: "Damasco", category: "frutas", unit: "KG", price: 6.0, emoji: E.peach },
  { sku: "FRU-048", name: "Cereza", category: "frutas", unit: "KG", price: 16.0, emoji: E.cherries },
  { sku: "FRU-049", name: "Granada", category: "frutas", unit: "KG", price: 6.0, emoji: E.cherries },
  { sku: "FRU-050", name: "Nectarina", category: "frutas", unit: "KG", price: 5.5, emoji: E.peach },
  { sku: "FRU-051", name: "Tamarindo", category: "frutas", unit: "KG", price: 4.5, emoji: E.beans },

  // ──────────────────────────── Tubérculos (25) ────────────────────────────
  { sku: "TUB-001", name: "Papa blanca", category: "tuberculos", unit: "SACK", price: 45.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-002", name: "Papa amarilla", category: "tuberculos", unit: "SACK", price: 55.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-003", name: "Papa huayro", category: "tuberculos", unit: "SACK", price: 60.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-004", name: "Camote amarillo", category: "tuberculos", unit: "KG", price: 1.8, emoji: E.sweetPotato },
  { sku: "TUB-005", name: "Camote morado", category: "tuberculos", unit: "KG", price: 2.2, emoji: E.sweetPotato },
  { sku: "TUB-006", name: "Yuca", category: "tuberculos", unit: "SACK", price: 35.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-007", name: "Olluco", category: "tuberculos", unit: "KG", price: 3.0, emoji: E.potato },
  { sku: "TUB-008", name: "Oca", category: "tuberculos", unit: "KG", price: 3.2, emoji: E.potato },
  { sku: "TUB-009", name: "Mashua", category: "tuberculos", unit: "KG", price: 2.8, emoji: E.potato },
  { sku: "TUB-010", name: "Arracacha", category: "tuberculos", unit: "KG", price: 3.5, emoji: E.potato },
  { sku: "TUB-011", name: "Jengibre", category: "tuberculos", unit: "KG", price: 6.5, emoji: E.potato },
  { sku: "TUB-012", name: "Ajo", category: "tuberculos", unit: "KG", price: 9.0, emoji: E.garlic },
  { sku: "TUB-013", name: "Papa canchán", category: "tuberculos", unit: "SACK", price: 48.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-014", name: "Papa peruanita", category: "tuberculos", unit: "KG", price: 4.5, emoji: E.potato },
  { sku: "TUB-015", name: "Papa tomasa", category: "tuberculos", unit: "SACK", price: 50.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-016", name: "Papa perricholi", category: "tuberculos", unit: "SACK", price: 52.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-017", name: "Papa única", category: "tuberculos", unit: "SACK", price: 50.0, minOrderQty: 1, emoji: E.potato },
  { sku: "TUB-018", name: "Papa amarilla tumbay", category: "tuberculos", unit: "KG", price: 5.0, emoji: E.potato },
  { sku: "TUB-019", name: "Camote blanco", category: "tuberculos", unit: "KG", price: 1.9, emoji: E.sweetPotato },
  { sku: "TUB-020", name: "Yacón", category: "tuberculos", unit: "KG", price: 3.5, emoji: E.potato },
  { sku: "TUB-021", name: "Maca", category: "tuberculos", unit: "KG", price: 12.0, emoji: E.potato },
  { sku: "TUB-022", name: "Achira", category: "tuberculos", unit: "KG", price: 3.0, emoji: E.potato },
  { sku: "TUB-023", name: "Sachapapa", category: "tuberculos", unit: "KG", price: 3.2, emoji: E.potato },
  { sku: "TUB-024", name: "Pituca", category: "tuberculos", unit: "KG", price: 3.0, emoji: E.potato },
  { sku: "TUB-025", name: "Papa huamantanga", category: "tuberculos", unit: "KG", price: 4.0, emoji: E.potato },
];
