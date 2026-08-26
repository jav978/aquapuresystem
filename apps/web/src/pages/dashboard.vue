<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
            AquaPure Telemetría IoT
          </span>
          <span class="flex items-center gap-1 text-xs text-billing-green font-semibold">
            <span class="w-2 h-2 rounded-full bg-billing-green animate-pulse"></span>
            Sensores en Línea (100% Operativo)
          </span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Panel de Control & Monitoreo</h2>
        <p class="text-sm text-on-surface-variant mt-0.5">
          Supervisión hidrológica en tiempo real, telemetría IoT y balance de almacenamiento.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <button
          @click="openQuickRefillModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-lg shadow-primary/25 glow-cyan-hover transition-all active:scale-95 cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">water_drop</span>
          <span>Nueva Recarga</span>
        </button>

        <button
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm border-0"
        >
          <span class="material-symbols-outlined text-lg text-primary" :class="{ 'animate-spin': loading }">refresh</span>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Tanks 3D Visualization & Telemetry Section -->
    <div class="card-elevated p-5 sm:p-6 relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl">water_ec</span>
            <h3 class="text-lg font-bold text-on-surface">Tanques de Purificación & Almacenamiento</h3>
          </div>
          <p class="text-xs text-on-surface-variant mt-0.5">
            Seleccione un tanque para inspeccionar sus sensores de pureza, temperatura y presión en tiempo real.
          </p>
        </div>

        <!-- Global Storage Summary Badge & Quick Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="px-3.5 py-1.5 rounded-xl bg-surface-container-high/60 flex items-center gap-3 text-xs shadow-sm">
            <span class="text-on-surface-variant">Reserva Global:</span>
            <span class="font-black text-on-surface text-sm">{{ formatVolume(tanksStore.totalCurrentLiters) }} / {{ formatVolume(tanksStore.totalCapacity) }} L</span>
            <span class="px-2 py-0.5 rounded-md font-bold text-xs" :class="tanksStore.globalLevel <= 15 ? 'bg-error-red/20 text-error-red' : tanksStore.globalLevel <= 30 ? 'bg-admin-gold/20 text-admin-gold' : 'bg-primary/20 text-primary'">
              {{ tanksStore.globalLevel }}%
            </span>
          </div>

          <!-- Status Filters -->
          <div class="flex items-center gap-1 bg-surface-container p-1 rounded-xl shadow-sm text-xs">
            <button
              @click="tankFilter = 'all'"
              class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
              :class="tankFilter === 'all' ? 'bg-surface-container-high text-on-surface font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
            >
              Todos ({{ tanksStore.tanks.length }})
            </button>
            <button
              @click="tankFilter = 'critical'"
              class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1"
              :class="tankFilter === 'critical' ? 'bg-error-red/20 text-error-red font-bold shadow-sm' : 'text-on-surface-variant hover:text-error-red'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-error-red"></span>
              Crítico ({{ tanksStore.criticalCount }})
            </button>
            <button
              @click="tankFilter = 'warning'"
              class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1"
              :class="tankFilter === 'warning' ? 'bg-admin-gold/20 text-admin-gold font-bold shadow-sm' : 'text-on-surface-variant hover:text-admin-gold'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-admin-gold"></span>
              Alerta ({{ tanksStore.warningCount }})
            </button>
          </div>
        </div>
      </div>

      <!-- Tanks 3D Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        <LiquidTank3D
          v-for="tank in filteredTanks"
          :key="tank.id"
          :tank="tank"
          :selected="selectedTank?.id === tank.id"
          @select="selectTank"
          @refill="handleQuickRefill"
          @calibrate="openCalibrateModal"
        />
      </div>

      <!-- Dynamic Live Telemetry & Control Panel for Selected Tank -->
      <div v-if="selectedTank" class="mt-6 pt-6 border-t border-black/5 dark:border-white/5 relative z-10">
        <div class="bg-surface-container-high/40 rounded-2xl p-5 shadow-inner">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-xl">sensors</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-bold text-on-surface">Telemetría IoT: {{ selectedTank.name }}</h4>
                  <span class="text-[10px] px-2 py-0.5 rounded-md bg-billing-green/15 text-billing-green font-extrabold uppercase">
                    Transmisión en Vivo
                  </span>
                </div>
                <p class="text-xs text-on-surface-variant">Diagnóstico de sensores integrados de purificación e impulsión</p>
              </div>
            </div>

            <!-- Quick Telemetry Actions -->
            <div class="flex items-center gap-2">
              <button
                @click="simulatePurificationTest"
                :disabled="isTestingFlow"
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-on-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': isTestingFlow }">science</span>
                <span>{{ isTestingFlow ? 'Analizando...' : 'Test de Pureza' }}</span>
              </button>
              <button
                @click="toggleValve"
                class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                :class="valveOpen ? 'bg-billing-green/15 text-billing-green hover:bg-billing-green/25' : 'bg-error-red/15 text-error-red hover:bg-error-red/25'"
              >
                <span class="material-symbols-outlined text-sm">{{ valveOpen ? 'valve' : 'lock' }}</span>
                <span>Válvula: {{ valveOpen ? 'Abierta' : 'Cerrada' }}</span>
              </button>
            </div>
          </div>

          <!-- 4 Sensor Metrics Cards Grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <!-- Sensor 1: TDS / Purity -->
            <div class="p-3.5 rounded-xl bg-surface-container/60 flex flex-col justify-between shadow-sm">
              <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span>Pureza (TDS)</span>
                <span class="material-symbols-outlined text-cyan-400 text-sm">water_drop</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-extrabold font-mono text-on-surface">{{ tankTelemetry.tds }}</span>
                <span class="text-xs font-semibold text-on-surface-variant">ppm</span>
              </div>
              <span class="text-[10px] text-billing-green font-bold mt-1 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> Grado Alimentario Óptimo
              </span>
            </div>

            <!-- Sensor 2: Temperatura -->
            <div class="p-3.5 rounded-xl bg-surface-container/60 flex flex-col justify-between shadow-sm">
              <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span>Temperatura</span>
                <span class="material-symbols-outlined text-amber-400 text-sm">device_thermostat</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-extrabold font-mono text-on-surface">{{ tankTelemetry.temp }}</span>
                <span class="text-xs font-semibold text-on-surface-variant">°C</span>
              </div>
              <span class="text-[10px] text-on-surface-variant font-medium mt-1">
                Rango normal (15 - 22 °C)
              </span>
            </div>

            <!-- Sensor 3: Presión de Red -->
            <div class="p-3.5 rounded-xl bg-surface-container/60 flex flex-col justify-between shadow-sm">
              <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span>Presión Impulsión</span>
                <span class="material-symbols-outlined text-primary text-sm">speed</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-extrabold font-mono text-on-surface">{{ tankTelemetry.pressure }}</span>
                <span class="text-xs font-semibold text-on-surface-variant">PSI</span>
              </div>
              <span class="text-[10px] text-billing-green font-semibold mt-1">
                Presión constante
              </span>
            </div>

            <!-- Sensor 4: Caudal de Flujo -->
            <div class="p-3.5 rounded-xl bg-surface-container/60 flex flex-col justify-between shadow-sm">
              <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span>Caudal de Flujo</span>
                <span class="material-symbols-outlined text-primary text-sm">waves</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-extrabold font-mono text-on-surface">{{ valveOpen ? tankTelemetry.flowRate : 0 }}</span>
                <span class="text-xs font-semibold text-on-surface-variant">L/min</span>
              </div>
              <span class="text-[10px] text-on-surface-variant font-medium mt-1">
                {{ valveOpen ? 'Dispensado en curso' : 'Circuito cerrado' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Ventas"
        :value="kpis.totalSales"
        :change="kpis.salesChange"
        icon="shopping_cart"
        variant="primary"
      />
      <KpiCard
        title="Ingresos"
        :value="kpis.revenue"
        :change="kpis.revenueChange"
        icon="payments"
        variant="success"
        prefix="$"
      />
      <KpiCard
        title="Facturas Activas"
        :value="kpis.activeInvoices"
        :change="kpis.invoicesChange"
        icon="receipt_long"
        variant="info"
      />
      <KpiCard
        title="Alertas de Stock"
        :value="kpis.lowStockItems"
        :change="kpis.stockChange"
        icon="warning"
        variant="warning"
      />
    </div>

    <!-- Sales Trends & Quick Operations Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales Chart -->
      <div class="card-elevated p-6 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-on-surface">Tendencia de Ventas & Consumo de Agua</h3>
              <p class="text-xs text-on-surface-variant">Relación entre ingresos generados y litros despachados</p>
            </div>
            <select v-model="salesChartPeriod" class="bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer shadow-sm border-0">
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>

          <div class="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            <div
              v-for="(day, idx) in chartData"
              :key="idx"
              class="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div class="relative w-full flex items-end justify-center h-48">
                <!-- Hover Tooltip -->
                <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded-md text-[10px] font-bold text-on-surface pointer-events-none shadow-md z-30 whitespace-nowrap">
                  ${{ day.amount }} ({{ day.liters }}L)
                </div>
                <!-- Bar Container -->
                <div
                  class="w-full max-w-[28px] rounded-t-lg bg-primary/30 group-hover:bg-primary transition-all duration-300 relative overflow-hidden"
                  :style="{ height: `${(day.amount / maxChartAmount) * 100}%` }"
                >
                  <div class="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                </div>
              </div>
              <span class="text-[11px] font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
                {{ day.label }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-on-surface-variant">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-sm bg-primary"></span>
            <span>Ventas Facturadas</span>
          </div>
          <span>Total período: <strong>${{ chartTotalAmount.toLocaleString('es-LA') }}</strong></span>
        </div>
      </div>

      <!-- Quick Shortcuts & Quick Dispatch -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-on-surface mb-1">Acciones Rápidas</h3>
          <p class="text-xs text-on-surface-variant mb-4">Accesos directos a los módulos operativos</p>

          <div class="space-y-3">
            <NuxtLink
              to="/sales/invoices"
              class="p-3.5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high flex items-center justify-between transition-all group shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">receipt_long</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Nueva Factura</p>
                  <p class="text-xs text-on-surface-variant">Emitir venta y descontar agua</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </NuxtLink>

            <NuxtLink
              to="/inventory"
              class="p-3.5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high flex items-center justify-between transition-all group shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-billing-green/15 text-billing-green flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">inventory_2</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface group-hover:text-billing-green transition-colors">Catálogo de Stock</p>
                  <p class="text-xs text-on-surface-variant">Gestionar botellones e insumos</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </NuxtLink>

            <NuxtLink
              to="/users"
              class="p-3.5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high flex items-center justify-between transition-all group shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-admin-gold/15 text-admin-gold flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">group</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface group-hover:text-admin-gold transition-colors">Control de Usuarios</p>
                  <p class="text-xs text-on-surface-variant">Roles y operadores</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </NuxtLink>
          </div>
        </div>

        <div class="pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-xs text-on-surface-variant">
          <span class="material-symbols-outlined text-sm text-primary">verified</span>
          <span>AquaPure System v1.0.0 (MIT License)</span>
        </div>
      </div>
    </div>

    <!-- Modal Recarga de Tanque -->
    <div v-if="showRefillModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showRefillModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">water_drop</span>
            <div>
              <h4 class="text-lg font-bold text-on-surface">Recarga de Tanque</h4>
              <p class="text-xs text-on-surface-variant">Registrar proceso de llenado o purificación</p>
            </div>
          </div>
          <button @click="showRefillModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Inline Error Alert -->
        <div v-if="refillError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ refillError }}</span>
        </div>

        <form @submit.prevent="confirmRefill" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Seleccionar Tanque *</label>
            <select
              v-model="refillForm.tankId"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-3 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            >
              <option v-for="t in tanksStore.tanks" :key="t.id" :value="t.id">
                {{ t.name }} (Actual: {{ formatVolume(t.currentLiters) }} / {{ formatVolume(t.capacity) }} L)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tipo de Llenado</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="refillForm.mode = 'full'"
                class="py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 shadow-sm cursor-pointer"
                :class="refillForm.mode === 'full' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'"
              >
                Llenado Total (100%)
              </button>
              <button
                type="button"
                @click="refillForm.mode = 'custom'"
                class="py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 shadow-sm cursor-pointer"
                :class="refillForm.mode === 'custom' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'"
              >
                Cantidad Específica
              </button>
            </div>
          </div>

          <div v-if="refillForm.mode === 'custom'">
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Litros a Agregar *</label>
            <input
              v-model.number="refillForm.amountLiters"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Ej: 1000"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showRefillModal = false"
              class="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              Confirmar Recarga
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Calibración de Tanque -->
    <div v-if="showCalibrateModal && editingTank" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showCalibrateModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">tune</span>
            <div>
              <h4 class="text-lg font-bold text-on-surface">Calibrar Sensores</h4>
              <p class="text-xs text-on-surface-variant">{{ editingTank.name }}</p>
            </div>
          </div>
          <button @click="showCalibrateModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Inline Error Alert -->
        <div v-if="calibrateError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ calibrateError }}</span>
        </div>

        <form @submit.prevent="saveCalibration" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre del Tanque *</label>
            <input
              v-model="calibrateForm.name"
              type="text"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Tipo / Descripción *</label>
            <input
              v-model="calibrateForm.type"
              type="text"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Capacidad Total (L) *</label>
              <input
                v-model.number="calibrateForm.capacity"
                type="number"
                min="100"
                step="100"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nivel Actual (L) *</label>
              <input
                v-model.number="calibrateForm.currentLiters"
                type="number"
                min="0"
                :max="calibrateForm.capacity"
                step="10"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showCalibrateModal = false"
              class="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              Guardar Calibración
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTanksStore, type Tank } from '~/stores/tanks';
import { useToast } from '~/composables/useToast';
import {
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const tanksStore = useTanksStore();
const toast = useToast();

const loading = ref(false);
const showRefillModal = ref(false);
const showCalibrateModal = ref(false);
const editingTank = ref<Tank | null>(null);
const tankFilter = ref<'all' | 'critical' | 'warning'>('all');
const selectedTankId = ref<string>('tank-1');
const valveOpen = ref(true);
const isTestingFlow = ref(false);

const refillError = ref('');
const calibrateError = ref('');

const refillForm = ref({
  tankId: 'tank-1',
  mode: 'full' as 'full' | 'custom',
  amountLiters: 1000,
});

const calibrateForm = ref({
  name: '',
  type: '',
  capacity: 10000,
  currentLiters: 5000,
});

const selectedTank = computed(() => {
  return tanksStore.tanks.find(t => t.id === selectedTankId.value) || tanksStore.tanks[0] || null;
});

const filteredTanks = computed(() => {
  if (tankFilter.value === 'critical') {
    return tanksStore.tanks.filter(t => t.status === 'critical');
  }
  if (tankFilter.value === 'warning') {
    return tanksStore.tanks.filter(t => t.status === 'warning');
  }
  return tanksStore.tanks;
});

const selectTank = (tankId: string) => {
  selectedTankId.value = tankId;
  const tank = tanksStore.tanks.find(t => t.id === tankId);
  if (tank) {
    toast.info(`Tanque seleccionado: ${tank.name}`, 'Telemetría IoT sincronizada.');
  }
};

const toggleValve = () => {
  valveOpen.value = !valveOpen.value;
  if (valveOpen.value) {
    toast.success('Válvula abierta', `Suministro de ${selectedTank.value?.name} habilitado.`);
  } else {
    toast.warning('Válvula cerrada', `Suministro de ${selectedTank.value?.name} bloqueado preventivamente.`);
  }
};

const simulatePurificationTest = () => {
  isTestingFlow.value = true;
  toast.info('Iniciando prueba de ósmosis...', 'Analizando espectrometría y conductividad.');

  setTimeout(() => {
    isTestingFlow.value = false;
    toast.success('Test de pureza completado', 'Agua purificada al 99.8% - Grado alimentario verificado.');
  }, 1800);
};

const tankTelemetry = computed(() => {
  const tank = selectedTank.value;
  if (!tank) return { tds: 12, temp: 18.5, pressure: 42, flowRate: 14.5 };

  return {
    tds: tank.status === 'critical' ? 8 : tank.status === 'warning' ? 14 : 11,
    temp: 18.2,
    pressure: 44.5,
    flowRate: 16.2,
  };
});

// KPIs State
const kpis = ref({
  totalSales: 1284,
  salesChange: 12.5,
  revenue: 48920,
  revenueChange: 8.2,
  activeInvoices: 342,
  invoicesChange: -2.4,
  lowStockItems: 3,
  stockChange: 0,
});

// Sales Chart
const salesChartPeriod = ref('7d');
const chartData = ref([
  { label: 'Lun', amount: 3400, liters: 750 },
  { label: 'Mar', amount: 4200, liters: 920 },
  { label: 'Mié', amount: 3100, liters: 680 },
  { label: 'Jue', amount: 5600, liters: 1240 },
  { label: 'Vie', amount: 6800, liters: 1510 },
  { label: 'Sáb', amount: 7200, liters: 1600 },
  { label: 'Dom', amount: 4900, liters: 1080 },
]);

const maxChartAmount = computed(() => {
  return Math.max(...chartData.value.map(d => d.amount), 1);
});

const chartTotalAmount = computed(() => {
  return chartData.value.reduce((acc, d) => acc + d.amount, 0);
});

const formatVolume = (val: number): string => {
  return new Intl.NumberFormat('es-ES').format(Math.round(val || 0));
};

const refreshData = async () => {
  loading.value = true;
  await new Promise(r => setTimeout(r, 600));
  loading.value = false;
  toast.success('Datos actualizados', 'Telemetría y reservas sincronizadas.');
};

const openQuickRefillModal = () => {
  refillError.value = '';
  refillForm.value = {
    tankId: selectedTank.value?.id || tanksStore.tanks[0]?.id || 'tank-1',
    mode: 'full',
    amountLiters: 1000,
  };
  showRefillModal.value = true;
};

const handleQuickRefill = (tankId: string) => {
  refillError.value = '';
  refillForm.value.tankId = tankId;
  refillForm.value.mode = 'full';
  showRefillModal.value = true;
};

const confirmRefill = () => {
  refillError.value = '';
  const cleaned = sanitizeFormData(refillForm.value);

  const tankError = validateRequired(cleaned.tankId, 'El tanque');
  if (tankError) {
    refillError.value = tankError;
    return;
  }

  if (cleaned.mode === 'full') {
    tanksStore.refillTank(cleaned.tankId);
    toast.updateSuccess('Tanque', 'Tanque recargado exitosamente al 100% de su capacidad.');
  } else {
    const amountError = validatePositiveNumber(cleaned.amountLiters, 'Los litros a agregar', 1);
    if (amountError) {
      refillError.value = amountError;
      return;
    }
    tanksStore.addLitersToTank(cleaned.tankId, cleaned.amountLiters);
    toast.updateSuccess('Tanque', `Se agregaron ${formatVolume(cleaned.amountLiters)}L al tanque.`);
  }

  showRefillModal.value = false;
};

const openCalibrateModal = (tank: Tank) => {
  calibrateError.value = '';
  editingTank.value = tank;
  calibrateForm.value = {
    name: tank.name,
    type: tank.type,
    capacity: tank.capacity,
    currentLiters: tank.currentLiters,
  };
  showCalibrateModal.value = true;
};

const saveCalibration = () => {
  if (!editingTank.value) return;
  calibrateError.value = '';
  const cleaned = sanitizeFormData(calibrateForm.value);

  const nameError = validateRequired(cleaned.name, 'El nombre del tanque');
  if (nameError) {
    calibrateError.value = nameError;
    return;
  }

  const typeError = validateRequired(cleaned.type, 'El tipo de tanque');
  if (typeError) {
    calibrateError.value = typeError;
    return;
  }

  const capacityError = validatePositiveNumber(cleaned.capacity, 'La capacidad total', 100);
  if (capacityError) {
    calibrateError.value = capacityError;
    return;
  }

  const levelError = validateNonNegativeNumber(cleaned.currentLiters, 'El nivel actual');
  if (levelError) {
    calibrateError.value = levelError;
    return;
  }

  if (cleaned.currentLiters > cleaned.capacity) {
    calibrateError.value = 'El nivel actual no puede superar la capacidad máxima del tanque.';
    return;
  }

  tanksStore.calibrateTank(editingTank.value.id, {
    name: cleaned.name,
    type: cleaned.type,
    capacity: cleaned.capacity,
    currentLiters: cleaned.currentLiters,
  });

  toast.updateSuccess('Tanque', `Tanque ${cleaned.name} calibrado correctamente.`);
  showCalibrateModal.value = false;
};
</script>