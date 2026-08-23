# 1. Product Requirement Document (PRD)
## AquaPureSystem v1.0
### Sistema Integral de Gestión, Venta, Inventario y Facturación para Plantas Purificadoras de Agua

---

## 1. Visión General del Producto

**AquaPureSystem v1.0** es una plataforma tecnológica integral diseñada para digitalizar, optimizar y automatizar las operaciones comerciales, operativas y logísticas de **plantas purificadoras de agua, embotelladoras y centros de distribución de agua potable**.

El sistema resuelve los principales cuellos de botella de la industria hídrica:
- **Control de envases retornables**: Gestión y seguimiento de botellones y garrafones de 19L/20L, evitando pérdidas de inventario y gestionando depósitos en garantía.
- **Punto de Venta (POS) de alta velocidad**: Atención ágil en taquilla y mostrador con registro express de recargas y venta de accesorios en menos de 5 segundos.
- **Control multialmacén e inventario de consumibles**: Trazabilidad en tiempo real de productos terminados, botellones vacíos/llenos, filtros, membranas de ósmosis inversa, químicos y tapas/precintos.
- **Gestión financiera y multimoneda**: Manejo de cajas por turno con desglose de pagos en divisas (USD), moneda local (VES/pesos) y métodos electrónicos (transferencias, tarjetas, pago móvil).
- **Control de clientes y cuentas por cobrar**: Administración de cartera de clientes residenciales, comerciales e industriales con límites de crédito y plazos de pago.

---

## 2. Objetivos Principales del Sistema

1. **Gestión de Ventas y Punto de Venta (POS Express)**:
   - Registro ultra rápido de ventas en mostrador (recargas de agua, botellones nuevos, dispensadores, bombas y consumibles).
   - Generación de tickets de venta, notas de entrega y facturas en impresoras térmicas POS (58mm / 80mm) y formatos estándar.
   - Cálculo automático de canje de envase (entrega de envase vacío vs. cobro de depósito/envase nuevo).

2. **Control de Envases Retornables y Devoluciones**:
   - Seguimiento riguroso del ciclo de vida del botellón (lleno en almacén, entregado en comodato/garantía a cliente, recibido sucio/vacío, enviado a lavado y desinfección).
   - Módulo de devoluciones y garantías con inspección de condición (`GOOD`, `DAMAGED`, `EXPIRED`, `WRONG_PRODUCT`).

3. **Inventario Multialmacén y Control de Mermas**:
   - Registro de existencias en múltiples almacenes (Planta Principal, Almacén de Despacho, Vehículos de Reparto).
   - Control de movimientos de inventario (`IN`, `OUT`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`, `RETURN`, `LOSS`) con auditoría obligatoria por usuario.
   - Alertas automáticas de stock mínimo para reposición de insumos de purificación (cloro, sal para suavizador, filtros de carbón activado, sedimentos).

4. **Caja, Facturación y Control Financiero**:
   - Apertura, arqueo y cierre de caja por turno y cajero con soporte multimoneda (USD / Moneda Local).
   - Conciliación de métodos de pago: Efectivo, Tarjeta Débito/Crédito, Transferencia Bancaria, Pago Móvil y Crédito en cuenta corriente.
   - Registro de facturación con desglose de subtotales, descuentos e impuestos aplicables.

5. **Auditoría, Seguridad y Trazabilidad**:
   - Autenticación segura mediante JSON Web Tokens (JWT) con control de acceso basado en roles (RBAC).
   - Registro inmutable de logs de actividad (`ActivityLog`) que audita cada acción crítica (modificaciones de precio, anulaciones de venta, ajustes de stock).

---

## 3. Perfiles de Usuario (User Personas)

### A. Operador de Planta / Despachador
- **Rol**: Registra la entrada y salida de botellones en planta, realiza inspección física de envases y despacha pedidos.
- **Necesidades**: Interfaz simple con botones grandes, lectura rápida de códigos de barra/SKU, registro de mermas y envases defectuosos sin fricciones.

### B. Cajero / Vendedor de Mostrador
- **Rol**: Atiende clientes en taquilla, registra recargas de agua y productos de mostrador, procesa pagos y emite comprobantes.
- **Necesidades**: Flujo de cobro express, cálculo automático de vueltos/cambio multimoneda, atajos de teclado para operaciones recurrentes.

### C. Repartidor / Conductor de Ruta
- **Rol**: Realiza entregas a domicilio para clientes suscritos o pedidos programados, cobra en destino y recolecta botellones vacíos.
- **Necesidades**: Consulta de pedidos asignados, registro de botellones entregados vs. recolectados y confirmación de cobro.

### D. Administrador / Gerente de Operaciones
- **Rol**: Administra catálogos de productos, listas de precios, almacenes, clientes, usuarios, límites de crédito y configuración general.
- **Necesidades**: Dashboard analítico con KPIs en tiempo real, reportes ejecutivos en PDF y Excel, auditoría de cajas e inventarios.

---

## 4. Requerimientos Funcionales por Módulo

| Módulo | Funcionalidades Clave |
|---|---|
| **Autenticación & Seguridad** | Inicio de sesión seguro con Bcrypt y JWT, roles granulares (`ADMIN`, `MANAGER`, `OPERATOR`, `VIEWER`), cierre automático de sesión y registro de logs de auditoría. |
| **Punto de Venta (POS) & Ventas** | Venta express con selector de productos frecuentes, lógica automática de recarga vs. envase nuevo, múltiples líneas de venta, descuentos porcentuales/monto, notas de venta. |
| **Envases & Retornos** | Registro de devoluciones de botellones, clasificación por condición (bueno, roto, contaminado), acreditación de depósitos en garantía o emisión de nota de crédito. |
| **Inventario & Almacenes** | Gestión de múltiples almacenes, transferencias entre depósitos, ajustes manuales justificados, cálculo de stock disponible vs. reservado, alertas de stock crítico. |
| **Clientes & Cuentas por Cobrar** | Directorio de clientes con clasificación (residencial, comercial, institucional), asignación de límites de crédito, consulta de historial de compras y saldo pendiente. |
| **Facturación & Pagos** | Emisión de facturas (`Invoice`) con estados (`DRAFT`, `SENT`, `PAID`, `PARTIAL`, `OVERDUE`, `CANCELLED`), registro de pagos parciales o totales vinculados a turnos de caja. |
| **Caja & Tesorería** | Apertura de turno con fondo inicial, registro continuo de transacciones, arqueo ciego o asistido, cálculo de diferencias/descuadres y cierre con reporte resumen. |
| **Reportes & Analítica** | Dashboard con métricas clave (Ventas del día, Botellones llenados/recargados, Ingresos por método de pago, Alertas de stock), exportación a PDF institucional y Excel (.xlsx). |
| **Configuración del Sistema** | Parámetros globales clave-valor (tasas de cambio, datos de membrete comercial, impuestos, preferencias de impresión). |

---

## 5. Criterios de Éxito y Rendimiento (KPIs del Producto)

- **Tiempo de Registro de Venta Mostrador**: < 5 segundos para procesar una recarga estándar con cobro en efectivo o tarjeta.
- **Precisión de Inventario**: 99.5% de exactitud entre el stock físico de botellones/productos y el registrado en el sistema.
- **Cero Pérdida de Envases**: Trazabilidad del 100% de botellones entregados vs. recibidos en cada turno operativo.
- **Tiempo de Respuesta de la API**: < 150ms en consultas estándar y operaciones transaccionales.
- **Disponibilidad Operativa**: Funcionamiento fluido y reactivo con sincronización instantánea de stock vía WebSockets.
