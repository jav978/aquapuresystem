# 6. Implementation Plan & Delivery Roadmap
## AquaPureSystem v1.0
### Plan de Implementación, Fases de Desarrollo y Roadmap de Evolución

---

## 1. Fases de Desarrollo del Sistema

```
+-----------------------------------------------------------------------------------+
|  FASE 1: ARQUITECTURA BASE Y MODELADO DDD                       [COMPLETADO]      |
|  - Estructura Monorepo (pnpm workspaces + Turborepo).                             |
|  - Paquetes @aquasystem/domain, application, infrastructure, shared-kernel.       |
|  - Esquema de base de datos relacional Prisma v5 + migraciones PostgreSQL.        |
|  - Conexión directa nativa por variables de entorno (.env) sin requerir Docker.   |
+-----------------------------------------------------------------------------------+
|  FASE 2: SERVICIOS BACKEND FEATHERS.JS & AUTENTICACIÓN          [EN EJECUCIÓN]    |
|  - Configuración de transportes REST y Socket.io con Feathers v5 Dove.            |
|  - Autenticación JWT y sistema de roles RBAC (Admin, Manager, Operator, Viewer).   |
|  - Servicios de Productos, Almacenes, Inventario y Movimientos con validación Zod.|
|  - Implementación de casos de uso para Ventas, Retornos y Pagos.                  |
+-----------------------------------------------------------------------------------+
|  FASE 3: FRONTEND NUXT 4 & EXPERIENCIA POS                      [EN EJECUCIÓN]    |
|  - Migración a Nuxt 4 (v4.5+) con Vite y Tailwind CSS 3.4+.                       |
|  - Integración de pantallas y componentes diseñados en Stitch MCP (ID: 1763080354910601744).|
|  - Módulo Punto de Venta (POS Express) con lógica de retorno de botellones.       |
|  - Vistas de Inventario, Catálogo de Productos y Clientes con Light/Dark Mode.    |
|  - Integración de Feathers Client y suscripciones en tiempo real con Socket.io.   |
+-----------------------------------------------------------------------------------+
|  FASE 4: CAJA, FACTURACIÓN Y REPORTES VECTORIALES               [PRÓXIMA]         |
|  - Módulo de Apertura, Arqueo y Cierre de Caja por turnos con cálculo multimoneda.|
|  - Emisión de comprobantes térmicos POS (58mm/80mm) y Facturas formales.          |
|  - Exportador de reportes en PDF vectorial (jsPDF) y libros Excel (.xlsx).        |
+-----------------------------------------------------------------------------------+
|  FASE 5: ASEGURAMIENTO DE CALIDAD Y OPTIMIZACIÓN                [PRÓXIMA]         |
|  - Pruebas unitarias de dominio y casos de uso con Vitest.                       |
|  - Pruebas E2E de flujos críticos de venta y retornos con Playwright.             |
|  - Ajuste de índices PostgreSQL y optimización de caché Redis.                    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Hoja de Ruta de Próximas Mejoras (Roadmap v1.1 - v2.0)

### Versión 1.1 (Q3 2026) - Módulo de Rutas y Despacho a Domicilio
1. **Asignación de Rutas y Despachos**:
   - Creación de rutas de distribución para camiones y vehículos de reparto.
   - Asignación de pedidos programados por sectores y clientes suscritos.
2. **PWA Móvil para Repartidores**:
   - Aplicación web progresiva offline-first para choferes de ruta: confirmación de entrega en tiempo real, cobro y recolección de botellones vacíos.

### Versión 1.2 (Q4 2026) - Telemetría IoT en Tanques y Calidad del Agua
1. **Monitoreo de Parámetros Físico-Químicos**:
   - Registro de mediciones de pH, sólidos disueltos totales (TDS), cloro residual y turbidez por lote de purificación.
2. **Telemetría de Niveles de Tanque de Agua Cruda y Tratada**:
   - Integración con sensores ultrasónicos de nivel vía MQTT / Webhooks para alertar sobre niveles críticos de agua.
3. **Mantenimiento Predictivo de Filtros**:
   - Alertas por volumen de agua tratada para cambio de lecho de arena, carbón activado, resina catiónica y membranas de ósmosis inversa.

### Versión 2.0 (2027) - Portal de Autoservicio y Suscripciones B2B
1. **Portal Web para Clientes y Empresas**:
   - Acceso para clientes corporativos para solicitar recargas, consultar estados de cuenta y descargar facturas electrónicas.
2. **Modelo de Suscripción Recurrente de Agua**:
   - Débito automático y entregas programadas semanales/quincenales.

---

## 3. Matriz de Verificación y Control de Calidad

| Módulo | Pruebas Automatizadas | Pruebas Manuales / Operativas | Estado |
|---|---|---|---|
| **Autenticación & RBAC** | Test de login, expiración JWT y guardias de ruta en Vitest | Intento de acceso sin token y con rol restringido | 🔄 En curso |
| **Ventas & POS Express** | Cálculo de totales, impuestos y canje de envase | Registro de venta rápida en mostrador con escáner de código | 🔄 En curso |
| **Inventario & Mermas** | Decremento transaccional de stock con Prisma | Venta de botellón y verificación de stock en Almacén Principal | 🔄 En curso |
| **Retorno de Botellones** | Validación de condiciones (`GOOD`, `DAMAGED`) | Recepción de 5 botellones (3 buenos, 2 rotos) y validación de inventario | 🔄 En curso |
| **Tiempo Real (Socket.io)**| Emisión y recepción de eventos `inventory:updated` | Modificar stock en terminal A y observar actualización en terminal B | 🔄 En curso |
| **Reportes PDF & Excel** | Generación de archivo sin errores de renderizado | Descarga y visualización de factura en PDF y Excel | ⏳ Pendiente |
| **Cierre de Caja** | Comparación de balance del sistema vs. físico | Cierre de turno con sobrante y faltante en caja | ⏳ Pendiente |
