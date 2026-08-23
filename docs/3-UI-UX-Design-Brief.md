# 3. UI/UX Design Brief
## AquaPureSystem v1.0
### Guía de Diseño Visual, Tokens Stitch MCP y Ergonomía Frontend (Nuxt 4 + Tailwind CSS)

---

## 1. Filosofía de Diseño y Estética Visual

El diseño de **AquaPureSystem v1.0** está fundamentado en los principios de **Pureza Hídrica, Claridad Visual y Eficiencia Operativa ("Hydro-Professional Modern & Ocean Flow")**, diseñado y sincronizado con el catálogo de pantallas de **Stitch MCP** (Proyecto ID: `1763080354910601744` - *AquaSystem*).

Dado que el sistema es operado tanto en oficinas administrativas como en mostradores de venta de plantas purificadoras (donde la velocidad de atención y la precisión son críticas), la interfaz prioriza:
- **Botones y Controles Táctiles Amplios**: Mínimo de 44px a 52px de área táctil para uso fluido en pantallas touch y terminales todo-en-uno de mostrador.
- **Jerarquía y Contraste Elevado**: Tipografía moderna **Inter** con excelente legibilidad en condiciones de luz intensa de planta.
- **Feedback Visual Inmediato**: Microanimaciones sutiles y badges de estado para cambios de stock en tiempo real vía WebSockets.
- **Soporte Nativo Light & Dark Mode**: Paleta clara diurna para mostradores y modo oscuro optimizado para baja fatiga visual.

---

## 2. Paleta de Colores del Sistema (Tokens Stitch MCP)

```
+-----------------------------------------------------------------------------------+
|  PRIMARY BRAND COLOR: Crystal Aqua / Pure Blue                                    |
|  Primary:           #0058bc (Sky / Pure Blue)                                     |
|  Primary Container: #0070eb (Active / Focused Action)                            |
|  Primary Fixed:     #d8e2ff (Subtle Highlight / Tag)                              |
+-----------------------------------------------------------------------------------+
|  SECONDARY & TERTIARY COLORS:                                                     |
|  Secondary:         #405f91 (Deep Oceanic Slate)                                  |
|  Secondary Container:#a6c5fe (Soft Tint Highlight)                                |
|  Tertiary:          #4c5f66 (Muted Aqua Gray)                                     |
+-----------------------------------------------------------------------------------+
|  SURFACE COLORS (Light Mode):                                                     |
|  Background:        #f7f9fb (Ultra Clean Slate)                                   |
|  Surface Card:      #ffffff (Pure White Surface)                                  |
|  Surface Container: #eceef0 (Card Elevated / Input Background)                    |
|  Borders / Outline: #717786 / #c1c6d7                                             |
+-----------------------------------------------------------------------------------+
|  SURFACE COLORS (Dark Mode):                                                      |
|  Background:        #0b1329 (Deep Navy 950)                                       |
|  Surface Card:      #111c44 (Elevated Slate Navy)                                 |
|  Surface Container: #1e293b (Card Container / Inputs)                             |
|  Borders / Outline: #334155 / #475569                                             |
+-----------------------------------------------------------------------------------+
|  SEMANTIC STATUS COLORS:                                                          |
|  Success (Stock Óptimo / Pagado / Aprobado):     #10b981 (Emerald 500)            |
|  Warning (Stock Bajo / Pendiente / Por Vencer):   #f59e0b (Amber 500)              |
|  Danger  (Sin Stock / Deuda / Dañado / Merma):    #ef4444 (Rose 500)               |
|  Info    (En Ruta / Transferencia / En Proceso):  #0284c7 (Sky 600)                |
+-----------------------------------------------------------------------------------+
```

---

## 3. Disposición Estructural de Pantallas (Layout Architecture)

Todas las vistas autenticadas en **Nuxt 4** comparten el layout maestro:

```
+-----------------------------------------------------------------------------------+
|  HEADER / TOPBAR                                                                  |
|  [Logo AquaPure] [Toggle Menu]   [Tasa USD/VES]  [🔴/🟢 WebSocket]  [User] [Salir] |
+-------------------+---------------------------------------------------------------+
|  SIDEBAR MENU     |  MAIN CONTENT AREA                                            |
|  - Dashboard      |                                                               |
|  - Ventas (POS) 🛒|  +---------------------------------------------------------+  |
|  - Facturas 📄    |  | Encabezado de Página (Título + Breadcrumbs + Acciones)  |  |
|  - Envases/Retorno|  +---------------------------------------------------------+  |
|  - Productos 📦   |  |                                                         |  |
|  - Inventario 🏭  |  | Tarjetas KPI de Resumen (Ventas, Stock, Recargas, Caja) |  |
|  - Clientes 👥    |  |                                                         |  |
|  - Caja & Turnos 💰| +---------------------------------------------------------+  |
|  - Reportes 📊    |  | Tablas Interactivas de Datos / Terminal de Venta POS    |  |
|  - Ajustes ⚙️     |  +---------------------------------------------------------+  |
+-------------------+---------------------------------------------------------------+
```

---

## 4. Biblioteca de Pantallas Diseñadas en Stitch MCP

El proyecto cuenta con las siguientes pantallas prediseñadas en **Stitch MCP (Proyecto `1763080354910601744`)**:

| Pantalla Stitch | Modo | Descripción UI |
|---|---|---|
| **Panel de Control / Dashboard** | Claro & Oscuro | KPIs en tiempo real, gráficos de ventas, niveles de tanques y accesos directos. |
| **Punto de Venta (POS Express)** | Claro | Selector de productos rápidos (Recargas 19L, botellones, dispensadores), carrito y cobro. |
| **Gestión Integral de Ventas** | Claro & Oscuro | Historial de transacciones, filtros por fecha/cliente y estados de entrega. |
| **Listado y Detalle de Facturas** | Claro & Oscuro | Visualización de facturas, desglose de impuestos, pagos asociados y exportación. |
| **Gestión de Productos** | Claro & Oscuro | Catálogo de productos con SKU, categorías, costos, precios y alertas de stock mínimo. |
| **Listado y Movimientos de Inventario** | Claro & Oscuro | Control multialmacén, transferencias de stock y registro de mermas. |
| **Gestión de Devoluciones** | Claro | Inspección de estado de botellones devueltos (`GOOD`, `DAMAGED`, `EXPIRED`). |
| **Selección y Procesamiento de Pago** | Claro | Modal multimoneda (Efectivo USD/VES, Tarjeta, Pago Móvil, Transferencia). |
| **Listado y Gestión de Usuarios** | Claro & Oscuro | Administración de usuarios, roles (Admin, Manager, Operator) y permisos. |
| **Configuración del Sistema** | Claro & Oscuro | Parámetros comerciales, tasas cambiarias, datos de empresa y membrete. |
| **Autenticación (Login, Registro, Recuperación)** | Claro & Oscuro | Vistas responsivas con validación de credenciales y feedback visual. |

---

## 5. Ergonomía y Responsive Design

1. **Terminales de Escritorio & Mostrador (> 1024px)**:
   - Sidebar visible y estática para acceso instantáneo con un solo clic.
   - Vista dividida (Grid de productos a la izquierda 65%, Ticket de venta a la derecha 35%).
2. **Tablets de Planta & Despacho (768px - 1023px)**:
   - Sidebar colapsable automática con botón hamburguesa flotante.
   - Grid de botones táctiles adaptada a 3 columnas.
3. **Dispositivos Móviles / Repartidores (< 767px)**:
   - Navegación inferior (Bottom Navigation Bar) con accesos rápidos: *Pedidos*, *Cobros*, *Retornos*, *Perfil*.
   - Formularios en columna única con inputs de alto contraste y teclados numéricos optimizados.
