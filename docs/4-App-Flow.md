# 4. App Flow & Operational Navigation
## AquaPureSystem v1.0
### Flujos de Usuario, Diagramas de Secuencia y Matriz de Acciones

---

## 1. Mapa de Navegación General

```mermaid
graph TD
    Start([Usuario ingresa a la Plataforma]) --> CheckAuth{¿Token JWT válido en almacenamiento?}
    
    CheckAuth -- No --> LoginScreen[/login/]
    LoginScreen -->|Ingreso de Credenciales Correctas| Authenticate[API Feathers /authentication]
    Authenticate --> SetSession[Guardar Token JWT y Datos de Usuario]
    SetSession --> MainLayout
    
    CheckAuth -- Sí --> MainLayout[Layout Principal - Sidebar & Topbar]
    
    MainLayout --> Dashboard[/dashboard/]
    MainLayout --> POS[/sales/pos - Punto de Venta Express/]
    MainLayout --> Invoices[/sales/invoices - Facturación y Cobranza/]
    MainLayout --> Returns[/sales/returns - Devoluciones y Envases/]
    MainLayout --> Products[/inventory/products - Catálogo de Productos/]
    MainLayout --> Inventory[/inventory/stock - Control de Almacenes/]
    MainLayout --> Movements[/inventory/movements - Entradas y Salidas/]
    MainLayout --> Customers[/customers - Directorio y Créditos/]
    MainLayout --> CashRegister[/finance/cash-register - Turnos y Arqueo/]
    MainLayout --> Reports[/reports - Analítica y Exportación/]
    MainLayout --> Settings[/settings - Parámetros y Auditoría/]
```

---

## 2. Diagramas de Flujo Operativo

### A. Flujo de Venta Express y Recarga de Botellones (POS)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    actor Cajero as Cajero / Vendedor
    participant Web as Frontend Nuxt 3 (POS)
    participant API as Backend Feathers.js
    participant DB as Base de Datos PostgreSQL
    participant WS as Canal WebSocket (Socket.io)

    Cliente->>Cajero: Solicita 2 Recargas de Botellón 19L y entrega 2 envases vacíos
    Cajero->>Web: Selecciona "Recarga 19L" (Qty: 2) y marca "Envases Recibidos: 2"
    Web->>Web: Calcula total a pagar (Sin cobro de envase nuevo)
    Cajero->>Web: Selecciona Método de Pago (Ej: Efectivo USD / Pago Móvil)
    Cajero->>Web: Confirma Venta [F9 - Procesar]
    
    Web->>API: POST /sales (customerId, items, paymentDetails)
    API->>DB: Inicia Transacción ACID
    API->>DB: Crea registro de Sale y SaleItems
    API->>DB: Descuenta 2 botellones llenos e incrementa 2 botellones vacíos (InventoryMovement)
    API->>DB: Registra movimiento de caja (Payment)
    API->>DB: Genera Factura / Nota de Entrega (Invoice)
    DB-->>API: Transacción Exitosa
    
    API->>WS: Emite evento 'inventory:updated' y 'sales:created'
    WS-->>Web: Notifica a todas las terminales conectadas el nuevo stock
    API-->>Web: Retorna Venta Procesada + ID de Factura
    Web->>Cajero: Despliega confirmación e imprime Ticket Térmico POS
    Cajero->>Cliente: Entrega comprobante y autoriza despacho de agua purificada
```

---

### B. Flujo de Devolución de Envases Retornables y Garantías

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    actor Operador as Operador de Planta
    participant Web as Frontend Nuxt 3 (Retornos)
    participant API as Backend Feathers.js
    participant DB as PostgreSQL

    Cliente->>Operador: Presenta botellones para devolución / reembolso de depósito
    Operador->>Web: Abre módulo "Devoluciones" y busca factura o cliente
    Operador->>Web: Registra ítems a devolver e inspecciona condición física
    alt Condición = GOOD (Buen Estado)
        Operador->>Web: Marca estado "Aprobado para Lavado y Relleno"
    else Condición = DAMAGED / CONTAMINATED
        Operador->>Web: Marca "Dañado / Baja por Merma"
    end
    
    Operador->>Web: Envía solicitud de retorno
    Web->>API: POST /returns (invoiceId, customerId, items, condition, reason)
    API->>DB: Registra Return y ReturnItems
    API->>DB: Genera InventoryMovement (Entrada a almacén de retorno o baja por merma)
    API->>DB: Genera nota de crédito o reembolso según corresponda
    API-->>Web: Retorna Devolución Registrada con Éxito
    Web->>Operador: Emite comprobante de recepción de envases
```

---

### C. Flujo de Turnos de Caja y Arqueo

```mermaid
sequenceDiagram
    autonumber
    actor Cajero
    participant Web as Frontend Nuxt 3
    participant API as Backend Feathers.js
    participant DB as PostgreSQL

    Note over Cajero, DB: APERTURA DE TURNO
    Cajero->>Web: Ingresa monto inicial de caja (Fondo en USD y Moneda Local)
    Web->>API: POST /payments (Apertura de turno / SystemSetting de caja)
    API-->>Web: Caja Abierta Exitosamente

    Note over Cajero, DB: OPERACIÓN DIARIA
    Cajero->>Web: Procesa ventas, cobros y salidas de caja autorizadas

    Note over Cajero, DB: CIERRE DE TURNO Y ARQUEO
    Cajero->>Web: Solicita "Cerrar Caja" e ingresa conteo físico de dinero
    Web->>API: Consulta balance esperado del sistema
    API->>DB: Suma ventas en efectivo, tarjetas, transferencias y pagos móviles
    API-->>Web: Retorna balance esperado
    Web->>Cajero: Muestra comparación (Esperado vs. Real) y calcula descuadre
    Cajero->>Web: Confirma Cierre de Turno
    Web->>API: POST /activity-logs & Cierre formal de turno
    Web->>Cajero: Imprime Reporte Z de Cierre de Caja
```

---

## 3. Matriz de Acciones por Botón y Ruteo

| Pantalla / Módulo | Elemento UI / Botón | Acción / Evento | Resultado / Destino |
|---|---|---|---|
| `/login` | Botón "Iniciar Sesión" | Valida credenciales contra `POST /authentication` | Guarda token JWT y navega a `/dashboard` |
| `/dashboard` | Tarjeta "Stock Crítico" | Clic en la tarjeta | Navega a `/inventory/stock?filter=low_stock` |
| `/dashboard` | Botón "Nueva Venta" | Clic en acceso directo | Navega a `/sales/pos` |
| `/sales/pos` | Grid de Producto | Clic en tarjeta de producto | Agrega ítem al carrito de venta |
| `/sales/pos` | Switch "Retorna Envase" | Toggle Sí / No | Ajusta precio restando/sumando costo de envase nuevo |
| `/sales/pos` | Botón "Cobrar [F9]" | Despliega modal de cobro multimoneda | Procesa `POST /sales` e imprime ticket |
| `/sales/invoices` | Botón "Registrar Pago" | Abre diálogo de abono a factura | Envía `POST /payments` y actualiza estado de factura |
| `/sales/returns` | Botón "Nueva Devolución" | Abre formulario de inspección de botellones | Registra `POST /returns` y movimiento de stock |
| `/inventory/stock` | Botón "Transferir Stock" | Modal de transferencia entre almacenes | Envía `POST /inventory-movements` tipo `TRANSFER_OUT/IN` |
| `/reports` | Botón "Exportar PDF" | Invoca generador jsPDF | Descarga reporte vectorial con membrete de la empresa |
| `/reports` | Botón "Exportar Excel" | Invoca exportador SheetJS (`xlsx`) | Descarga libro `.xlsx` con detalle de ventas/stock |
| Topbar | Botón "Cerrar Sesión" | Limpia almacenamiento local y desconecta Socket.io | Redirige inmediatamente a `/login` |
