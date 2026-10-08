import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    // Los tests de integración pegan contra la base de datos real de
    // desarrollo (no una transacción aislada por test), así que correr
    // archivos en paralelo puede chocar en restricciones de unicidad
    // (RUC, teléfono, número de pedido). Más lento, pero sin falsos
    // negativos por condiciones de carrera entre archivos.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
