// Genera public/products/<sku>.svg para cada producto en prisma/data/products.ts
// Todos comparten el mismo "marco" (fondo redondeado + sombra) para que el
// catálogo se vea como un sistema de diseño coherente, aunque cada ícono sea
// una forma distinta según el tipo de producto.
//
// Ejecutar: npx tsx scripts/generate-product-icons.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS, type IconSpec } from "../prisma/data/products";

const OUT_DIR = join(process.cwd(), "public", "products");
mkdirSync(OUT_DIR, { recursive: true });

const SIZE = 240;
const CX = SIZE / 2;
const CY = 124;

function frame(content: string, bg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
    </filter>
  </defs>
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="32" fill="${bg}" />
  <ellipse cx="${CX}" cy="198" rx="54" ry="10" fill="#1a1a1a" opacity="0.12" filter="url(#shadow)" />
  ${content}
</svg>
`;
}

function leaf(cx: number, cy: number, scale: number, color: string, rotation = 0): string {
  return `<g transform="translate(${cx} ${cy}) rotate(${rotation}) scale(${scale})">
    <path d="M0,-6 C-11,-18 -24,-13 -27,-1 C-16,-4 -8,-1 0,5 C8,-1 16,-4 27,-1 C24,-13 11,-18 0,-6 Z" fill="${color}" />
    <path d="M0,-6 L0,-16" stroke="${color}" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
  </g>`;
}

const OUTLINE = "rgba(30,22,14,0.16)";

function taperedRoot(
  cx: number,
  cy: number,
  width: number,
  height: number,
  rotation: number,
  color: string,
  invert = false
): string {
  const w = width / 2;
  const topY = cy - height / 2;
  const botY = cy + height / 2;
  const [capY, tipY] = invert ? [botY, topY] : [topY, botY];
  const dir = invert ? -1 : 1;
  return `<path transform="rotate(${rotation} ${cx} ${cy})" d="
    M ${cx - w},${capY - dir * w}
    C ${cx - w},${capY} ${cx + w},${capY} ${cx + w},${capY - dir * w}
    C ${cx + w},${cy} ${cx + w * 0.25},${tipY + dir * height * 0.12} ${cx},${tipY}
    C ${cx - w * 0.25},${tipY + dir * height * 0.12} ${cx - w},${cy} ${cx - w},${capY - dir * w}
    Z" fill="${color}" stroke="${OUTLINE}" stroke-width="1.5" />`;
}

function blob(cx: number, cy: number, r: number, color: string, bumps = 4): string {
  const circles = [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`];
  for (let i = 0; i < bumps; i++) {
    const angle = (i / bumps) * Math.PI * 2 + 0.4;
    const bx = cx + Math.cos(angle) * r * 0.72;
    const by = cy + Math.sin(angle) * r * 0.72;
    circles.push(`<circle cx="${bx}" cy="${by}" r="${r * 0.42}" fill="${color}" />`);
  }
  return `<g>${circles.join("")}</g>`;
}

function highlight(cx: number, cy: number, rx: number, ry: number, color: string): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.45" />`;
}

function renderIcon(icon: IconSpec): string {
  const { archetype, primary, secondary = primary, accent, flavor } = icon;
  const wide = flavor === "wide";
  const bumpy = flavor === "bumpy";
  const tall = flavor === "tall";

  switch (archetype) {
    case "round": {
      const rx = wide ? 58 : 50;
      const ry = wide ? 48 : 54;
      const body = bumpy
        ? blob(CX, CY, 48, primary, 5)
        : `<ellipse cx="${CX}" cy="${CY}" rx="${rx}" ry="${ry}" fill="${primary}" stroke="${OUTLINE}" stroke-width="1.5" />`;
      return `${body}
        ${highlight(CX - rx * 0.35, CY - ry * 0.4, rx * 0.35, ry * 0.25, secondary)}
        ${accent ? leaf(CX, CY - ry, 0.9, accent) : ""}`;
    }

    case "citrus": {
      const rx = 50;
      const ry = 52;
      return `<ellipse cx="${CX}" cy="${CY}" rx="${rx}" ry="${ry}" fill="${primary}" stroke="${OUTLINE}" stroke-width="1.5" />
        ${highlight(CX - 18, CY - 20, 18, 13, secondary)}
        <circle cx="${CX - 10}" cy="${CY + 6}" r="2.6" fill="${secondary}" opacity="0.6" />
        <circle cx="${CX + 14}" cy="${CY - 4}" r="2.2" fill="${secondary}" opacity="0.6" />
        <circle cx="${CX + 2}" cy="${CY + 20}" r="2" fill="${secondary}" opacity="0.6" />
        ${leaf(CX, CY - ry, 1, accent ?? "#6f9a4c")}`;
    }

    case "leafy": {
      const blades = wide ? 3 : 4;
      const scale = wide ? 1.3 : 0.95;
      let g = "";
      for (let i = 0; i < blades; i++) {
        const angle = -40 + (i * 80) / (blades - 1);
        const color = i % 2 === 0 ? primary : secondary;
        g += leaf(CX, CY, scale, color, angle);
      }
      return `<g transform="translate(0 10)">${g}</g>`;
    }

    case "root": {
      const width = wide ? 78 : tall ? 46 : 60;
      const height = wide ? 70 : tall ? 118 : 86;
      if (bumpy) {
        return `${blob(CX, CY, 42, primary, 5)}
          <circle cx="${CX - 14}" cy="${CY - 8}" r="3" fill="${secondary}" opacity="0.5" />
          <circle cx="${CX + 16}" cy="${CY + 6}" r="2.6" fill="${secondary}" opacity="0.5" />
          <circle cx="${CX - 4}" cy="${CY + 18}" r="2.4" fill="${secondary}" opacity="0.5" />`;
      }
      const rootShape = taperedRoot(CX, CY, width, height, 6, primary);
      const texture = `<path d="M${CX - width * 0.15},${CY - height * 0.25} Q${CX},${CY} ${CX - width * 0.1},${CY + height * 0.3}" stroke="${secondary}" stroke-width="2" fill="none" opacity="0.4" />`;
      return `${rootShape}${texture}${accent ? leaf(CX + width * 0.1, CY - height / 2 + 4, 0.7, accent) : ""}`;
    }

    case "pod": {
      const w = wide ? 90 : 72;
      const shape = taperedRoot(CX, CY, 30, w, 70, primary);
      let bumps = "";
      for (let i = -1; i <= 1; i++) {
        bumps += `<circle cx="${CX + i * 16}" cy="${CY - i * 4}" r="7" fill="${secondary}" opacity="0.55" transform="rotate(20 ${CX} ${CY})" />`;
      }
      return `${shape}${bumps}`;
    }

    case "cluster": {
      const positions: [number, number][] = [
        [0, -18], [-14, -4], [14, -4], [-22, 12], [-6, 14], [10, 16], [24, 10], [-12, 32], [8, 34],
      ];
      const circles = positions
        .map(([dx, dy], i) => {
          const color = i % 3 === 0 ? secondary : primary;
          return `<circle cx="${CX + dx}" cy="${CY + dy}" r="13" fill="${color}" />`;
        })
        .join("");
      return `${circles}${leaf(CX, CY - 32, 0.8, "#6f9a4c")}`;
    }

    case "cob": {
      const shape = taperedRoot(CX, CY, 46, 112, 0, primary);
      let kernels = "";
      for (let row = -4; row <= 4; row++) {
        kernels += `<ellipse cx="${CX - 14}" cy="${CY + row * 11}" rx="5" ry="4.5" fill="${secondary}" opacity="0.5" />`;
        kernels += `<ellipse cx="${CX + 14}" cy="${CY + row * 11 + 5}" rx="5" ry="4.5" fill="${secondary}" opacity="0.5" />`;
      }
      const husk1 = `<path d="M${CX - 20},${CY - 56} C${CX - 54},${CY - 30} ${CX - 50},${CY + 40} ${CX - 24},${CY + 60} C${CX - 36},${CY + 10} ${CX - 34},${CY - 30} ${CX - 20},${CY - 56} Z" fill="${accent}" />`;
      const husk2 = `<path d="M${CX + 20},${CY - 56} C${CX + 54},${CY - 30} ${CX + 50},${CY + 40} ${CX + 24},${CY + 60} C${CX + 36},${CY + 10} ${CX + 34},${CY - 30} ${CX + 20},${CY - 56} Z" fill="${accent}" />`;
      return `${husk1}${husk2}${shape}${kernels}`;
    }

    case "curved": {
      const path = `M${CX - 38},${CY + 46} C${CX - 60},${CY + 10} ${CX - 44},${CY - 48} ${CX - 4},${CY - 54} C${CX + 10},${CY - 56} ${CX + 20},${CY - 50} ${CX + 24},${CY - 44} C${CX - 6},${CY - 40} ${CX - 24},${CY + 2} ${CX - 14},${CY + 42} C${CX - 10},${CY + 56} ${CX - 28},${CY + 58} ${CX - 38},${CY + 46} Z`;
      return `<path d="${path}" fill="${primary}" />
        <path d="M${CX + 16},${CY - 48} C${CX + 24},${CY - 52} ${CX + 28},${CY - 50} ${CX + 26},${CY - 44} C${CX + 20},${CY - 44} ${CX + 16},${CY - 46} ${CX + 16},${CY - 48} Z" fill="#7a5a2f" />
        ${highlight(CX - 20, CY - 10, 10, 30, secondary)}`;
    }

    case "crowned": {
      const body = taperedRoot(CX, CY + 10, 68, 100, 0, primary);
      let texture = "";
      for (let i = -2; i <= 2; i++) {
        texture += `<path d="M${CX - 30},${CY - 16 + i * 16} Q${CX},${CY - 6 + i * 16} ${CX + 30},${CY - 16 + i * 16}" stroke="${secondary}" stroke-width="2.5" fill="none" opacity="0.5" />`;
      }
      let crown = "";
      for (let i = 0; i < 5; i++) {
        crown += leaf(CX, CY - 56, 1.1, accent ?? "#4f7a3a", -40 + i * 20);
      }
      return `${crown}${body}${texture}`;
    }

    case "bulb": {
      let cloves = "";
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * 360;
        cloves += `<g transform="rotate(${angle} ${CX} ${CY})">${taperedRoot(CX, CY - 18, 22, 46, 0, primary)}</g>`;
      }
      return `${cloves}<circle cx="${CX}" cy="${CY}" r="12" fill="${secondary}" />
        <path d="M${CX - 3},${CY - 44} L${CX - 3},${CY - 60} M${CX + 3},${CY - 42} L${CX + 5},${CY - 58}" stroke="#a9b56a" stroke-width="2.5" stroke-linecap="round" />`;
    }

    case "striped": {
      let stripes = "";
      for (let i = -2; i <= 2; i++) {
        stripes += `<path d="M${CX + i * 16},${CY - 52} Q${CX + i * 20},${CY} ${CX + i * 16},${CY + 52}" stroke="${secondary}" stroke-width="8" fill="none" opacity="0.8" />`;
      }
      return `<defs><clipPath id="clip-striped"><circle cx="${CX}" cy="${CY}" r="54" /></clipPath></defs>
        <circle cx="${CX}" cy="${CY}" r="54" fill="${primary}" stroke="${OUTLINE}" stroke-width="1.5" />
        <g clip-path="url(#clip-striped)">${stripes}</g>
        ${highlight(CX - 20, CY - 22, 16, 12, "#ffffff")}`;
    }

    case "netted": {
      let net = "";
      for (let i = -3; i <= 3; i++) {
        net += `<path d="M${CX + i * 15},${CY - 50} Q${CX},${CY} ${CX + i * 15},${CY + 50}" stroke="${secondary}" stroke-width="1.4" fill="none" opacity="0.7" />`;
        net += `<path d="M${CX - 50},${CY + i * 15} Q${CX},${CY} ${CX + 50},${CY + i * 15}" stroke="${secondary}" stroke-width="1.4" fill="none" opacity="0.5" />`;
      }
      return `<defs><clipPath id="clip-netted"><circle cx="${CX}" cy="${CY}" r="52" /></clipPath></defs>
        <circle cx="${CX}" cy="${CY}" r="52" fill="${primary}" stroke="${OUTLINE}" stroke-width="1.5" />
        <g clip-path="url(#clip-netted)">${net}</g>`;
    }

    case "cone": {
      const topW = wide ? 92 : 64;
      const shape = taperedRoot(CX, CY + 6, topW, 108, 0, primary, false);
      return `${shape}
        ${highlight(CX - topW * 0.2, CY - 24, topW * 0.18, 20, secondary)}
        ${leaf(CX, CY - 54, 0.85, accent ?? "#4f7a3a")}`;
    }

    default:
      return `<circle cx="${CX}" cy="${CY}" r="50" fill="${primary}" />`;
  }
}

let count = 0;
for (const product of PRODUCTS) {
  const svg = frame(renderIcon(product.icon), "#f2efe4");
  writeFileSync(join(OUT_DIR, `${product.sku}.svg`), svg, "utf-8");
  count++;
}

console.log(`Generados ${count} íconos de producto en ${OUT_DIR}`);
