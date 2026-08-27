# 💧 AQUAPURE SYSTEM — ESPECIFICACIÓN TÉCNICA Y ARQUITECTURA COMPLETA
## Documento Maestro de Requerimientos para Implementación / Migración Local (Python & Windows Desktop)

---

## 📋 1. RESUMEN DEL SISTEMA Y ALCANCE

**AquaPure System** es una solución integral de **Punto de Venta (POS), Control de Producción y ERP para Plantas Purificadoras y Envasadoras de Agua**.

El sistema integra en tiempo real:
1. **Control de Tanques y Autonomía Hídrica**: Monitoreo de litros de agua tratada, mermas automáticas de lavado y cálculo de autonomía.
2. **Motor Bimonetario Venezolano (USD / Bs. BCV)**: Conversión dual en vivo, arqueo de caja con vueltos exactos en ambas monedas y fijación de tasa oficial.
3. **Punto de Venta Dual (Express y Comercial)**:
   - **⚡ Modo Venta Rápida (Consumidor Final)**: Venta de mostrador en 1 clic sin fricción (`V-00000000`, `Consumidor Final`, `Venta Mostrador`).
   - **👤 Modo Cliente Registrado**: Registro fiscal completo (Natural/Jurídico con V/E/J/G, teléfono, email, dirección).
4. **Facturación Fiscal y Tickets con Código QR**: Generación de comprobantes fiscales con payload QR para verificación.
5. **Control de Modificaciones y Devoluciones con Clave de Supervisor**:
   - Corrección de montos, productos y métodos de pago post-emisión.
   - Anulaciones con decisión de bioseguridad sanitaria (reintegrar agua al tanque vs declarar merma/desecho).
6. **Historial Inmutable de Auditoría (Audit Trail)**: Registro cronológico de cambios (Estado Anterior vs Nuevo Estado, Supervisor, Operador, Timestamp y Justificación).
7. **Control de Calidad y Laboratorio**: Monitoreo de parámetros fisicoquímicos (pH, TDS, Cloro residual, Turbidez, Ozono).
8. **Mantenimiento y Sanitización**: Horómetro de lámparas UV, saturación de filtros de sedimentos, carbón activado y membranas de Ósmosis Inversa.
9. **Despacho y Rutas de Entrega**: Asignación de pedidos a choferes con control de capacidad en botellones de 20L.
10. **Arqueo de Turno y Cuadre de Caja**: Registro de apertura, ingresos por método de pago, retiros de efectivo y cierre de caja.

---

## ⚙️ 2. REGLAS DE NEGOCIO, ALGORITMOS Y FÓRMULAS MATEMÁTICAS

### 2.1. Gestión de Tanques de Agua y Mermas de Lavado

```
Capacidad Máxima del Tanque Maestro: 30.000 Litros (Configurable)
Nivel Crítico de Alerta: <= 25%
Porcentaje de Merma de Lavado/Desinfección (washWastePercentage): 15% (Rango: 10% - 20%)
```

#### A. Deducción en Venta:
Cuando se despacha agua (ej. $N$ botellones de 20L):
$$\text{Litros Agua Neta} = \sum (\text{item.waterLiters} \times \text{item.quantity})$$
$$\text{Merma de Lavado} = \text{round}\left(\text{Litros Agua Neta} \times \frac{\text{washWastePercentage}}{100}\right)$$
$$\text{Total Descontado de Planta} = \text{Litros Agua Neta} + \text{Merma de Lavado}$$
$$\text{Litros Restantes} = \max(0, \text{Litros Actuales} - \text{Total Descontado})$$

#### B. Estimación de Autonomía de Agua (Días restantes):
$$\text{Consumo Diario con Merma} = \text{Venta Promedio Diaria (L)} \times \left(1 + \frac{\text{washWastePercentage}}{100}\right)$$
$$\text{Días de Autonomía} = \frac{\text{Litros Actuales}}{\text{Consumo Diario con Merma}}$$

#### C. Bioseguridad en Devoluciones:
- **Opción A (Reintegro al Tanque):** Solo permitido si el botellón no salió del mostrador (error inmediato de digitación). Suma los litros al tanque maestro y registra un movimiento `ADJUSTMENT`.
- **Opción B (Merma / Desecho Sanitario):** Para botellones devueltos por el cliente o abiertos. **No reintegra agua al tanque** para evitar contaminación cruzada; registra un movimiento `ADJUSTMENT (Merma por devolución)`.

---

### 2.2. Motor Bimonetario (USD y Bolívares BCV)

1. **Conversión a Bolívares:**
   $$\text{Monto en VES} = \text{round}(\text{Monto en USD} \times \text{Tasa BCV}, 2)$$
2. **Conversión a Dólares:**
   $$\text{Monto en USD} = \text{round}\left(\frac{\text{Monto en VES}}{\text{Tasa BCV}}, 2\right)$$
3. **Cálculo de Vuelto / Cambio en Caja:**
   - **Si el cliente paga en Efectivo USD:**
     $$\text{Vuelto USD} = \max(0, \text{Monto Recibido USD} - \text{Total USD})$$
     $$\text{Equivalente Vuelto VES} = \text{Vuelto USD} \times \text{Tasa BCV}$$
   - **Si el cliente paga en Efectivo VES:**
     $$\text{Total Factura VES} = \text{Total USD} \times \text{Tasa BCV}$$
     $$\text{Vuelto VES} = \max(0, \text{Monto Recibido VES} - \text{Total Factura VES})$$
     $$\text{Equivalente Vuelto USD} = \frac{\text{Vuelto VES}}{\text{Tasa BCV}}$$

---

### 2.3. Algoritmo de Generación de Payload Fiscal QR

Cada factura emitida genera una cadena de texto codificada en un Código QR estándar:
```text
AQUAPURE|{NRO_FACTURA}|{DOC_CLIENTE}|{TOTAL_USD}|{TOTAL_VES}|{FECHA_YYYY-MM-DD}|{TASA_BCV}
```
*Ejemplo:*
```text
AQUAPURE|FAC-2026-004|V-18945120|14.00|874.30|2026-08-27|62.45
```

---

### 2.4. Control de Autorización por Supervisor y Auditoría Inmutable

- **PIN de Supervisor por Defecto**: `1234` (almacenado de forma configurable).
- **Acciones Protegidas**:
  1. `TRANSACTION_EDIT`: Edición de cliente, ítems, método de pago, referencia o monto de una factura emitida.
  2. `TRANSACTION_CANCEL`: Anulación total o devolución de factura con reversión contable e inventario.
- **Estructura del Registro de Auditoría (Audit Log)**:
  - `id`: Identificador único (`aud-{timestamp}`).
  - `invoiceId` / `invoiceNo`: Comprobante afectado (`FAC-2026-00X`).
  - `action`: `TRANSACTION_EDIT` | `TRANSACTION_CANCEL` | `ITEM_RETURN`.
  - `authorizedBy`: Nombre y rol del supervisor.
  - `operator`: Nombre del cajero/operador en turno.
  - `timestamp`: Fecha y hora ISO exacta.
  - `reason`: Justificación obligatoria ingresada por el supervisor.
  - `previousState`: Snapshot JSON del estado antes del cambio.
  - `newState`: Snapshot JSON del estado después del cambio.
  - `details`: Resumen textual legible de las diferencias.

---

### 2.5. Parámetros de Calidad de Agua Purificada (Estándares Sanitarios)

| Parámetro | Rango Óptimo | Unidad | Límite Crítico | Acción si Falla |
| :--- | :--- | :--- | :--- | :--- |
| **pH** | 6.8 – 7.6 | pH | < 6.5 o > 8.5 | Ajuste en lecho alcalinizante |
| **TDS (Sólidos Disueltos)** | 10 – 35 | ppm (mg/L) | > 50 ppm | Lavado químico de membranas Ósmosis |
| **Cloro Libre Residual** | 0.0 | ppm | > 0.05 ppm | Reemplazo de carbón activado |
| **Turbidez** | < 0.5 | NTU | > 1.0 NTU | Reemplazo de filtros de sedimentos |
| **Ozono Residual** | 0.2 – 0.4 | ppm | < 0.1 o > 0.5 | Calibración de venturi de ozono |
| **Conductividad** | 20 – 60 | μS/cm | > 100 μS/cm | Revisión de permeado de ósmosis |

---

## 🗄️ 3. ESQUEMA DE BASE DE DATOS (SQLITE / POSTGRESQL)

A continuación se detalla el esquema DDL listo para ser implementado en **SQLite** (óptimo para local/offline en Windows) o **PostgreSQL**:

```sql
-- 1. Clientes
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('NATURAL', 'JURIDICO')),
    doc_type TEXT NOT NULL CHECK(doc_type IN ('V', 'E', 'J', 'G')),
    doc_number TEXT NOT NULL,
    full_doc TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cliente Genérico Consumidor Final predeterminado
INSERT OR IGNORE INTO customers (id, type, doc_type, doc_number, full_doc, name, address)
VALUES ('cust-generic', 'NATURAL', 'V', '00000000', 'V-00000000', 'Consumidor Final', 'Venta Mostrador / Planta');

-- 2. Catálogo de Productos e Inventario
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Agua', 'Botellones', 'Tapas y Precintos', 'Cafetería', 'Accesorios')),
    price_usd REAL NOT NULL,
    cost_usd REAL NOT NULL DEFAULT 0.0,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    water_liters REAL NOT NULL DEFAULT 0.0,
    icon TEXT DEFAULT 'inventory_2',
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 3. Tanque Maestro de Agua
CREATE TABLE IF NOT EXISTS master_tank (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity_liters REAL NOT NULL DEFAULT 30000.0,
    current_liters REAL NOT NULL DEFAULT 24500.0,
    wash_waste_percent REAL NOT NULL DEFAULT 15.0,
    alert_threshold_percent REAL NOT NULL DEFAULT 25.0,
    average_daily_sales_liters REAL NOT NULL DEFAULT 3200.0,
    last_refill_at TIMESTAMP
);

-- 4. Movimientos del Tanque
CREATE TABLE IF NOT EXISTS tank_movements (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('DISPENSE', 'REFILL', 'WASH_WASTE', 'ADJUSTMENT')),
    liters REAL NOT NULL,
    remaining_liters REAL NOT NULL,
    reason TEXT NOT NULL,
    supplier TEXT,
    cost_usd REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Facturas / Ventas
CREATE TABLE IF NOT EXISTS sales_invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_id TEXT REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_doc TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    items_summary TEXT NOT NULL,
    water_liters REAL NOT NULL DEFAULT 0.0,
    subtotal_usd REAL NOT NULL,
    total_usd REAL NOT NULL,
    total_ves REAL NOT NULL,
    bcv_rate REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PAID', 'PENDING', 'CANCELLED', 'REFUNDED')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH_USD', 'CASH_VES', 'PAGO_MOVIL', 'TRANSFER', 'POS_CARD')),
    payment_method_label TEXT NOT NULL,
    received_amount REAL,
    change_usd REAL,
    change_ves REAL,
    bank_name TEXT,
    reference_number TEXT,
    auth_code TEXT,
    qr_payload TEXT NOT NULL,
    has_audit_logs INTEGER DEFAULT 0
);

-- 6. Detalle de Ítems por Factura
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    price_usd REAL NOT NULL,
    quantity INTEGER NOT NULL,
    water_liters REAL NOT NULL DEFAULT 0.0,
    subtotal_usd REAL NOT NULL
);

-- 7. Registro Inmutable de Auditoría (Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    invoice_no TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('TRANSACTION_EDIT', 'TRANSACTION_CANCEL', 'ITEM_RETURN')),
    action_label TEXT NOT NULL,
    authorized_by TEXT NOT NULL,
    operator TEXT NOT NULL,
    reason TEXT NOT NULL,
    previous_state_json TEXT NOT NULL,
    new_state_json TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Control de Calidad del Agua
CREATE TABLE IF NOT EXISTS water_quality_tests (
    id TEXT PRIMARY KEY,
    test_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tester_name TEXT NOT NULL,
    sample_point TEXT NOT NULL, -- Ej: "Salida Ósmosis", "Tanque Final", "Pico Llenado 1"
    ph REAL NOT NULL,
    tds_ppm REAL NOT NULL,
    chlorine_ppm REAL NOT NULL,
    turbidity_ntu REAL NOT NULL,
    ozone_ppm REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('APPROVED', 'WARNING', 'REJECTED')),
    observations TEXT
);

-- 9. Control de Mantenimiento y Filtros
CREATE TABLE IF NOT EXISTS plant_maintenance (
    id TEXT PRIMARY KEY,
    component_name TEXT NOT NULL, -- "Filtro Sedimentos 5μ", "Carbón Block", "Membrana RO 1", "Lámpara UV"
    type TEXT NOT NULL CHECK(type IN ('FILTER_REPLACEMENT', 'SANITIZATION', 'MEMBRANE_WASH', 'CALIBRATION')),
    service_date DATE NOT NULL,
    next_service_due DATE NOT NULL,
    hours_or_liters_used REAL DEFAULT 0,
    technician TEXT NOT NULL,
    cost_usd REAL DEFAULT 0,
    notes TEXT
);

-- 10. Arqueo y Cierre de Caja
CREATE TABLE IF NOT EXISTS cash_shifts (
    id TEXT PRIMARY KEY,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    cashier_name TEXT NOT NULL,
    opening_cash_usd REAL NOT NULL DEFAULT 0.0,
    opening_cash_ves REAL NOT NULL DEFAULT 0.0,
    total_sales_usd REAL DEFAULT 0.0,
    total_sales_ves REAL DEFAULT 0.0,
    total_cash_usd REAL DEFAULT 0.0,
    total_cash_ves REAL DEFAULT 0.0,
    total_pago_movil_ves REAL DEFAULT 0.0,
    total_transfer_ves REAL DEFAULT 0.0,
    total_pos_ves REAL DEFAULT 0.0,
    status TEXT NOT NULL CHECK(status IN ('OPEN', 'CLOSED')),
    notes TEXT
);
```

---

## 🖥️ 4. OPCIONES DE IMPLEMENTACIÓN EN WINDOWS (ANÁLISIS COMPARATIVO)

El usuario desea evaluar la mejor forma de ejecutar la aplicación de forma **local en Windows** (con o sin Python):

### 📊 Cuadro Comparativo de Alternativas:

| Opción | Stack Tecnológico | Nivel de Dificultad | Estética Visual / UI | Rendimiento & Packaging Windows | Recomendación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Opción A: Python + PySide6 (Qt6)** | Python 3.11+, PySide6, SQLite, QDarkTheme | Media | ⭐⭐⭐⭐ Alta (Nativa) | Excelente. Se compila con `PyInstaller` a un `.exe` único y rápido. | **Muy Recomendada** para apps 100% nativas en Python. |
| **Opción B: Python + CustomTkinter** | Python 3.11+, CustomTkinter, SQLite | Baja | ⭐⭐⭐ Buena (Moderna) | Muy ligero, `.exe` pequeño de < 35MB. | **Recomendada** si se busca máxima simplicidad y rapidez. |
| **Opción C: Python FastAPI + PyWebView** | Python Backend (FastAPI + SQLite) + Vue 3 / Tailwind frontend | Media | ⭐⭐⭐⭐⭐ Impresionante (Idéntica a la web) | Crea una ventana nativa de Windows con motor Webview2. | **La mejor si quieres mantener el diseño UI idéntico**. |
| **Opción D: Tauri o Electron Wrapper** | Rust / Node.js + SQLite local + Vue 3 | Baja | ⭐⭐⭐⭐⭐ Impresionante | Genera un `.exe` instalador directo empaquetando el código actual. | **La más rápida de desplegar** sin reescribir la interfaz. |

---

## 🐍 5. ARQUITECTURA SUGERIDA PARA PYTHON DESKTOP (PYSIDE6 O CUSTOMTKINTER)

Si se elige desarrollar el proyecto en **Python puro en Windows**, la siguiente arquitectura modular garantiza limpieza y escalabilidad:

### Estructura del Proyecto en Python:
```text
aquapure_desktop/
│
├── main.py                      # Punto de entrada de la aplicación
├── requirements.txt             # Dependencias Python
├── config.py                    # Configuración (PIN de supervisor, Tasa BCV, paths)
│
├── database/                    # Capa de Acceso a Datos
│   ├── connection.py            # SQLite connection pool
│   ├── schema.sql               # DDL de creación de tablas
│   └── seed.py                  # Carga de catálogo y cliente consumidor final
│
├── services/                    # Lógica de Negocio Pura (Independiente de la UI)
│   ├── tanks_service.py         # Cálculo de agua, mermas de 15% y autonomía
│   ├── currency_service.py      # Tasa BCV, conversiones USD/VES y vueltos
│   ├── sales_service.py         # Procesamiento de venta, stock, QR fiscal
│   ├── supervisor_service.py    # Validación de PIN y auditoría (Audit Trail)
│   ├── inventory_service.py     # Kardex, stock mínimo y reabastecimiento
│   ├── quality_service.py       # Registro y alertas de pH/TDS/Cloro
│   └── printer_service.py       # Impresión directa a ticketera térmica ESC/POS
│
├── ui/                          # Capa de Presentación (PySide6 / CustomTkinter)
│   ├── main_window.py           # Shell con Barra lateral y navegación
│   ├── views/
│   │   ├── pos_view.py          # Pantalla de Punto de Venta & Venta Rápida
│   │   ├── invoices_view.py     # Lista de Facturas y Emisión Manual
│   │   ├── tanks_view.py        # Gauges de Tanques y Autonomía
│   │   ├── inventory_view.py    # Catálogo de Productos y Stock
│   │   ├── quality_view.py      # Módulo de Control de Calidad
│   │   └── audit_view.py        # Visor de Historial de Auditoría
│   └── dialogs/
│       ├── edit_sale_dialog.py  # Modal de Corrección con PIN Supervisor
│       ├── cancel_sale_dialog.py# Modal de Anulación y Decisión de Agua
│       ├── audit_diff_dialog.py # Comparador visual Antes vs Después
│       └── receipt_dialog.py    # Vista previa e impresión con Código QR
│
└── assets/                      # Iconos, estilos QSS y recursos gráficos
```

---

## 💻 6. DEPENDENCIAS PYTHON REQUERIDAS (`requirements.txt`)

```text
# Interfaz Gráfica (Elegir PySide6 para máxima potencia empresarial)
PySide6>=6.6.0
qdarktheme>=0.1.6

# O si se prefiere CustomTkinter:
# customtkinter>=5.2.0

# Base de Datos y Utilidades
sqlite3
qrcode[pil]>=7.4.2
Pillow>=10.0.0
reportlab>=4.0.0       # Generación de facturas PDF / Tickets térmicos
python-escpos>=3.0     # Impresión directa en impresoras térmicas USB/Serial/Red
requests>=2.31.0       # Consulta automática de tasa BCV en línea
pydantic>=2.0.0        # Validación de modelos de datos
pyinstaller>=6.0.0     # Empaquetador a archivo .EXE para Windows
```

---

## 🚀 7. GUÍA PASO A PASO PARA EL AGENTE / DESARROLLADOR EN WINDOWS

1. **Instalación del Entorno**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Inicializar la Base de Datos Local**:
   - Ejecutar el script `database/seed.py` para crear el archivo local `aquapure.db`.
   - Verificar la creación del cliente predeterminado `Consumidor Final (V-00000000)`.

3. **Implementar los Servicios de Negocio (`services/`)**:
   - `currency_service.py`: Tasa BCV y conversiones.
   - `tanks_service.py`: Deducción con $15\%$ de merma y fórmula de autonomía.
   - `sales_service.py`: Procesar venta, deducir stock y generar QR fiscal `AQUAPURE|...`.
   - `supervisor_service.py`: `verify_pin()`, `edit_transaction()`, `cancel_transaction()`, `log_audit()`.

4. **Construir la Interfaz de Usuario (`ui/`)**:
   - `pos_view.py`: Selector de modo (⚡ Venta Rápida vs Cliente Registrado), carrito dinámico, cálculo en vivo de vuelto en USD y Bs.
   - `invoices_view.py`: Tabla con estados `Pagada`, `Pendiente`, `Anulada` y botones para `Imprimir QR`, `Corregir`, `Anular` y `Auditoría`.
   - `edit_sale_dialog.py` y `cancel_sale_dialog.py`: Diálogos modales que solicitan el PIN (`1234`) y motivo justificado.

5. **Empaquetar la Aplicación para Windows**:
   ```powershell
   pyinstaller --noconfirm --onedir --windowed --add-data "assets;assets" --icon "assets/icon.ico" --name "AquaPureSystem" main.py
   ```
   *El ejecutable resultante en `dist/AquaPureSystem/AquaPureSystem.exe` funciona 100% offline en cualquier PC con Windows 10/11 sin necesidad de tener Python instalado.*

---

## 📄 8. RESUMEN DEL DOCUMENTO

Este documento contiene **todas las especificaciones, modelos de datos, fórmulas matemáticas, interfaces DDL y flujos operativos** de AquaPure System. Puede ser entregado directamente a cualquier agente de IA o desarrollador en Windows para iniciar la codificación inmediata.
