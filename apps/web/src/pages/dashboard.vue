<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
            Planta de Purificación & Envasado
          </span>
          <span class="text-xs text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-billing-green">verified</span>
            Tanque Maestro Consolidado
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">Panel de Control Operativo</h2>
        <p class="text-xs sm:text-sm text-on-surface-variant mt-0.5">Control volumétrico de agua, balance de merma por lavado y proyección de cisterna.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-shrink-0">
        <button
          @click="openWashModal"
          class="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
        >
          <span class="material-symbols-outlined text-base text-primary">cleaning_services</span>
          <span>Merma & Lavado ({{ tanksStore.washWastePercentage }}%)</span>
        </button>

        <button
          @click="openRefillModal"
          class="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all glow-cyan-hover shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <span class="material-symbols-outlined text-base">local_shipping</span>
          <span>Recargar Cisterna</span>
        </button>
      </div>
    </div>

    <!-- Operational KPIs Bento Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      <!-- KPI 1: Agua en Tanque Consolidado -->
      <div class="card-elevated p-5 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold text-on-surface-variant">Agua en Tanque Maestro</span>
          <span class="p-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">water_drop</span>
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {{ formatNumber(tanksStore.masterTank.currentLiters) }} L
            </h3>
            <span
              class="text-xs font-extrabold px-2 py-0.5 rounded-lg"
              :class="tanksStore.masterTank.status === 'critical' ? 'bg-error-red/15 text-error-red' : tanksStore.masterTank.status === 'warning' ? 'bg-admin-gold/15 text-admin-gold' : 'bg-billing-green/15 text-billing-green'"
            >
              {{ tanksStore.masterTank.level }}%
            </span>
          </div>
          <div class="w-full bg-surface-container-highest rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              class="h-full transition-all duration-700 rounded-full"
              :class="tanksStore.masterTank.status === 'critical' ? 'bg-error-red' : tanksStore.masterTank.status === 'warning' ? 'bg-admin-gold' : 'bg-primary'"
              :style="{ width: `${tanksStore.masterTank.level}%` }"
            ></div>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-2">Capacidad: {{ formatNumber(tanksStore.masterTank.capacity) }} Litros</p>
        </div>
      </div>

      <!-- KPI 2: Autonomía Hídrica Estimada -->
      <div class="card-elevated p-5 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold text-on-surface-variant">Autonomía para Cisterna</span>
          <span class="p-2 rounded-xl flex items-center justify-center" :class="tanksStore.isRefillNeeded ? 'bg-error-red/15 text-error-red' : 'bg-cyan-500/10 text-cyan-400'">
            <span class="material-symbols-outlined text-lg">timelapse</span>
          </span>
        </div>
        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight" :class="tanksStore.isRefillNeeded ? 'text-error-red' : 'text-cyan-400'">
            ≈ {{ tanksStore.estimatedDaysRemaining }} Días
          </h3>
          <p class="text-xs mt-1.5 flex items-center gap-1 font-semibold" :class="tanksStore.isRefillNeeded ? 'text-error-red' : 'text-billing-green'">
            <span class="material-symbols-outlined text-sm">{{ tanksStore.isRefillNeeded ? 'warning' : 'check_circle' }}</span>
            <span>{{ tanksStore.isRefillNeeded ? 'Solicitar Cisterna Urgente' : 'Abastecimiento Estable' }}</span>
          </p>
        </div>
      </div>

      <!-- KPI 3: Merma por Lavado de Botellones -->
      <div class="card-elevated p-5 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold text-on-surface-variant">Merma / Lavado Botellones</span>
          <span class="p-2 bg-admin-gold/10 text-admin-gold rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">cleaning_services</span>
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-admin-gold tracking-tight">
              {{ tanksStore.washWastePercentage }}%
            </h3>
            <span class="text-xs text-on-surface-variant font-medium">del volumen</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-2">
            Total lavado: <strong class="text-on-surface font-mono">{{ formatNumber(tanksStore.masterTank.totalWashWasteLiters || 0) }} L</strong>
          </p>
        </div>
      </div>

      <!-- KPI 4: Ventas y Facturación del Turno -->
      <div class="card-elevated p-5 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold text-on-surface-variant">Ventas Totales</span>
          <span class="p-2 bg-billing-green/10 text-billing-green rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">payments</span>
          </span>
        </div>
        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-billing-green tracking-tight">
            $442.50
          </h3>
          <p class="text-xs text-billing-green font-mono font-bold mt-1">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(442.50)) }}
          </p>
          <p class="text-[11px] text-on-surface-variant mt-1.5">Tasa BCV: Bs. {{ currencyStore.formattedRate }}</p>
        </div>
      </div>
    </div>

    <!-- Main Tank & Operational Hub Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
      <!-- Columna Izquierda: Tanque Consolidado 3D (Xl: 5 Cols) -->
      <div class="xl:col-span-5 flex flex-col gap-4">
        <div class="card-elevated p-5 sm:p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div class="w-full flex items-center justify-between mb-2">
            <div>
              <span class="text-xs font-bold text-primary uppercase tracking-wider">Tanque Único Maestro</span>
              <h3 class="text-base sm:text-lg font-extrabold text-on-surface">{{ tanksStore.masterTank.name }}</h3>
              <p class="text-xs text-on-surface-variant">Capacidad Total: {{ formatNumber(tanksStore.masterTank.capacity) }} Litros</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-extrabold uppercase"
              :class="tanksStore.masterTank.status === 'critical' ? 'bg-error-red/15 text-error-red animate-pulse' : tanksStore.masterTank.status === 'warning' ? 'bg-admin-gold/15 text-admin-gold' : 'bg-billing-green/15 text-billing-green'"
            >
              {{ tanksStore.masterTank.status === 'critical' ? 'Crítico' : tanksStore.masterTank.status === 'warning' ? 'Alerta' : 'Óptimo' }}
            </span>
          </div>

          <!-- Componente 3D Liquid Tank -->
          <div class="w-full py-2 sm:py-4 flex justify-center">
            <LiquidTank3D
              :tank="tanksStore.masterTank"
              @refill="openRefillModal"
              @calibrate="openCapacityModal"
            />
          </div>

          <!-- Indicadores de Nivel en Litros -->
          <div class="w-full grid grid-cols-2 gap-2.5 sm:gap-3 pt-3 border-t border-black/5 dark:border-white/5 text-xs">
            <div class="p-2.5 rounded-xl bg-surface-container/60">
              <span class="text-on-surface-variant">Agua Disponible:</span>
              <p class="text-sm font-extrabold text-primary font-mono mt-0.5">
                {{ formatNumber(tanksStore.masterTank.currentLiters) }} L
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-surface-container/60">
              <span class="text-on-surface-variant">Agua Despachada:</span>
              <p class="text-sm font-extrabold text-billing-green font-mono mt-0.5">
                {{ formatNumber(tanksStore.masterTank.totalDispensedLiters) }} L
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Balance Hídrico, Alerta de Cisterna y Módulo IoT Opcional (Xl: 7 Cols) -->
      <div class="xl:col-span-7 flex flex-col gap-5 sm:gap-6">
        <!-- Tarjeta de Alerta de Cisterna & Autonomía -->
        <div
          class="card-elevated p-6 relative overflow-hidden"
          :class="tanksStore.isRefillNeeded ? 'border-2 border-error-red/40 bg-error-red/5' : 'bg-surface-container-high/30'"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                :class="tanksStore.isRefillNeeded ? 'bg-error-red/20 text-error-red' : 'bg-primary/15 text-primary'"
              >
                <span class="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <div>
                <h4 class="text-base font-bold text-on-surface">
                  {{ tanksStore.isRefillNeeded ? '¡Alerta de Cisterna Activada!' : 'Proyección de Suministro de Cisterna' }}
                </h4>
                <p class="text-xs text-on-surface-variant mt-0.5">
                  {{ tanksStore.isRefillNeeded ? 'El volumen de agua ha caído por debajo del umbral de seguridad (25%). Se recomienda llamar a la cisterna.' : 'El inventario de agua actual cubre la demanda proyectada sin riesgo de agotamiento inmediato.' }}
                </p>
              </div>
            </div>

            <button
              @click="openRefillModal"
              class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              :class="tanksStore.isRefillNeeded ? 'bg-error-red text-white hover:bg-rose-700 animate-pulse' : 'bg-primary text-on-primary glow-cyan-hover'"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Registrar Cisterna</span>
            </button>
          </div>

          <!-- Indicadores de Balance Hídrico -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-black/5 dark:border-white/5">
            <div>
              <span class="text-[11px] text-on-surface-variant">1. Entrada Cisterna:</span>
              <p class="text-xs font-bold text-on-surface mt-0.5 font-mono">+{{ formatNumber(tanksStore.totalWaterPurchased) }} L</p>
            </div>
            <div>
              <span class="text-[11px] text-on-surface-variant">2. Ventas a Clientes:</span>
              <p class="text-xs font-bold text-primary mt-0.5 font-mono">-{{ formatNumber(tanksStore.totalWaterSold) }} L</p>
            </div>
            <div>
              <span class="text-[11px] text-on-surface-variant">3. Merma Lavado ({{ tanksStore.washWastePercentage }}%):</span>
              <p class="text-xs font-bold text-admin-gold mt-0.5 font-mono">-{{ formatNumber(tanksStore.totalWaterWasted) }} L</p>
            </div>
            <div>
              <span class="text-[11px] text-on-surface-variant">4. Saldo Disponible:</span>
              <p class="text-xs font-bold text-billing-green mt-0.5 font-mono">{{ formatNumber(tanksStore.masterTank.currentLiters) }} L</p>
            </div>
          </div>
        </div>

        <!-- Módulo de Telemetría IoT Físico (Deshabilitado / Opcional) -->
        <div class="card-elevated p-6">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">sensors</span>
              <div>
                <h4 class="text-base font-bold text-on-surface">Telemetría de Sensores IoT</h4>
                <p class="text-xs text-on-surface-variant">Presión de impulsión, temperatura y pureza TDS</p>
              </div>
            </div>

            <!-- Toggle IoT Mode -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold" :class="iotEnabled ? 'text-billing-green' : 'text-on-surface-variant'">
                {{ iotEnabled ? 'Sensores Conectados' : 'Sensores Desconectados' }}
              </span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="iotEnabled" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <!-- Si los sensores están desconectados (Estado real del cliente) -->
          <div v-if="!iotEnabled" class="p-4 rounded-2xl bg-surface-container/60 text-xs text-on-surface-variant flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant/60">sensors_off</span>
            <div>
              <p class="font-bold text-on-surface">Modo de Balance Volumétrico Activo (Sin sensores físicos)</p>
              <p class="text-[11px] text-on-surface-variant mt-0.5">
                La planta opera mediante control de entradas de cisterna, ventas y porcentaje de merma de lavado. Active esta opción cuando instale sondas de TDS, sensores de presión o caudalímetros físicos.
              </p>
            </div>
          </div>

          <!-- Si el usuario habilita los sensores físicos -->
          <div v-else class="space-y-4 animate-in">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 rounded-xl bg-surface-container/80 flex flex-col justify-between">
                <span class="text-[10px] text-on-surface-variant">Pureza TDS</span>
                <p class="text-base font-extrabold text-cyan-400 font-mono">12 ppm</p>
                <span class="text-[9px] text-billing-green font-semibold">Grado Alimentario</span>
              </div>
              <div class="p-3 rounded-xl bg-surface-container/80 flex flex-col justify-between">
                <span class="text-[10px] text-on-surface-variant">Temperatura</span>
                <p class="text-base font-extrabold text-on-surface font-mono">18.4 °C</p>
                <span class="text-[9px] text-on-surface-variant">Rango Óptimo</span>
              </div>
              <div class="p-3 rounded-xl bg-surface-container/80 flex flex-col justify-between">
                <span class="text-[10px] text-on-surface-variant">Presión Impulsión</span>
                <p class="text-base font-extrabold text-on-surface font-mono">44.5 PSI</p>
                <span class="text-[9px] text-billing-green font-semibold">Bomba Estable</span>
              </div>
              <div class="p-3 rounded-xl bg-surface-container/80 flex flex-col justify-between">
                <span class="text-[10px] text-on-surface-variant">Caudal Llenado</span>
                <p class="text-base font-extrabold text-cyan-400 font-mono">16.0 L/min</p>
                <span class="text-[9px] text-billing-green font-semibold">Flujo Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Movimientos Hídricos Recientes Table -->
    <div class="card-elevated overflow-hidden">
      <div class="p-5 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-highest/30">
        <div>
          <h3 class="text-base font-bold text-on-surface">Historial de Movimientos Hídricos</h3>
          <p class="text-xs text-on-surface-variant mt-0.5">Registro de recargas de cisterna, ventas despachadas y merma de lavado</p>
        </div>
        <span class="text-xs px-3 py-1 bg-surface-container rounded-full text-on-surface-variant font-medium border-0 shadow-sm">
          {{ tanksStore.movements.length }} Registros
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Tipo</th>
              <th class="py-4 px-6">Fecha & Hora</th>
              <th class="py-4 px-6">Motivo / Concepto</th>
              <th class="py-4 px-6 text-right">Volumen</th>
              <th class="py-4 px-6 text-right">Saldo en Tanque</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr v-for="mov in tanksStore.movements" :key="mov.id" class="hover:bg-surface-container-high/40 transition-colors">
              <td class="py-4 px-6">
                <span
                  v-if="mov.type === 'REFILL'"
                  class="inline-flex items-center gap-1 text-xs font-bold text-billing-green bg-billing-green/15 px-2.5 py-1 rounded-lg"
                >
                  <span class="material-symbols-outlined text-xs">local_shipping</span>
                  Cisterna
                </span>
                <span
                  v-else-if="mov.type === 'DISPENSE'"
                  class="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-lg"
                >
                  <span class="material-symbols-outlined text-xs">shopping_bag</span>
                  Venta
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 text-xs font-bold text-admin-gold bg-admin-gold/15 px-2.5 py-1 rounded-lg"
                >
                  <span class="material-symbols-outlined text-xs">cleaning_services</span>
                  Lavado / Merma
                </span>
              </td>
              <td class="py-4 px-6 text-xs text-on-surface-variant font-medium">
                {{ formatDateTime(mov.timestamp) }}
              </td>
              <td class="py-4 px-6 text-sm text-on-surface font-semibold">
                {{ mov.reason }}
                <span v-if="mov.supplier" class="text-xs text-primary block font-normal">{{ mov.supplier }}</span>
              </td>
              <td class="py-4 px-6 text-sm text-right font-mono font-bold" :class="mov.type === 'REFILL' ? 'text-billing-green' : mov.type === 'DISPENSE' ? 'text-primary' : 'text-admin-gold'">
                {{ mov.type === 'REFILL' ? '+' : '-' }}{{ formatNumber(mov.liters) }} L
              </td>
              <td class="py-4 px-6 text-sm text-right font-mono font-bold text-on-surface">
                {{ formatNumber(mov.remainingLiters) }} L
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal 1: Recarga de Agua por Camión Cisterna -->
    <div v-if="showRefillModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showRefillModal = false"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">local_shipping</span>
            <div>
              <h4 class="text-base font-bold text-on-surface">Registrar Recarga de Cisterna</h4>
              <p class="text-xs text-on-surface-variant">Ingreso formal de agua al Tanque Consolidado</p>
            </div>
          </div>
          <button @click="showRefillModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="refillError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ refillError }}</span>
        </div>

        <form @submit.prevent="submitRefill" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Volumen de la Cisterna (Litros) *</label>
            <input
              v-model.number="refillForm.liters"
              type="number"
              min="100"
              step="100"
              required
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-bold font-mono shadow-sm"
            />
            <!-- Quick Presets -->
            <div class="flex gap-2 mt-2">
              <button
                type="button"
                @click="refillForm.liters = 10000"
                class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-container-high hover:bg-primary/20 text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                +10.000 L (Cisterna Mediana)
              </button>
              <button
                type="button"
                @click="refillForm.liters = 30000"
                class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-container-high hover:bg-primary/20 text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                +30.000 L (Cisterna Grande)
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Proveedor del Camión Cisterna *</label>
            <input
              v-model="refillForm.supplier"
              type="text"
              required
              placeholder="Ej: Cisternas HidroOriente C.A."
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Costo ($ USD)</label>
              <input
                v-model.number="refillForm.cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="120.00"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono font-bold shadow-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Equivalente BCV</label>
              <div class="h-10 px-3 py-2 bg-surface-container-high/60 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-billing-green shadow-sm">
                <span>{{ currencyStore.formatVes(currencyStore.toVes(refillForm.cost || 0)) }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showRefillModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
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

    <!-- Modal 2: Ajuste de Merma y Lavado de Botellones -->
    <div v-if="showWashModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showWashModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-admin-gold/15 text-admin-gold material-symbols-outlined">cleaning_services</span>
            <div>
              <h4 class="text-base font-bold text-on-surface">Configuración de Merma & Lavado</h4>
              <p class="text-xs text-on-surface-variant">Control del porcentaje de agua para desinfección</p>
            </div>
          </div>
          <button @click="showWashModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold text-on-surface-variant">Porcentaje de Merma Operativa (10% - 20%):</label>
              <span class="text-sm font-extrabold text-admin-gold font-mono">{{ tempWastePercentage }}%</span>
            </div>
            <input
              v-model.number="tempWastePercentage"
              type="range"
              min="10"
              max="20"
              step="1"
              class="w-full accent-primary cursor-pointer"
            />
            <p class="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
              Por cada 100 Litros de agua despachada, el sistema deducirá automáticamente {{ tempWastePercentage }} Litros adicionales por concepto de lavado y purga de botellones.
            </p>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-container/60 text-xs text-on-surface-variant">
            <span class="font-bold text-on-surface block mb-1">Registrar Merma Extraordinaria (Opcional):</span>
            <div class="flex gap-2 mt-2">
              <input
                v-model.number="manualWasteLiters"
                type="number"
                min="10"
                step="10"
                placeholder="Litros (ej: 200)"
                class="flex-1 bg-surface-container-high border-0 rounded-xl px-3 py-1.5 text-on-surface text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <button
                type="button"
                @click="submitManualWaste"
                class="px-3 py-1.5 rounded-xl bg-admin-gold text-slate-950 font-bold text-xs cursor-pointer active:scale-95"
              >
                Deducir
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showWashModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              @click="saveWastePercentage"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              Guardar Porcentaje
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 3: Capacidad Total del Tanque -->
    <div v-if="showCapacityModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showCapacityModal = false"></div>
      <div class="relative glass-card w-full max-w-sm p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <h4 class="text-base font-bold text-on-surface">Capacidad del Tanque</h4>
          <button @click="showCapacityModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Capacidad Total (Litros) *</label>
            <input
              v-model.number="tempCapacity"
              type="number"
              min="1000"
              step="1000"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-bold font-mono shadow-sm"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showCapacityModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="saveCapacity"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useTanksStore } from '~/stores/tanks';
import { useCurrencyStore } from '~/stores/currency';
import { useToast } from '~/composables/useToast';
import LiquidTank3D from '~/components/ui/LiquidTank3D.vue';
import { validateRequired, validatePositiveNumber, sanitizeFormData } from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const tanksStore = useTanksStore();
const currencyStore = useCurrencyStore();
const toast = useToast();

const iotEnabled = ref(false); // Default disabled per user requirements
const showRefillModal = ref(false);
const showWashModal = ref(false);
const showCapacityModal = ref(false);
const refillError = ref<string | null>(null);

const tempWastePercentage = ref<number>(tanksStore.washWastePercentage);
const manualWasteLiters = ref<number | null>(null);
const tempCapacity = ref<number>(tanksStore.masterTank.capacity);

const refillForm = reactive({
  liters: 10000,
  supplier: 'Cisternas HidroOriente C.A.',
  cost: 120.00,
});

onMounted(() => {
  tanksStore.init();
  tempWastePercentage.value = tanksStore.washWastePercentage;
  tempCapacity.value = tanksStore.masterTank.capacity;
});

const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('es-ES').format(Math.round(val || 0));
};

const formatDateTime = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Reciente';
  }
};

const openRefillModal = () => {
  refillError.value = null;
  refillForm.liters = 10000;
  refillForm.supplier = 'Cisternas HidroOriente C.A.';
  refillForm.cost = 120.00;
  showRefillModal.value = true;
};

const openWashModal = () => {
  tempWastePercentage.value = tanksStore.washWastePercentage;
  manualWasteLiters.value = null;
  showWashModal.value = true;
};

const openCapacityModal = () => {
  tempCapacity.value = tanksStore.masterTank.capacity;
  showCapacityModal.value = true;
};

const submitRefill = () => {
  refillError.value = null;
  const cleaned = sanitizeFormData(refillForm);

  const litErr = validatePositiveNumber(cleaned.liters, 'El volumen de la cisterna');
  if (litErr) {
    refillError.value = litErr;
    return;
  }

  const supErr = validateRequired(cleaned.supplier, 'El proveedor de la cisterna');
  if (supErr) {
    refillError.value = supErr;
    return;
  }

  const result = tanksStore.recordCisternRefill({
    liters: Number(cleaned.liters),
    supplier: cleaned.supplier,
    cost: Number(cleaned.cost || 0),
    costCurrency: 'USD',
  });

  showRefillModal.value = false;
  toast.createSuccess(
    'Recarga de Cisterna',
    `Se ingresaron +${formatNumber(result.refilled)}L al Tanque Maestro. Nivel actual: ${result.level}%.`
  );
};

const saveWastePercentage = () => {
  tanksStore.setWashWastePercentage(tempWastePercentage.value);
  showWashModal.value = false;
  toast.updateSuccess(
    'Merma Operativa',
    `Porcentaje de lavado actualizado a ${tempWastePercentage.value}%.`
  );
};

const submitManualWaste = () => {
  if (manualWasteLiters.value && manualWasteLiters.value > 0) {
    const res = tanksStore.recordWashWaste({
      liters: manualWasteLiters.value,
      reason: 'Limpieza y desinfección extraordinaria de planta',
    });
    manualWasteLiters.value = null;
    toast.info(
      'Merma Registrada',
      `Se dedujeron ${formatNumber(res.wasted)}L por lavado. Saldo restante: ${formatNumber(res.remaining)}L.`
    );
  }
};

const saveCapacity = () => {
  if (tempCapacity.value > 0) {
    tanksStore.setMasterCapacity(tempCapacity.value);
    showCapacityModal.value = false;
    toast.updateSuccess(
      'Capacidad del Tanque',
      `Capacidad total ajustada a ${formatNumber(tempCapacity.value)} Litros.`
    );
  }
};
</script>