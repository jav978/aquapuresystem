#!/usr/bin/env python3
"""
Generador de Diagramas Excalidraw para AquaPureSystem v1.0
Crea archivos .excalidraw completamente estructurados, estilizados y listos para abrir en excalidraw.com
"""

import json
import uuid
import random

def make_id():
    return str(uuid.uuid4())[:8]

class ExcalidrawBuilder:
    def __init__(self, title="Diagram"):
        self.elements = []
        self.title = title

    def add_rect(self, x, y, w, h, bg="#e7f5ff", stroke="#1971c2", stroke_width=2, stroke_style="solid", fill_style="solid", opacity=100, rounded=3):
        elem = {
            "id": make_id(),
            "type": "rectangle",
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": fill_style,
            "strokeWidth": stroke_width,
            "strokeStyle": stroke_style,
            "roughness": 1,
            "opacity": opacity,
            "groupIds": [],
            "roundness": {"type": rounded} if rounded else None,
            "seed": random.randint(10000, 99999),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False
        }
        self.elements.append(elem)
        return elem["id"]

    def add_ellipse(self, x, y, w, h, bg="#d3f9d8", stroke="#2b8a3e", stroke_width=2):
        elem = {
            "id": make_id(),
            "type": "ellipse",
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": "solid",
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "roundness": {"type": 2},
            "seed": random.randint(10000, 99999),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False
        }
        self.elements.append(elem)
        return elem["id"]

    def add_diamond(self, x, y, w, h, bg="#fff3bf", stroke="#f59f00", stroke_width=2):
        elem = {
            "id": make_id(),
            "type": "diamond",
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": "solid",
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "roundness": {"type": 2},
            "seed": random.randint(10000, 99999),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False
        }
        self.elements.append(elem)
        return elem["id"]

    def add_text(self, x, y, text, font_size=16, color="#1e293b", align="center", font_family=1):
        lines = text.split("\n")
        line_height = font_size * 1.3
        h = len(lines) * line_height
        max_len = max(len(l) for l in lines)
        w = max_len * (font_size * 0.58)

        elem = {
            "id": make_id(),
            "type": "text",
            "x": x,
            "y": y,
            "width": max(w, 40),
            "height": max(h, 20),
            "angle": 0,
            "strokeColor": color,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "roundness": None,
            "seed": random.randint(10000, 99999),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False,
            "text": text,
            "fontSize": font_size,
            "fontFamily": font_family,
            "textAlign": align,
            "verticalAlign": "middle",
            "baseline": int(font_size * 0.8),
            "containerId": None,
            "originalText": text,
            "lineHeight": 1.25
        }
        self.elements.append(elem)
        return elem["id"]

    def add_card(self, x, y, w, h, title, subtitle="", bg="#f8fafc", stroke="#334155", title_color="#0f172a", text_color="#475569", rounded=3):
        self.add_rect(x, y, w, h, bg=bg, stroke=stroke, rounded=rounded)
        if title:
            self.add_text(x + 10, y + 12, title, font_size=16, color=title_color, align="left")
        if subtitle:
            self.add_text(x + 10, y + 36, subtitle, font_size=13, color=text_color, align="left")

    def add_arrow(self, start_x, start_y, points, stroke="#1971c2", stroke_width=2, stroke_style="solid", start_arrow=None, end_arrow="arrow"):
        # points is a list of [dx, dy] relative to (start_x, start_y)
        # compute width and height
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        w = max(xs) - min(xs)
        h = max(ys) - min(ys)

        elem = {
            "id": make_id(),
            "type": "arrow",
            "x": start_x,
            "y": start_y,
            "width": max(w, 1),
            "height": max(h, 1),
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": stroke_width,
            "strokeStyle": stroke_style,
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "roundness": {"type": 2},
            "seed": random.randint(10000, 99999),
            "version": 1,
            "versionNonce": 1,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False,
            "points": points,
            "lastCommittedPoint": None,
            "startBinding": None,
            "endBinding": None,
            "startArrowhead": start_arrow,
            "endArrowhead": end_arrow
        }
        self.elements.append(elem)
        return elem["id"]

    def to_json(self):
        return {
            "type": "excalidraw",
            "version": 2,
            "source": "https://excalidraw.com",
            "elements": self.elements,
            "appState": {
                "gridSize": None,
                "viewBackgroundColor": "#ffffff"
            },
            "files": {}
        }

    def save(self, filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_json(), f, indent=2, ensure_ascii=False)
        print(f"Diagram saved successfully to {filepath}")


def generate_technical_architecture():
    d = ExcalidrawBuilder("AquaPureSystem - Diagrama Técnico de Arquitectura y Conexión")

    # Header Title
    d.add_rect(40, 30, 1260, 70, bg="#0c8599", stroke="#0b7285", rounded=3)
    d.add_text(60, 42, "AquaPureSystem v1.0 — Diagrama Técnico de Conexión & Arquitectura Global", font_size=22, color="#ffffff", align="left")
    d.add_text(60, 70, "Clean Architecture DDD | Nuxt 4 (Vue 3) + Feathers.js v5 + WebSockets + PostgreSQL + Redis", font_size=14, color="#e3fafc", align="left")

    # Layer 1: Client Layer (Frontend)
    d.add_rect(50, 130, 1240, 220, bg="#f0fdf4", stroke="#15803d", stroke_style="dashed", stroke_width=2, rounded=3)
    d.add_text(70, 145, "CAPA CLIENTE / FRONTEND (apps/web — Nuxt 4 / Vue 3 SPA/Desktop)", font_size=18, color="#166534", align="left")

    # Cards in Client Layer
    d.add_card(80, 185, 260, 140, "🖥️ UI & Pantallas POS", "• Nuxt 4 (Compatibility v4)\n• Vue 3 Composition API\n• Tailwind CSS v3.4 Design\n• Stitch MCP UI Screens", bg="#ffffff", stroke="#22c55e")
    d.add_card(370, 185, 260, 140, "⚡ Estado Reactivo (Pinia)", "• authStore (JWT & Permisos)\n• salesStore (POS Express)\n• inventoryStore (Stock)\n• cashRegisterStore (Caja)", bg="#ffffff", stroke="#22c55e")
    d.add_card(660, 185, 270, 140, "🔌 Clientes de Red", "• @feathersjs/client (REST)\n• socket.io-client (WebSockets)\n• Zod Schema Validation\n• Offline Fallback Support", bg="#ffffff", stroke="#22c55e")
    d.add_card(960, 185, 300, 140, "🖨️ Periféricos & Exportación", "• Impresora Térmica (Tickets ESC/POS)\n• jsPDF + AutoTable (Facturas)\n• XLSX SheetJS (Reportes)\n• Lector de Código de Barras", bg="#ffffff", stroke="#22c55e")

    # Inter-layer Connection / Protocol Zone
    d.add_rect(50, 375, 1240, 95, bg="#eff6ff", stroke="#3b82f6", rounded=3)
    d.add_text(70, 388, "CAPA DE COMUNICACIÓN & TRANSPORTE (Bidireccional & Baja Latencia)", font_size=16, color="#1e40af", align="left")
    d.add_card(80, 415, 560, 45, "🌐 HTTP / REST API (JSON): Autenticación, Transacciones CRUD, Paginación", "", bg="#ffffff", stroke="#3b82f6", title_color="#1e3a8a")
    d.add_card(670, 415, 590, 45, "⚡ WebSockets (Socket.io Channels): Stock en Vivo, Alertas de Caja, Eventos POS", "", bg="#ffffff", stroke="#3b82f6", title_color="#1e3a8a")

    # Arrows between Client and Transport
    d.add_arrow(210, 325, [[0, 50]], stroke="#15803d", stroke_width=2)
    d.add_arrow(500, 325, [[0, 50]], stroke="#15803d", stroke_width=2)
    d.add_arrow(795, 325, [[0, 50]], stroke="#3b82f6", stroke_width=2, start_arrow="arrow", end_arrow="arrow")

    # Layer 2: Backend Core (Feathers.js v5 + DDD Packages)
    d.add_rect(50, 495, 1240, 380, bg="#f8fafc", stroke="#0284c7", stroke_style="solid", stroke_width=2, rounded=3)
    d.add_text(70, 510, "CAPA BACKEND / SERVICIOS (apps/api — Feathers.js v5 Dove + Clean Architecture DDD)", font_size=18, color="#0369a1", align="left")

    # Sub-containers in Backend
    # 1. Transport & Hook Layer
    d.add_card(80, 545, 270, 305, "🚪 1. Services & Hooks", "• /authentication (JWT)\n• /sales & /sale-items\n• /invoices & /payments\n• /inventory & /movements\n• /returns & /return-items\n• /customers & /warehouses\n• /cash-shifts (Arqueo)\n• /reports & /audit-logs\n\n🛡️ Middleware:\n• Helmet, CORS, Compression\n• ErrorHandler & Pino Log", bg="#ffffff", stroke="#0284c7")

    # 2. Application Layer
    d.add_card(375, 545, 280, 305, "📦 2. Capa Aplicación", "(@aquasystem/application)\n\n🎯 Casos de Uso:\n• CreateSaleUseCase\n• ProcessReturnUseCase\n• TransferStockUseCase\n• OpenCashShiftUseCase\n• CloseCashShiftUseCase\n• AuditActivityUseCase\n\n💉 InversifyJS (DI Container)\n• Inyección de Dependencias\n• DTOs de Entrada / Salida\n• Interfaces de Repositorios", bg="#ffffff", stroke="#0284c7")

    # 3. Domain Layer
    d.add_card(680, 545, 280, 305, "💎 3. Capa Dominio", "(@aquasystem/domain)\n\n🏛️ Entidades & Agregados:\n• Sale (Venta con Ítems)\n• Product (Envases / Líquido)\n• Customer (Límites de Crédito)\n• Invoice & Payment\n• Return (Envases Retornables)\n• Warehouse & Inventory\n• CashShift (Arqueo Diario)\n\n🧩 Domain Events & Rules:\n• StockSuficienteSpecification\n• DescuentoEnvaseRule\n• Result<T> & ValueObjects", bg="#ffffff", stroke="#0284c7")

    # 4. Infrastructure Layer
    d.add_card(985, 545, 280, 305, "🔧 4. Capa Infraestructura", "(@aquasystem/infrastructure)\n\n🗄️ Repositorios Prisma ORM:\n• PrismaSaleRepository\n• PrismaInventoryRepository\n• PrismaCustomerRepository\n• PrismaCashShiftRepository\n\n⚡ Redis Caching Adapter:\n• RedisCacheService\n• PubSubChannelManager\n\n📝 Logging & Monitoreo:\n• PinoStructuredLogger\n• ZodDataValidators", bg="#ffffff", stroke="#0284c7")

    # Connectors between Transport and Backend
    d.add_arrow(360, 470, [[0, 75]], stroke="#0284c7", stroke_width=2)
    d.add_arrow(965, 470, [[0, 75]], stroke="#0284c7", stroke_width=2, start_arrow="arrow", end_arrow="arrow")

    # Arrows between backend packages
    d.add_arrow(350, 680, [[25, 0]], stroke="#64748b", stroke_width=2)
    d.add_arrow(655, 680, [[25, 0]], stroke="#64748b", stroke_width=2)
    d.add_arrow(960, 680, [[25, 0]], stroke="#64748b", stroke_width=2)

    # Layer 3: Persistence & Data Layer
    d.add_rect(50, 905, 1240, 190, bg="#faf5ff", stroke="#9333ea", stroke_style="dashed", stroke_width=2, rounded=3)
    d.add_text(70, 920, "CAPA DE DATOS & ALMACENAMIENTO (Persistencia ACID, Caché & Auditoría)", font_size=18, color="#7e22ce", align="left")

    d.add_card(80, 955, 560, 120, "🐘 PostgreSQL 16 (Base de Datos Primaria ACID)", "• Conexión Nativa Directa (DATABASE_URL en .env sin requerir Docker)\n• Tablas Relacionales: users, sales, products, inventory, customers, invoices, returns\n• Índices optimizados en SKU, códigos de factura y fechas para reportes inmediatos", bg="#ffffff", stroke="#9333ea")

    d.add_card(670, 955, 595, 120, "⚡ Redis v7 (Caché en Memoria, Rate Limiting & Pub/Sub)", "• Conexión Directa (REDIS_URL en .env)\n• Almacenamiento volátil de tokens de sesión JWT y blacklist\n• Sincronización instantánea de stock entre múltiples cajas POS y despacho", bg="#ffffff", stroke="#9333ea")

    # Arrows from Backend to DB
    d.add_arrow(1125, 850, [[0, 55], [-765, 55], [-765, 105]], stroke="#9333ea", stroke_width=2)
    d.add_arrow(1125, 850, [[0, 55], [-155, 55], [-155, 105]], stroke="#9333ea", stroke_width=2)

    d.save("docs/diagrams/1_arquitectura_tecnica_conexion.excalidraw")


def generate_use_cases_and_classes():
    d = ExcalidrawBuilder("AquaPureSystem - Casos de Uso y Diagrama de Clases")

    # Header
    d.add_rect(40, 30, 1340, 70, bg="#1e293b", stroke="#0f172a", rounded=3)
    d.add_text(60, 42, "AquaPureSystem v1.0 — Diagrama de Casos de Uso y Clases de Dominio (DDD)", font_size=22, color="#ffffff", align="left")
    d.add_text(60, 70, "Modelado de Actores, Procesos de Negocio y Estructura de Entidades Relacionales", font_size=14, color="#94a3b8", align="left")

    # SECTION 1: USE CASES (Left side)
    d.add_rect(40, 125, 650, 880, bg="#f0f9ff", stroke="#0284c7", rounded=3)
    d.add_text(60, 140, "DIAGRAMA DE CASOS DE USO (Actores & Procesos)", font_size=18, color="#0369a1", align="left")

    # Actors
    d.add_card(60, 180, 160, 75, "👤 Cliente", "• Minorista / Mayorista\n• Crédito & Envases", bg="#e0f2fe", stroke="#0284c7")
    d.add_card(60, 275, 160, 75, "💼 Cajero / POS", "• Registro de Ventas\n• Cobro & Arqueo", bg="#e0f2fe", stroke="#0284c7")
    d.add_card(60, 370, 160, 75, "🏭 Operador Planta", "• Retornos & Lavado\n• Control de Llenado", bg="#e0f2fe", stroke="#0284c7")
    d.add_card(60, 465, 160, 110, "👑 Administrador", "• Reportes y Finanzas\n• Configuración\n• Auditoría Global\n• Ajustes de Stock", bg="#e0f2fe", stroke="#0284c7")

    # Use Case Bubbles (Ellipses)
    d.add_ellipse(260, 175, 410, 65, bg="#dcfce7", stroke="#16a34a")
    d.add_text(280, 192, "UC1: Procesar Venta Express & Recarga (POS)\n[Cobro + Descuento Stock + Ticket]", font_size=13, color="#14532d")

    d.add_ellipse(260, 260, 410, 65, bg="#dcfce7", stroke="#16a34a")
    d.add_text(280, 277, "UC2: Devolución de Envases & Garantía\n[Inspección: Óptimo vs Merma/Dañado]", font_size=13, color="#14532d")

    d.add_ellipse(260, 345, 410, 65, bg="#dcfce7", stroke="#16a34a")
    d.add_text(280, 362, "UC3: Transferencia Multialmacén & Reparto\n[Planta Central ↔ Camiones de Despacho]", font_size=13, color="#14532d")

    d.add_ellipse(260, 430, 410, 65, bg="#dcfce7", stroke="#16a34a")
    d.add_text(280, 447, "UC4: Control de Turno de Caja & Arqueo\n[Apertura, Movimientos, Cuadre y Cierre]", font_size=13, color="#14532d")

    d.add_ellipse(260, 515, 410, 65, bg="#dcfce7", stroke="#16a34a")
    d.add_text(280, 532, "UC5: Facturación & Gestión Cuentas por Cobrar\n[Factura Fiscal, Pagos Parciales, Crédito]", font_size=13, color="#14532d")

    d.add_ellipse(260, 600, 410, 65, bg="#dcfce7", stroke="#16a34a")
    d.add_text(280, 617, "UC6: Auditoría & Reportes Financieros / BI\n[Pista de Auditoría, Exportación Excel/PDF]", font_size=13, color="#14532d")

    # Connectors between Actors and Use Cases
    d.add_arrow(220, 215, [[40, -10]], stroke="#16a34a")
    d.add_arrow(220, 310, [[40, -100]], stroke="#16a34a")
    d.add_arrow(220, 310, [[40, 140]], stroke="#16a34a")
    d.add_arrow(220, 405, [[40, -115]], stroke="#16a34a")
    d.add_arrow(220, 405, [[40, -35]], stroke="#16a34a")
    d.add_arrow(220, 510, [[40, 20]], stroke="#16a34a")
    d.add_arrow(220, 510, [[40, 110]], stroke="#16a34a")

    # Additional description box in Use Cases
    d.add_card(60, 690, 610, 290, "📋 Reglas de Negocio Clave en Casos de Uso", 
               "• Regla 1 (Venta de Recarga): Si el cliente entrega envase vacío en buen estado,\n  se factura únicamente el contenido líquido de agua purificada.\n• Regla 2 (Envase Nuevo): Si el cliente no trae envase, se factura el combo\n  (Envase Nuevo 19L + Recarga de Agua).\n• Regla 3 (Atomicity en DB): Toda venta descuenta stock de almacén activo y genera\n  un movimiento en caja bajo una sola transacción PostgreSQL.\n• Regla 4 (Arqueo Ciego / Cuadre): Al cerrar caja, el cajero ingresa el conteo físico\n  y el sistema audita diferencias automáticamente.", bg="#ffffff", stroke="#0284c7")

    # SECTION 2: DOMAIN CLASSES & ENTITY RELATIONSHIPS (Right side)
    d.add_rect(710, 125, 670, 880, bg="#faf5ff", stroke="#7e22ce", rounded=3)
    d.add_text(730, 140, "DIAGRAMA DE CLASES Y MODELO DE DOMINIO", font_size=18, color="#6b21a8", align="left")

    # Class 1: Sale & SaleItem
    d.add_card(730, 180, 300, 195, "📦 Sale (Venta / Agregado)", 
               "+ id: string (PK CUID)\n+ saleNumber: string (Unique)\n+ customerId: string (FK)\n+ userId: string (FK)\n+ status: SaleStatus\n+ subtotal / tax / discount: Decimal\n+ total: Decimal\n+ saleDate: DateTime\n--------------------------------\n+ addItem(product, qty, price)\n+ calculateTotals()\n+ confirmSale()", bg="#ffffff", stroke="#7e22ce")

    d.add_card(1060, 180, 300, 150, "📋 SaleItem", 
               "+ id: string (PK)\n+ saleId: string (FK)\n+ productId: string (FK)\n+ quantity: int\n+ unitPrice: Decimal\n+ discount: Decimal\n+ total: Decimal", bg="#ffffff", stroke="#7e22ce")

    d.add_arrow(1030, 240, [[30, 0]], stroke="#7e22ce", stroke_width=2, end_arrow="arrow")

    # Class 2: Product & Inventory
    d.add_card(730, 395, 300, 195, "💧 Product (Producto)", 
               "+ id: string (PK)\n+ sku: string (Unique)\n+ name: string\n+ category: ProductCategory\n  [WATER_BOTTLES, JUGS, FILTERS...]\n+ unit: UnitOfMeasure\n+ price: Decimal\n+ cost: Decimal\n+ minStock / maxStock: int\n+ isActive: boolean", bg="#ffffff", stroke="#7e22ce")

    d.add_card(1060, 395, 300, 195, "🏢 Inventory & Warehouse", 
               "Warehouse:\n+ id: string (PK), name, code\n\nInventory:\n+ id: string (PK)\n+ productId: string (FK)\n+ warehouseId: string (FK)\n+ quantity: int (Disponible)\n+ reservedQty: int (Comprometido)\n@@unique([productId, warehouseId])", bg="#ffffff", stroke="#7e22ce")

    d.add_arrow(1030, 480, [[30, 0]], stroke="#7e22ce", stroke_width=2, end_arrow="arrow")

    # Class 3: Invoice, Payment & Return
    d.add_card(730, 610, 300, 180, "🧾 Invoice & Payment", 
               "Invoice:\n+ id: string, invoiceNumber\n+ saleId: string (FK opcional)\n+ status: DRAFT, PAID, PARTIAL...\n+ total: Decimal\n\nPayment:\n+ id: string, amount: Decimal\n+ method: CASH, MOBILE, CARD\n+ cashShiftId: string (FK)", bg="#ffffff", stroke="#7e22ce")

    d.add_card(1060, 610, 300, 180, "🔄 Return (Devolución Envases)", 
               "+ id: string, returnNumber\n+ invoiceId: string (FK)\n+ customerId: string (FK)\n+ status: PENDING, PROCESSED...\n+ totalRefund: Decimal\n\nReturnItem:\n+ productId: string (FK)\n+ condition: GOOD, DAMAGED\n+ quantity: int", bg="#ffffff", stroke="#7e22ce")

    d.add_arrow(1030, 690, [[30, 0]], stroke="#7e22ce", stroke_width=2, end_arrow="arrow")

    # Class 4: CashShift & Customer
    d.add_card(730, 810, 300, 175, "💵 CashShift (Turno de Caja)", 
               "+ id: string (PK)\n+ userId: string (FK)\n+ openedAt: DateTime\n+ closedAt: DateTime opcional\n+ initialAmount: Decimal\n+ finalCashAmount: Decimal\n+ expectedAmount: Decimal\n+ difference: Decimal\n+ status: OPEN, CLOSED", bg="#ffffff", stroke="#7e22ce")

    d.add_card(1060, 810, 300, 175, "👥 Customer & User", 
               "Customer:\n+ id: string, code, name\n+ taxId (RIF/NIT), creditLimit\n+ balance: Decimal\n\nUser:\n+ id: string, email, passwordHash\n+ role: ADMIN, MANAGER, OPERATOR\n+ isActive: boolean", bg="#ffffff", stroke="#7e22ce")

    d.save("docs/diagrams/2_casos_de_uso_y_clases.excalidraw")


def generate_lifecycle_and_flows():
    d = ExcalidrawBuilder("AquaPureSystem - Ciclos de Vida y Flujos del Sistema")

    # Header
    d.add_rect(40, 30, 1340, 70, bg="#0f766e", stroke="#115e59", rounded=3)
    d.add_text(60, 42, "AquaPureSystem v1.0 — Flujos Operativos y Ciclos de Vida del Negocio", font_size=22, color="#ffffff", align="left")
    d.add_text(60, 70, "Ciclo Integral de Envases Retornables (19L) y Flujo de Transacción de Venta POS", font_size=14, color="#ccfbf1", align="left")

    # SECTION 1: CICLO DE VIDA DE ENVASES RETORNABLES (Top Half)
    d.add_rect(40, 120, 1340, 440, bg="#f0fdfa", stroke="#0d9488", rounded=3)
    d.add_text(60, 135, "1. CICLO DE VIDA DE BOTELLONES RETORNABLES (Economía Circular y Control de Stock)", font_size=18, color="#0f766e", align="left")

    # Step 1
    d.add_card(60, 180, 210, 130, "1️⃣ Recepción Envase", "• Cliente entrega botellón\n  vacío en punto de venta\n• O ingreso de lote nuevo\n  de botellones de fábrica", bg="#ffffff", stroke="#0d9488")

    # Step 2: Inspection (Diamond)
    d.add_diamond(310, 185, 140, 120, bg="#fef3c7", stroke="#d97706")
    d.add_text(325, 230, "2️⃣ ¿Inspección\nFísica?", font_size=13, color="#92400e")

    # Branch Merma
    d.add_card(300, 350, 160, 100, "⚠️ Merma / Baja", "• Envase fisurado / sucio\n• Registro en Almacén Merma\n• Retención de depósito", bg="#fee2e2", stroke="#ef4444", title_color="#991b1b")

    # Step 3: Washing & Disinfection
    d.add_card(490, 180, 200, 130, "3️⃣ Lavado & Sanitizado", "• Lavadora automática\n• Enjuague con ozono\n• Validación de inocuidad\n• Almacén: 'Vacíos Limpios'", bg="#ffffff", stroke="#0d9488")

    # Step 4: Filling & Capping
    d.add_card(730, 180, 200, 130, "4️⃣ Llenado & Sellado", "• Dosificación de agua purificada\n• Colocación de tapa estéril\n• Termosellado de seguridad\n• Etiquetado con lote y fecha", bg="#ffffff", stroke="#0d9488")

    # Step 5: Stock Ready
    d.add_card(970, 180, 190, 130, "5️⃣ Stock Disponible", "• Almacén Planta Central\n• O transferencia a camión\n• Disponible para venta POS\n  y distribución", bg="#dcfce7", stroke="#16a34a")

    # Step 6: Sale to Customer
    d.add_card(1190, 180, 170, 130, "6️⃣ En el Cliente", "• Consumo de agua\n• Próxima recarga o\n  devolución de envase", bg="#e0f2fe", stroke="#0284c7")

    # Arrows for Lifecycle
    d.add_arrow(270, 245, [[40, 0]], stroke="#0d9488", stroke_width=2)
    d.add_arrow(380, 305, [[0, 45]], stroke="#ef4444", stroke_width=2)
    d.add_arrow(450, 245, [[40, 0]], stroke="#0d9488", stroke_width=2)
    d.add_arrow(690, 245, [[40, 0]], stroke="#0d9488", stroke_width=2)
    d.add_arrow(930, 245, [[40, 0]], stroke="#0d9488", stroke_width=2)
    d.add_arrow(1160, 245, [[30, 0]], stroke="#0d9488", stroke_width=2)
    # Loop back from customer to reception
    d.add_arrow(1275, 310, [[0, 180], [-1110, 180], [-1110, -180]], stroke="#0d9488", stroke_width=2, stroke_style="dashed")
    d.add_text(600, 500, "🔄 Retorno del envase vacío para nueva recarga (Ciclo Continuo)", font_size=13, color="#0f766e")

    # SECTION 2: FLUJO DE TRANSACCIÓN POS EXPRESS (Bottom Half)
    d.add_rect(40, 580, 1340, 430, bg="#f8fafc", stroke="#334155", rounded=3)
    d.add_text(60, 595, "2. FLUJO DE PROCESAMIENTO DE VENTA POS EXPRESS & FACTURACIÓN", font_size=18, color="#1e293b", align="left")

    d.add_card(60, 640, 210, 130, "🛒 1. Selección POS", "• Cajero marca productos\n• Recargas 19L / Botellas\n• Indica envases recibidos\n• Calcula total a cobrar", bg="#ffffff", stroke="#475569")

    d.add_card(310, 640, 220, 130, "💳 2. Método de Pago", "• Efectivo (USD / Moneda Local)\n• Pago Móvil / Transferencia\n• Tarjeta Débito / Crédito\n• Crédito Cliente Registrado", bg="#ffffff", stroke="#475569")

    d.add_card(570, 640, 240, 130, "⚡ 3. Transacción ACID", "• Feathers.js + Prisma ORM\n• INSERT en Sales & SaleItems\n• Descuenta botellón lleno (-1)\n• Incrementa botellón vacío (+1)\n• Registra ingreso en CashShift", bg="#fef9c3", stroke="#ca8a04", title_color="#854d0e")

    d.add_card(850, 640, 230, 130, "📡 4. Emisión Tiempo Real", "• Socket.io emite evento:\n  'inventory:updated'\n  'sales:created'\n• Todas las terminales actualizan\n  su catálogo y stock al instante", bg="#eff6ff", stroke="#3b82f6", title_color="#1e40af")

    d.add_card(1120, 640, 240, 130, "🖨️ 5. Despacho & Ticket", "• Impresión de Ticket Térmico POS\n• Factura digital / PDF\n• Entrega de botellón purificado\n• Auditoría de log completada", bg="#dcfce7", stroke="#16a34a", title_color="#14532d")

    # Arrows for POS flow
    d.add_arrow(270, 705, [[40, 0]], stroke="#334155", stroke_width=2)
    d.add_arrow(530, 705, [[40, 0]], stroke="#334155", stroke_width=2)
    d.add_arrow(810, 705, [[40, 0]], stroke="#ca8a04", stroke_width=2)
    d.add_arrow(1080, 705, [[40, 0]], stroke="#3b82f6", stroke_width=2)

    # POS summary breakdown card
    d.add_card(60, 800, 1300, 190, "📊 Resumen de Impacto Contable & Operativo de Cada Venta",
               "• Balance de Stock: 1 Botellón Lleno Descontado de Almacén Activo ➔ 1 Botellón Vacío Ingresado a Depósito de Lavado.\n• Balance de Caja: Se incrementa el monto acumulado en el Turno Activo (CashShift) según la denominación de pago recibida.\n• Estado de Cuenta: Si el cliente posee línea de crédito autorizada, se actualiza su saldo pendiente en Cuentas por Cobrar.\n• Trazabilidad Inmutable: Se genera un ActivityLog con usuario, terminal, IP y timestamp para control antifraude.",
               bg="#ffffff", stroke="#334155")

    d.save("docs/diagrams/3_flujo_ciclo_de_vida_sistema.excalidraw")


if __name__ == "__main__":
    generate_technical_architecture()
    generate_use_cases_and_classes()
    generate_lifecycle_and_flows()
    print("All Excalidraw diagrams created successfully!")
