# 2. Technical Requirement Document (TRD)
## AquaPureSystem v1.0
### Especificación Técnica de Arquitectura, Stack, Nuxt 4 y Servicios

---

## 1. Arquitectura General del Sistema

**AquaPureSystem** implementa una arquitectura modular de alto rendimiento basada en un **Monorepo (Turborepo + pnpm workspaces)** con separación estricta de responsabilidades bajo principios de **Clean Architecture y Domain-Driven Design (DDD)**:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|                   Nuxt 4 SPA / SSR Application (Vue 3 + Composition API)          |
|             Pinia State Stores + Tailwind CSS + Design System                     |
|             Stitch MCP UI Screens + Real-Time Subscriptions (Socket.io)           |
+----------------------------------------||-----------------------------------------+
                                         ||  HTTP REST / WebSocket (JSON)
+----------------------------------------vv-----------------------------------------+
|                                 BACKEND LAYER                                     |
|                                                                                   |
|                     Feathers.js v5 Real-Time Framework (Node.js)                  |
|   +---------------------------------------------------------------------------+   |
|   |  Services & Transport Layer (REST + Socket.io Channels)                   |   |
|   +---------------------------------------------------------------------------+   |
|   |  Application Layer (@aquasystem/application)                              |   |
|   |  - Use Cases (CreateSale, ProcessReturn, TransferStock, CloseRegister)    |   |
|   |  - Inversion of Control (InversifyJS Dependency Injection)                |   |
|   +---------------------------------------------------------------------------+   |
|   |  Domain Layer (@aquasystem/domain)                                        |   |
|   |  - Aggregates, Entities, Value Objects, Domain Events, Specifications     |   |
|   +---------------------------------------------------------------------------+   |
|   |  Infrastructure Layer (@aquasystem/infrastructure)                        |   |
|   |  - Prisma Repositories, Redis Cache Manager, Logging (Pino), Zod Adapters |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------||----------------------||----------------------+
                                    ||                      ||
+-----------------------------------vv------+        +------vv----------------------+
|             DATA LAYER                    |        |         CACHE & PUBSUB       |
|   PostgreSQL 16 (Conexión Directa .env)   |        |       Redis (Conexión .env)  |
|   Sin requerir contenedor Docker          |        |   Session tokens, caching &  |
|   Managed via Prisma ORM v5               |        |   real-time pub/sub channels |
|   Tables: users, products, inventory,     |        |                              |
|           sales, invoices, returns, etc.  |        |                              |
+-------------------------------------------+        +------------------------------+
```

---

## 2. Stack Tecnológico Elegido

### A. Capa Frontend (`apps/web`)
- **Framework Core**: **Nuxt 4 (v4.5+)** con Vue 3 (Composition API, `<script setup>`), motor Vite optimizado y compatibilidad Nuxt 4 (`compatibilityVersion: 4`, `srcDir: 'src'`).
- **Diseño UI & Pantallas**: Diseñado con **Stitch MCP** (Proyecto ID: `1763080354910601744` - *AquaSystem* / *Hydro-Professional Modern*).
- **CSS & Sistema de Estilos**: **Tailwind CSS (v3.4+)** configurado con tokens semánticos de Pureza Hídrica / Ocean Flow (`tailwind.config.ts`).
- **Gestión de Estado**: Pinia (v2.1+) con módulos reactivos para Autenticación, POS Express, Inventario y Caja.
- **Utilidades Reactivas**: `@vueuse/core` (v10.9+).
- **Cliente API & Tiempo Real**: `@feathersjs/client` + `socket.io-client` (v4.7+) para sincronización en vivo de ventas y movimientos de inventario.
- **Validación de Formularios**: Zod (v3.22+).
- **Generación de Reportes**: `jspdf` + `jspdf-autotable` para tickets térmicos y facturas; `xlsx` (SheetJS) para reportes contables.
- **Testing**: Vitest (Unit tests) + Playwright (E2E testing).

### B. Capa Backend (`apps/api`)
- **Framework Core**: Feathers.js v5 (Dove) con soporte nativo de TypeScript y WebSockets.
- **Inyección de Dependencias**: InversifyJS (v6.0+) + `reflect-metadata`.
- **ORM & Acceso a Datos**: Prisma ORM v5 (PostgreSQL Connector con conexión directa vía `DATABASE_URL`).
- **Validación de Esquemas**: Zod (v3.22+).
- **Autenticación & Criptografía**: `@feathersjs/authentication`, `@feathersjs/authentication-local`, `jsonwebtoken` (JWT), `bcryptjs`.
- **Caché & Memoria**: `ioredis` (v5.3+) con conexión directa vía `REDIS_URL`.
- **Logging & Monitoreo**: `pino` (v8.19+) con formato estructurado.
- **Seguridad HTTP**: `helmet`, `cors`, `compression`.

### C. Paquetes Compartidos (`packages/*`)
- **`@aquasystem/domain`**: Entidades ricas de negocio (`Sale`, `Product`, `Customer`, `Invoice`, `Return`, `Warehouse`, `User`), Value Objects y Eventos de Dominio.
- **`@aquasystem/application`**: Casos de uso desacoplados, DTOs de entrada/salida y contratos/interfaces (puertos).
- **`@aquasystem/infrastructure`**: Implementación de repositorios con Prisma, adaptadores de caché Redis y validadores.
- **`@aquasystem/shared-kernel`**: Clases base (`Result<T>`, `Entity<T>`, `ValueObject<T>`, `Guard`, excepciones estándar).
- **`@aquasystem/design-system`**: Componentes UI base en Vue 3 y tokens CSS compartidos.

---

## 3. Conexión Directa y Variables de Entorno (Sin Requerir Docker)

El sistema soporta ejecución **100% nativa local sin Docker**, conectándose a PostgreSQL y Redis mediante variables de entorno en `.env`:

```env
# Conexión Directa a PostgreSQL (Local o Remoto)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aquasystem?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=aquasystem

# Conexión Directa a Redis (Local o Remoto)
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Configuración API & JWT
PORT=3030
NODE_ENV=development
JWT_SECRET="aquapure-super-secret-jwt-key-min-32-chars-2026"
JWT_EXPIRES_IN="8h"

# Configuración Nuxt 4
NUXT_PUBLIC_API_URL=http://localhost:3030
NUXT_PUBLIC_WS_URL=ws://localhost:3030
```

---

## 4. Servicios Feathers y Endpoints REST / WebSocket

| Servicio Feathers | Métodos Disponibles | Descripción del Negocio |
|---|---|---|
| `/users` | `find`, `get`, `create`, `patch`, `remove` | Gestión de usuarios, roles y credenciales. |
| `/authentication` | `create`, `remove` | Inicio de sesión, emisión y revocación de JWT. |
| `/products` | `find`, `get`, `create`, `patch`, `remove` | Catálogo de productos (botellones, recargas, filtros, bombas). |
| `/warehouses` | `find`, `get`, `create`, `patch` | Gestión de sucursales, plantas y depósitos de almacenamiento. |
| `/inventory` | `find`, `get`, `patch` | Consulta de existencias por producto y almacén (stock disponible y reservado). |
| `/inventory-movements` | `find`, `get`, `create` | Registro de entradas, salidas, transferencias y mermas con auditoría. |
| `/customers` | `find`, `get`, `create`, `patch`, `remove` | Directorio de clientes, datos fiscales y límites de crédito. |
| `/sales` | `find`, `get`, `create`, `patch` | Transacciones de venta POS con afectación automática de inventario. |
| `/invoices` | `find`, `get`, `create`, `patch` | Emisión y control de facturas comerciales con estados de cobranza. |
| `/returns` | `find`, `get`, `create`, `patch` | Devoluciones de botellones y evaluación de condiciones físicas. |
| `/payments` | `find`, `get`, `create` | Registro de cobros multimoneda vinculados a facturas y cajas. |
| `/system-settings` | `find`, `get`, `create`, `patch` | Configuración global de la empresa (tasas cambiarias, membrete, IVA). |
| `/activity-logs` | `find`, `get` | Pista de auditoría del sistema para administradores. |

---

## 5. Eventos en Tiempo Real (Socket.io Channels)

El backend de Feathers.js emite eventos de mutación a través de canales Socket.io para mantener las vistas de **Nuxt 4** actualizadas instantáneamente:
- `inventory:updated`: Notifica cambios inmediatos en el stock tras una venta o transferencia.
- `sales:created`: Actualiza la lista de ventas del turno y métricas del dashboard en tiempo real.
- `returns:created`: Alerta al personal de planta sobre botellones devueltos listos para inspección/lavado.
