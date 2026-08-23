# Documentación del Sistema AquaPureSystem v1.0

Bienvenido a la suite de documentación técnica, arquitectónica y funcional de **AquaPureSystem** (Sistema de Gestión, Venta, Inventario y Facturación para Plantas Purificadoras de Agua).

---

## 📚 Índice de Documentos

1. **[1. Product Requirement Document (PRD)](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/1-PRD.md)**  
   *Visión general del producto, objetivos de negocio, perfiles de usuario (User Personas), requerimientos funcionales por módulo y criterios de éxito / KPIs.*

2. **[2. Technical Requirement Document (TRD)](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/2-TRD.md)**  
   *Arquitectura del monorepo, stack tecnológico (Feathers.js v5, Nuxt 4, Prisma 5, PostgreSQL 16, Redis, Tailwind, Stitch MCP), estrategia de seguridad/RBAC y servicios API.*

3. **[3. UI/UX Design Brief](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/3-UI-UX-Design-Brief.md)**  
   *Filosofía visual (Ocean & Clean Water Flow), paleta de colores, ergonomía para punto de venta en mostrador (POS), componentes reutilizables y responsive design.*

4. **[4. App Flow & Operational Navigation](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/4-App-Flow.md)**  
   *Diagramas de navegación, flujos de secuencia operativos (Venta express de agua y canje de envase, retornos y garantías, arqueo de caja) y matriz de acciones UI.*

5. **[5. Backend Schema & Database Architecture](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/5-Backend-Schema-Architecture.md)**  
   *Diagrama Entidad-Relación (ERD Mermaid), definición de modelos Prisma, reglas de integridad referencial, transaccionalidad y modelos de dominio DDD.*

6. **[6. Implementation Plan & Delivery Roadmap](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/docs/6-Implementation-Plan.md)**  
   *Fases de desarrollo del proyecto, hoja de ruta de versiones futuras (v1.1 Despachos y Rutas, v1.2 IoT y Calidad de Agua, v2.0 Portal B2B) y matriz de control de calidad.*

---

## 🚀 Inicio Rápido de Desarrollo

Para poner en marcha el entorno de desarrollo local:

```bash
# 1. Configurar variables de entorno
cp .env.example .env

# 2. Iniciar servicios en modo desarrollo (Hot Reload)
./dev.sh

# 3. O ejecutar el entorno completo con Docker Compose
./start.sh
```

Para más detalles sobre los scripts disponibles, consulta [`SCRIPTS.md`](file:///home/jav1978/Documents/Desarrollo2026/Aplicaciones/aquapuresystem/SCRIPTS.md).
