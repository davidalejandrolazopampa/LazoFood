# LazoFood

Ecommerce B2B de verduras, frutas y tubérculos para cadenas de pollería y
restaurantes. No es una tienda al consumidor final: el comprador es una
empresa, con precios negociados, crédito a 15/30 días, y entrega por rutas
y ventanas horarias.

## Stack

- **Next.js 16** (App Router, React Server Components, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** + **Prisma 6** como ORM
- **Zod** para validación en el borde (formularios, Server Actions)

## Por qué el modelo de datos no es el de un ecommerce típico

Ver `prisma/schema.prisma` — los comentarios de cabecera explican cada
decisión, mínimamente:

- **`DailyPrice` es append-only**: el precio del kilo de limón cambia a
  diario; cada cambio inserta una fila nueva en vez de sobrescribir, para
  tener historial de margen y poder defender una factura ante un reclamo.
- **`CustomerPriceList`**: cada empresa cliente puede tener descuentos o
  precios fijos pactados, independientes del precio del día.
- **`OrderItem.quantityOrdered` vs `quantityDelivered`**: el producto se pesa
  recién al despachar, casi nunca coincide con lo pedido. La factura se arma
  sobre lo entregado.
- **`CreditAccount`**: línea de crédito por empresa, con bloqueo (`onHold`)
  por mora.
- **Todo monto y peso usa `Decimal`**, nunca `Float` — evita errores de
  redondeo en dinero.

## Primeros pasos

1. Instalar dependencias (ya hecho si cloneaste este estado):

   ```bash
   npm install
   ```

2. Levantar Postgres local con Docker:

   ```bash
   docker compose up -d
   ```

3. Copiar variables de entorno (ya existe un `.env` de desarrollo apuntando
   al Postgres de Docker; ajusta si usas Supabase/Neon):

   ```bash
   cp .env.example .env
   ```

4. Crear las tablas y cargar datos de ejemplo:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Levantar el sitio:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000). Sin base de datos
   conectada, la sección "Precio del día" muestra una vista previa estática
   y lo indica con una etiqueta — no rompe la página.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Aplica migraciones de Prisma |
| `npm run db:studio` | Explorador visual de la base de datos |
| `npm run db:seed` | Carga catálogo y empresa cliente de ejemplo |
| `npm test` | Corre la suite de tests una vez |
| `npm run test:watch` | Tests en modo watch |

## Tests

`src/**/*.test.ts` son tests unitarios de lógica pura (resolución de
precios, hashing de contraseñas) — no tocan la base de datos.

`tests/integration/*.test.ts` sí pegan contra la base de datos real de
`DATABASE_URL` (la misma que usa `npm run dev`), porque son el tipo de
bug que más importa en este proyecto: que el precio del día sea
append-only, que el subtotal se recalcule sobre lo entregado y no lo
pedido, que una lista de precio negociada realmente cambie lo que ve el
cliente. Cada test crea sus propios datos de prueba (RUC con prefijo
`TEST-`) y los borra al terminar. Requieren Postgres levantado y el
catálogo sembrado (`docker compose up -d && npm run db:seed`).

Para CI real, lo correcto es apuntar `DATABASE_URL` a una base
descartable en vez de la de desarrollo — hoy no hay ese aislamiento.

## Marca

`public/brand/logo.svg` es el logo reconstruido como vector a partir del
logo original (que era un raster de baja resolución). Usa la tipografía
cursiva "Alex Brush" (similar al script original) embebida en base64 dentro
del propio SVG, por lo que es un archivo autocontenido: se ve igual en
cualquier navegador o editor, sin depender de que la fuente esté instalada.

`src/app/icon.svg` es la versión reducida (solo el tomate) que Next.js sirve
automáticamente como favicon.

**Pendiente de decisión del negocio:** si la tipografía "Alex Brush" no es
exactamente la del logo original, lo correcto es que un diseñador convierta
el texto a paths con la fuente de marca real (con su licencia) en Illustrator
o Figma, y reemplace el `<text>` del wordmark por esos paths.

## Hoja de ruta

**Fase 1 — MVP transaccional**
- Catálogo con precio del día por categoría
- Carrito y checkout B2B (sin pago en línea, pedido queda "por confirmar")
- Registro de empresa + sede + usuarios
- Panel admin simple: cargar precio del día, ver pedidos

**Fase 2 — Operación real**
- Listas de precios negociadas por empresa
- Línea de crédito, estado de cuenta, bloqueo por mora
- Pesaje y ajuste de pedido al despacho (quantityDelivered)
- Rutas de reparto por zona con corte horario
- Facturación electrónica vía OSE/PSE (Nubefact/Bizlinks/Efact)
- Notificaciones de pedido y despacho por WhatsApp Business API

**Fase 3 — Crecimiento**
- Pedido recurrente / plantillas ("repetir último pedido")
- Reportes de margen y rotación por producto
- App PWA instalable para choferes (confirmación de entrega con firma/foto)
- Multi-sede por cadena con facturación consolidada
