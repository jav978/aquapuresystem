# 📐 Diagramas Técnicos y de Negocio — AquaPureSystem v1.0

Este directorio contiene los diagramas oficiales de arquitectura, conexión técnica, casos de uso, estructura de clases y ciclos de vida de **AquaPureSystem**.

Los archivos `.excalidraw` se pueden:
1. **Arrastrar y soltar** directamente en el editor web [excalidraw.com](https://excalidraw.com).
2. **Abrir en VS Code / Cursor / IDE** instalando la extensión oficial de Excalidraw.
3. **Modificar y regenerar** ejecutando el script [`scripts/generate_excalidraw_diagrams.py`](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/scripts/generate_excalidraw_diagrams.py).

---

## 📂 Archivos de Diagramas Excalidraw Disponibles

| Archivo Excalidraw | Descripción |
|---|---|
| [`1_arquitectura_tecnica_conexion.excalidraw`](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/diagrams/1_arquitectura_tecnica_conexion.excalidraw) | Arquitectura técnica completa: Frontend (Nuxt 4 / Vue 3 + Pinia), Transporte (REST + WebSockets), Backend (Feathers.js v5 + Clean Architecture DDD / InversifyJS / Prisma ORM) y Persistencia (PostgreSQL 16 + Redis). |
| [`2_casos_de_uso_y_clases.excalidraw`](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/diagrams/2_casos_de_uso_y_clases.excalidraw) | Diagrama de Casos de Uso con todos los actores (Cliente, Cajero, Operador Planta, Administrador) y Diagrama de Clases / Modelo de Dominio DDD (`Sale`, `Product`, `Inventory`, `Invoice`, `Return`, `CashShift`, `User`). |
| [`3_flujo_ciclo_de_vida_sistema.excalidraw`](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/diagrams/3_flujo_ciclo_de_vida_sistema.excalidraw) | Flujo del ciclo de vida de los botellones retornables de 19L (Recepción, Inspección, Lavado, Llenado, Venta, Retorno) y Flujo de Transacción POS Express atómica con impacto contable y de stock. |

---

## 1. Diagrama Técnico de Arquitectura y Conexión

```mermaid
flowchart TB
    subgraph ClientZone [" Capa Cliente / Frontend (apps/web — Nuxt 4 / Vue 3) "]
        UI["🖥️ UI & Pantallas POS (Nuxt 4 + TailwindCSS)"]
        Pinia["⚡ Estado Reactivo Pinia (auth, sales, inventory, cash)"]
        WSClient["🔌 Clientes de Red (@feathersjs/client + Socket.io)"]
        Printers["🖨️ Periféricos (Ticket Térmico POS + jsPDF + Excel)"]
        UI <--> Pinia <--> WSClient --> Printers
    end

    subgraph TransportZone [" Capa de Comunicación & Transporte "]
        REST["🌐 HTTP / REST API (JSON) - Auth, CRUD, Reportes"]
        WS["⚡ WebSockets (Socket.io) - Stock en Vivo & Alertas"]
    end

    subgraph BackendZone [" Capa Backend (apps/api — Feathers.js v5 Dove) "]
        direction TB
        subgraph Svc [" 1. Services & Hooks "]
            Services["/sales, /invoices, /inventory, /returns, /cash-shifts, /auth"]
        end
        subgraph AppLayer [" 2. Application Layer (@aquasystem/application) "]
            UseCases["Casos de Uso (CreateSale, ProcessReturn, TransferStock, CloseCashShift)"]
            IoC["Contenedor DI (InversifyJS)"]
        end
        subgraph DomLayer [" 3. Domain Layer (@aquasystem/domain) "]
            DomainEntities["Agregados & Entidades (Sale, Product, Customer, Return, CashShift)"]
            DomainRules["Reglas de Dominio, Value Objects & Eventos"]
        end
        subgraph InfraLayer [" 4. Infrastructure Layer (@aquasystem/infrastructure) "]
            PrismaRepo["Repositorios Prisma ORM"]
            RedisAdapt["Adaptador Redis Caché & Pub/Sub"]
            LogPino["Pino Structured Logger & Validaciones Zod"]
        end
    end

    subgraph DataZone [" Capa de Persistencia & Almacenamiento "]
        Postgres[(🐘 PostgreSQL 16\nConexión Directa .env\nTablas Relacionales ACID)]
        Redis[(⚡ Redis v7\nTokens JWT, Caché Volátil\n& Sincronización Tiempo Real)]
    end

    ClientZone <--> TransportZone
    REST <--> Svc
    WS <--> Svc
    Svc --> AppLayer
    AppLayer --> DomLayer
    AppLayer --> InfraLayer
    PrismaRepo <--> Postgres
    RedisAdapt <--> Redis
```

---

## 2. Diagrama de Casos de Uso y Modelo de Clases de Dominio

### Actores del Sistema
- **👤 Cliente**: Adquiere productos, recarga botellones y devuelve envases.
- **💼 Cajero / POS**: Procesa cobros express, apertura/cierre de turnos de caja y emisión de tickets.
- **🏭 Operador de Planta**: Inspecciona condición física de envases retornados (Óptimo vs Merma) y gestiona traslados de stock.
- **👑 Administrador**: Configura parámetros, consulta métricas financieras, audita transacciones y autoriza ajustes.

### Modelo Entidad-Relación y Clases DDD

```mermaid
classDiagram
    class User {
        +string id
        +string email
        +string role
        +boolean isActive
    }

    class Customer {
        +string id
        +string code
        +string name
        +string taxId
        +Decimal creditLimit
        +Decimal balance
    }

    class Product {
        +string id
        +string sku
        +string name
        +ProductCategory category
        +UnitOfMeasure unit
        +Decimal price
        +Decimal cost
    }

    class Inventory {
        +string id
        +string productId
        +string warehouseId
        +int quantity
        +int reservedQty
    }

    class Sale {
        +string id
        +string saleNumber
        +string customerId
        +string userId
        +SaleStatus status
        +Decimal total
        +DateTime saleDate
        +addItem()
        +confirmSale()
    }

    class SaleItem {
        +string id
        +string saleId
        +string productId
        +int quantity
        +Decimal unitPrice
        +Decimal total
    }

    class Return {
        +string id
        +string returnNumber
        +string customerId
        +ReturnStatus status
        +Decimal totalRefund
    }

    class ReturnItem {
        +string id
        +string productId
        +int quantity
        +ReturnCondition condition
    }

    class CashShift {
        +string id
        +string userId
        +DateTime openedAt
        +DateTime closedAt
        +Decimal initialAmount
        +Decimal expectedAmount
        +Decimal difference
        +ShiftStatus status
    }

    User --> Sale : registra
    Customer --> Sale : compra
    Sale "1" *-- "many" SaleItem : contiene
    Product "1" -- "many" SaleItem : vendido_en
    Product "1" -- "many" Inventory : almacenado_en
    Sale --> Return : genera
    Return "1" *-- "many" ReturnItem : contiene
    User --> CashShift : opera
```

---

## 3. Flujo del Ciclo de Vida de Envases y Venta POS

```mermaid
flowchart LR
    subgraph Envases [" 🔄 Ciclo de Vida de Envases Retornables (19L) "]
        A[1. Recepción de Envase Vacío] --> B{2. ¿Inspección Física?}
        B -->|Dañado / Fisurado| C[⚠️ Baja por Merma\nRetención Depósito]
        B -->|Buen Estado| D[3. Lavado & Sanitizado\ncon Ozono]
        D --> E[4. Llenado, Sellado\ny Termoencogible]
        E --> F[5. Stock Disponible\nen Almacén Central / Camión]
        F --> G[6. Despacho / Venta POS\nal Cliente]
        G -.->|Próxima Recarga| A
    end
```

---

## 🚀 Cómo Regenerar los Archivos Excalidraw

Si deseas actualizar las dimensiones, colores o textos de los diagramas, puedes ejecutar:

```bash
python3 scripts/generate_excalidraw_diagrams.py
```
