// Descarga un ícono de Twemoji (twitter/twemoji, CC-BY 4.0) por cada código
// Unicode único usado en prisma/data/products.ts, y lo guarda una sola vez
// en public/products/icons/<codepoint>.svg aunque varios productos lo
// compartan (p. ej. todas las variedades de papa usan el mismo ícono).
//
// Ejecutar: npx tsx scripts/fetch-product-icons.ts

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS } from "../prisma/data/products";

const TWEMOJI_VERSION = "v14.0.3";
const BASE_URL = `https://cdn.jsdelivr.net/gh/twitter/twemoji@${TWEMOJI_VERSION}/assets/svg`;
const OUT_DIR = join(process.cwd(), "public", "products", "icons");

mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const codepoints = [...new Set(PRODUCTS.map((p) => p.emoji))];
  console.log(`Descargando ${codepoints.length} íconos únicos (twemoji ${TWEMOJI_VERSION})...`);

  let ok = 0;
  const failed: string[] = [];

  for (const cp of codepoints) {
    const outPath = join(OUT_DIR, `${cp}.svg`);
    if (existsSync(outPath)) {
      ok++;
      continue;
    }
    const url = `${BASE_URL}/${cp}.svg`;
    const res = await fetch(url);
    if (!res.ok) {
      failed.push(cp);
      console.error(`✗ ${cp} (${res.status}) — ${url}`);
      continue;
    }
    const svg = await res.text();
    writeFileSync(outPath, svg, "utf-8");
    ok++;
  }

  console.log(`Listo: ${ok}/${codepoints.length} íconos en ${OUT_DIR}`);
  if (failed.length > 0) {
    console.error(`Fallaron ${failed.length}: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main();
