// Fuente única de verdad para el catálogo: la usan tanto el seed de Prisma
// como el generador de íconos (scripts/generate-product-icons.mjs). Lista
// pensada para cubrir la gran mayoría del volumen real de verduras, frutas
// y tubérculos que se comercializa en el mercado peruano (Lima mayorista),
// no solo un puñado de ejemplos.
//
// Los precios son estimados razonables para demo, no una fuente de mercado
// en vivo — una vez conectado el negocio real, el precio del día se carga
// desde el panel admin (ver /admin/precios).

export type ProduceUnit = "KG" | "UNIT" | "CRATE" | "SACK";
export type ProduceCategory = "verduras" | "frutas" | "tuberculos";

// Parámetros del ícono: el generador interpreta `archetype` + colores para
// dibujar una ilustración consistente (mismo marco, misma sombra, mismo
// radio de esquina) pero visualmente distinta por producto.
export type IconArchetype =
  | "round" // fruta/verdura redonda simple (tomate, manzana, cebolla...)
  | "citrus" // redonda + hoja/tallo tipo cítrico (limón, naranja...)
  | "leafy" // manojo de hojas (lechuga, espinaca, culantro...)
  | "root" // tubérculo alargado/irregular bajo tierra
  | "pod" // vaina (vainita, haba, arveja)
  | "cluster" // racimo de esferas pequeñas (uva)
  | "cob" // choclo
  | "curved" // plátano
  | "crowned" // piña (cuerpo ovalado + corona de hojas)
  | "bulb" // ajo, cebolla en bulbo compuesto
  | "striped" // sandía
  | "netted" // melón
  | "cone"; // ají, pimiento, rocoto

export type IconSpec = {
  archetype: IconArchetype;
  primary: string;
  secondary?: string;
  accent?: string; // hojas/tallo
  flavor?: "tall" | "wide" | "bumpy" | "smooth"; // pequeña variación de forma
};

export type ProduceItem = {
  sku: string;
  name: string;
  category: ProduceCategory;
  unit: ProduceUnit;
  price: number;
  minOrderQty?: number;
  icon: IconSpec;
};

const LEAF_GREEN = "#6f9a4c";
const LEAF_DARK = "#4f7a3a";

export const PRODUCTS: ProduceItem[] = [
  // ───────────────────────────── Verduras ─────────────────────────────
  { sku: "VER-001", name: "Tomate", category: "verduras", unit: "KG", price: 2.8, icon: { archetype: "round", primary: "#cf4a4a", secondary: "#e3716a", accent: LEAF_GREEN } },
  { sku: "VER-002", name: "Cebolla roja", category: "verduras", unit: "KG", price: 2.2, icon: { archetype: "round", primary: "#9a3f63", secondary: "#c06a8c", accent: "#d9c79a" } },
  { sku: "VER-003", name: "Cebolla blanca", category: "verduras", unit: "KG", price: 2.0, icon: { archetype: "round", primary: "#e9e2c6", secondary: "#f6f1de", accent: "#c9d9a6" } },
  { sku: "VER-004", name: "Zanahoria", category: "verduras", unit: "KG", price: 2.0, icon: { archetype: "root", primary: "#e2792a", secondary: "#f0a35c", accent: LEAF_GREEN, flavor: "tall" } },
  { sku: "VER-005", name: "Zapallo macre", category: "verduras", unit: "UNIT", price: 4.5, icon: { archetype: "round", primary: "#d98a2b", secondary: "#e8ab5f", accent: LEAF_DARK, flavor: "bumpy" } },
  { sku: "VER-006", name: "Zapallo italiano", category: "verduras", unit: "KG", price: 2.6, icon: { archetype: "root", primary: "#3f6b2f", secondary: "#5d8a47", accent: "#cfe3bd", flavor: "tall" } },
  { sku: "VER-007", name: "Pepino", category: "verduras", unit: "KG", price: 2.3, icon: { archetype: "root", primary: "#5d8a3a", secondary: "#89b45e", flavor: "tall" } },
  { sku: "VER-008", name: "Vainita", category: "verduras", unit: "KG", price: 3.2, icon: { archetype: "pod", primary: "#5f9a3f", secondary: "#86c15f" } },
  { sku: "VER-009", name: "Apio", category: "verduras", unit: "UNIT", price: 2.5, icon: { archetype: "leafy", primary: "#a9c97e", secondary: "#c9e0a0" } },
  { sku: "VER-010", name: "Poro", category: "verduras", unit: "UNIT", price: 2.4, icon: { archetype: "root", primary: "#e9e9d6", secondary: "#8fb563", accent: LEAF_GREEN, flavor: "tall" } },
  { sku: "VER-011", name: "Culantro", category: "verduras", unit: "UNIT", price: 1.5, icon: { archetype: "leafy", primary: "#3f7a33", secondary: "#5f9a4a" } },
  { sku: "VER-012", name: "Perejil", category: "verduras", unit: "UNIT", price: 1.5, icon: { archetype: "leafy", primary: "#4a7d3f", secondary: "#6b9c55" } },
  { sku: "VER-013", name: "Lechuga", category: "verduras", unit: "UNIT", price: 2.8, icon: { archetype: "leafy", primary: "#8bc15a", secondary: "#b6dd8e", flavor: "wide" } },
  { sku: "VER-014", name: "Col", category: "verduras", unit: "UNIT", price: 2.5, icon: { archetype: "round", primary: "#9ec977", secondary: "#c3e0a4", flavor: "bumpy" } },
  { sku: "VER-015", name: "Coliflor", category: "verduras", unit: "UNIT", price: 4.0, icon: { archetype: "round", primary: "#f3f0e0", secondary: "#ffffff", accent: "#8fb563", flavor: "bumpy" } },
  { sku: "VER-016", name: "Brócoli", category: "verduras", unit: "UNIT", price: 4.5, icon: { archetype: "round", primary: "#3f6b3a", secondary: "#5d8a52", accent: "#7aa35e", flavor: "bumpy" } },
  { sku: "VER-017", name: "Espinaca", category: "verduras", unit: "UNIT", price: 2.0, icon: { archetype: "leafy", primary: "#2f6b33", secondary: "#4a8a4a" } },
  { sku: "VER-018", name: "Acelga", category: "verduras", unit: "UNIT", price: 2.0, icon: { archetype: "leafy", primary: "#4a8a4a", secondary: "#6bab5f", accent: "#c0415c" } },
  { sku: "VER-019", name: "Rabanito", category: "verduras", unit: "KG", price: 2.8, icon: { archetype: "round", primary: "#c0415c", secondary: "#f0f0e6", accent: LEAF_GREEN } },
  { sku: "VER-020", name: "Beterraga", category: "verduras", unit: "KG", price: 2.4, icon: { archetype: "round", primary: "#7a2048", secondary: "#9c3f66", accent: LEAF_DARK } },
  { sku: "VER-021", name: "Ají amarillo", category: "verduras", unit: "KG", price: 5.5, icon: { archetype: "cone", primary: "#f0a92a", secondary: "#f7c768", accent: LEAF_GREEN } },
  { sku: "VER-022", name: "Rocoto", category: "verduras", unit: "KG", price: 5.0, icon: { archetype: "cone", primary: "#d9432f", secondary: "#e86f5c", accent: LEAF_GREEN, flavor: "wide" } },
  { sku: "VER-023", name: "Pimiento", category: "verduras", unit: "KG", price: 4.8, icon: { archetype: "cone", primary: "#c8372f", secondary: "#e0665a", accent: LEAF_GREEN, flavor: "wide" } },
  { sku: "VER-024", name: "Choclo", category: "verduras", unit: "UNIT", price: 1.8, icon: { archetype: "cob", primary: "#f0c93f", secondary: "#f7df85", accent: "#a9c97e" } },
  { sku: "VER-025", name: "Haba", category: "verduras", unit: "KG", price: 3.5, icon: { archetype: "pod", primary: "#6ba34a", secondary: "#8fc16f", flavor: "wide" } },
  { sku: "VER-026", name: "Berenjena", category: "verduras", unit: "KG", price: 3.2, icon: { archetype: "root", primary: "#4a2a4f", secondary: "#6b4a73", accent: LEAF_GREEN, flavor: "tall" } },

  // ───────────────────────────── Frutas ─────────────────────────────
  { sku: "FRU-001", name: "Limón", category: "frutas", unit: "KG", price: 3.5, icon: { archetype: "citrus", primary: "#8fae3a", secondary: "#b3cf63", accent: LEAF_GREEN } },
  { sku: "FRU-002", name: "Naranja", category: "frutas", unit: "KG", price: 2.5, icon: { archetype: "citrus", primary: "#e8821f", secondary: "#f3a752", accent: LEAF_GREEN } },
  { sku: "FRU-003", name: "Mandarina", category: "frutas", unit: "KG", price: 3.0, icon: { archetype: "citrus", primary: "#ee9a2a", secondary: "#f6ba63", accent: LEAF_GREEN } },
  { sku: "FRU-004", name: "Plátano de seda", category: "frutas", unit: "KG", price: 2.5, icon: { archetype: "curved", primary: "#f0c93f", secondary: "#f7de82" } },
  { sku: "FRU-005", name: "Plátano de isla", category: "frutas", unit: "KG", price: 2.8, icon: { archetype: "curved", primary: "#a9b23f", secondary: "#c7cf72" } },
  { sku: "FRU-006", name: "Manzana", category: "frutas", unit: "KG", price: 4.0, icon: { archetype: "round", primary: "#c8352f", secondary: "#e3675c", accent: LEAF_GREEN } },
  { sku: "FRU-007", name: "Pera", category: "frutas", unit: "KG", price: 4.2, icon: { archetype: "root", primary: "#c3cf6a", secondary: "#dbe49a", accent: LEAF_GREEN, flavor: "tall" } },
  { sku: "FRU-008", name: "Uva", category: "frutas", unit: "KG", price: 7.0, icon: { archetype: "cluster", primary: "#5c3f7a", secondary: "#7d5f9c" } },
  { sku: "FRU-009", name: "Piña", category: "frutas", unit: "UNIT", price: 5.0, icon: { archetype: "crowned", primary: "#e0ab2a", secondary: "#f0cb63", accent: LEAF_DARK } },
  { sku: "FRU-010", name: "Papaya", category: "frutas", unit: "KG", price: 2.8, icon: { archetype: "root", primary: "#e8821f", secondary: "#5d8a47", flavor: "tall" } },
  { sku: "FRU-011", name: "Mango", category: "frutas", unit: "KG", price: 4.5, icon: { archetype: "round", primary: "#e8821f", secondary: "#c8352f", accent: LEAF_GREEN } },
  { sku: "FRU-012", name: "Palta Hass", category: "frutas", unit: "KG", price: 7.5, icon: { archetype: "root", primary: "#3f4a2f", secondary: "#5d6b47", flavor: "tall" } },
  { sku: "FRU-013", name: "Palta Fuerte", category: "frutas", unit: "KG", price: 6.0, icon: { archetype: "root", primary: "#4f7a3a", secondary: "#6f9a52", flavor: "tall" } },
  { sku: "FRU-014", name: "Melón", category: "frutas", unit: "UNIT", price: 4.5, icon: { archetype: "netted", primary: "#d9c97a", secondary: "#e8dca0" } },
  { sku: "FRU-015", name: "Sandía", category: "frutas", unit: "UNIT", price: 3.5, icon: { archetype: "striped", primary: "#3f7a3f", secondary: "#2f5a30" } },
  { sku: "FRU-016", name: "Fresa", category: "frutas", unit: "KG", price: 8.0, icon: { archetype: "cone", primary: "#d9314f", secondary: "#ea6378", accent: LEAF_GREEN, flavor: "wide" } },
  { sku: "FRU-017", name: "Maracuyá", category: "frutas", unit: "KG", price: 4.0, icon: { archetype: "round", primary: "#7a5a1f", secondary: "#a37f3f" } },
  { sku: "FRU-018", name: "Chirimoya", category: "frutas", unit: "KG", price: 6.5, icon: { archetype: "round", primary: "#7fa35e", secondary: "#9fc07e", flavor: "bumpy" } },
  { sku: "FRU-019", name: "Lúcuma", category: "frutas", unit: "KG", price: 7.0, icon: { archetype: "root", primary: "#7a5a2f", secondary: "#9c7f4f", flavor: "tall" } },
  { sku: "FRU-020", name: "Granadilla", category: "frutas", unit: "KG", price: 5.5, icon: { archetype: "round", primary: "#e8b23f", secondary: "#f0cb72" } },
  { sku: "FRU-021", name: "Tuna", category: "frutas", unit: "KG", price: 3.5, icon: { archetype: "root", primary: "#c0415c", secondary: "#5d8a47", flavor: "tall" } },
  { sku: "FRU-022", name: "Aguaymanto", category: "frutas", unit: "KG", price: 9.0, icon: { archetype: "round", primary: "#eab22a", secondary: "#e9dca0" } },
  { sku: "FRU-023", name: "Durazno", category: "frutas", unit: "KG", price: 5.0, icon: { archetype: "round", primary: "#eb8a4f", secondary: "#f3b07c", accent: LEAF_GREEN } },
  { sku: "FRU-024", name: "Membrillo", category: "frutas", unit: "KG", price: 3.8, icon: { archetype: "round", primary: "#d9c33f", secondary: "#e8d972", accent: LEAF_GREEN } },
  { sku: "FRU-025", name: "Toronja", category: "frutas", unit: "KG", price: 3.2, icon: { archetype: "citrus", primary: "#e8c23f", secondary: "#c0415c", accent: LEAF_GREEN } },
  { sku: "FRU-026", name: "Guanábana", category: "frutas", unit: "KG", price: 6.0, icon: { archetype: "root", primary: "#7fa35e", secondary: "#9fc07e", flavor: "bumpy" } },

  // ──────────────────────────── Tubérculos ────────────────────────────
  { sku: "TUB-001", name: "Papa blanca", category: "tuberculos", unit: "SACK", price: 45.0, minOrderQty: 1, icon: { archetype: "root", primary: "#c9a86a", secondary: "#ddc394", flavor: "wide" } },
  { sku: "TUB-002", name: "Papa amarilla", category: "tuberculos", unit: "SACK", price: 55.0, minOrderQty: 1, icon: { archetype: "root", primary: "#e0b23f", secondary: "#edc972", flavor: "wide" } },
  { sku: "TUB-003", name: "Papa huayro", category: "tuberculos", unit: "SACK", price: 60.0, minOrderQty: 1, icon: { archetype: "root", primary: "#9c7a5a", secondary: "#c0a37f", flavor: "bumpy" } },
  { sku: "TUB-004", name: "Camote amarillo", category: "tuberculos", unit: "KG", price: 1.8, icon: { archetype: "root", primary: "#d97a2a", secondary: "#eca15c", flavor: "tall" } },
  { sku: "TUB-005", name: "Camote morado", category: "tuberculos", unit: "KG", price: 2.2, icon: { archetype: "root", primary: "#5c3763", secondary: "#7d5884", flavor: "tall" } },
  { sku: "TUB-006", name: "Yuca", category: "tuberculos", unit: "SACK", price: 35.0, minOrderQty: 1, icon: { archetype: "root", primary: "#a9825a", secondary: "#f0ede0", flavor: "tall" } },
  { sku: "TUB-007", name: "Olluco", category: "tuberculos", unit: "KG", price: 3.0, icon: { archetype: "root", primary: "#e0c33f", secondary: "#c0415c", flavor: "bumpy" } },
  { sku: "TUB-008", name: "Oca", category: "tuberculos", unit: "KG", price: 3.2, icon: { archetype: "root", primary: "#e8a93f", secondary: "#c0415c", flavor: "bumpy" } },
  { sku: "TUB-009", name: "Mashua", category: "tuberculos", unit: "KG", price: 2.8, icon: { archetype: "root", primary: "#e0c33f", secondary: "#5c3763", flavor: "tall" } },
  { sku: "TUB-010", name: "Arracacha", category: "tuberculos", unit: "KG", price: 3.5, icon: { archetype: "root", primary: "#e9e2c6", secondary: "#d9c79a", flavor: "tall" } },
  { sku: "TUB-011", name: "Jengibre", category: "tuberculos", unit: "KG", price: 6.5, icon: { archetype: "root", primary: "#d9b36a", secondary: "#e9cf98", flavor: "bumpy" } },
  { sku: "TUB-012", name: "Ajo", category: "tuberculos", unit: "KG", price: 9.0, icon: { archetype: "bulb", primary: "#e3dbc0", secondary: "#c7b77e" } },
];
