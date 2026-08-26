<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
            Punto de Venta (POS) & Despacho
          </span>
          <span class="text-xs text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-billing-green">account_balance</span>
            Tasa BCV: <strong class="text-billing-green font-mono">Bs. {{ currencyStore.formattedRate }}</strong>
          </span>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Gestión de Ventas</h2>
        <p class="text-sm text-on-surface-variant mt-0.5">Control de transacciones multiproducto (agua, insumos, tapas, café, snacks), clientes y deducción de stock.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button
          @click="openNewSaleModal"
          class="flex-1 md:flex-none bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 glow-cyan-hover transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">point_of_sale</span>
          Nueva Venta (POS)
        </button>
      </div>
    </div>

    <!-- Navigation Sub-Tabs -->
    <div class="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
      <NuxtLink
        to="/sales"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        :class="route.path === '/sales' ? 'bg-primary/15 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
      >
        <span class="material-symbols-outlined text-base">point_of_sale</span>
        Ventas y Pedidos
      </NuxtLink>
      <NuxtLink
        to="/sales/invoices"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        :class="route.path === '/sales/invoices' ? 'bg-primary/15 text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
      >
        <span class="material-symbols-outlined text-base">receipt_long</span>
        Facturación
      </NuxtLink>
    </div>

    <!-- KPIs Bento Grid with Dual Currency -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Ventas Totales</span>
          <span class="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">payments</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">${{ formatMoney(totalSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(totalSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
            <span class="material-symbols-outlined text-sm text-billing-green">trending_up</span>
            {{ sales.length }} transacciones registradas
          </p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Volumen Despachado</span>
          <span class="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">water_drop</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-cyan-400 tracking-tight">{{ formatNumber(totalLitersDispensed) }} L</h3>
          <p class="text-xs text-on-surface-variant mt-2">Deducidos del Tanque Consolidado</p>
        </div>
      </div>

      <div class="card-elevated p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <span class="text-sm font-semibold text-on-surface-variant">Cobrado vs Pendiente</span>
          <span class="p-2.5 bg-billing-green/10 text-billing-green rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">receipt</span>
          </span>
        </div>
        <div>
          <h3 class="text-3xl md:text-4xl font-extrabold text-billing-green tracking-tight">${{ formatMoney(paidSalesAmount) }}</h3>
          <p class="text-xs text-billing-green mt-1 font-mono font-bold">
            ≈ {{ currencyStore.formatVes(currencyStore.toVes(paidSalesAmount)) }}
          </p>
          <p class="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-billing-green">check_circle</span>
            {{ paidSalesCount }} pagadas / {{ sales.length - paidSalesCount }} pendientes
          </p>
        </div>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="card-elevated p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por Nº Factura, Cédula/RIF, Cliente o Producto..."
          class="w-full bg-surface-container border-0 rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/60 shadow-sm"
        />
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="statusFilter"
          class="bg-surface-container border-0 text-on-surface text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
        >
          <option value="">Todos los Estados</option>
          <option value="PAID">Pagados</option>
          <option value="PENDING">Pendientes</option>
        </select>

        <span class="text-xs px-3 py-1.5 bg-surface-container rounded-xl text-on-surface-variant font-bold shadow-sm">
          {{ filteredSales.length }} Ventas
        </span>
      </div>
    </div>

    <!-- Ventas Recientes Table with Dual Currency -->
    <div class="card-elevated overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4 px-6">Nº Factura</th>
              <th class="py-4 px-6">Cliente / Cédula-RIF</th>
              <th class="py-4 px-6">Productos</th>
              <th class="py-4 px-6 text-center">Volumen Agua</th>
              <th class="py-4 px-6 text-right">Total ($ USD)</th>
              <th class="py-4 px-6 text-right">Equivalente (Bs. BCV)</th>
              <th class="py-4 px-6 text-center">Estado</th>
              <th class="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr v-for="sale in filteredSales" :key="sale.invoiceNo" class="hover:bg-surface-container-high/40 transition-colors">
              <td class="py-4 px-6 text-sm font-bold text-primary font-mono">{{ sale.invoiceNo }}</td>
              <td class="py-4 px-6 text-sm text-on-surface font-semibold">
                {{ sale.customer }}
                <span v-if="sale.customerDoc" class="block text-xs font-mono font-normal text-on-surface-variant">
                  {{ sale.customerDoc }}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-on-surface-variant">{{ sale.items }}</td>
              <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                  <span class="material-symbols-outlined text-xs">water_drop</span>
                  {{ formatNumber(sale.waterLiters || 0) }} L
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-on-surface text-right font-extrabold font-mono text-billing-green">${{ formatMoney(sale.total) }}</td>
              <td class="py-4 px-6 text-sm text-right font-mono font-bold text-on-surface">
                {{ currencyStore.formatVes(currencyStore.toVes(sale.total)) }}
              </td>
              <td class="py-4 px-6 text-center">
                <span
                  v-if="sale.status === 'PAID'"
                  class="inline-flex items-center gap-1.5 bg-billing-green/15 text-billing-green px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-billing-green"></span> Pagado
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 bg-admin-gold/15 text-admin-gold px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-admin-gold animate-pulse"></span> Pendiente
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openDetails(sale)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Ver Detalle"
                  >
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button
                    @click="deleteSale(sale)"
                    class="p-2 text-on-surface-variant hover:text-error-red transition-colors rounded-xl hover:bg-surface-container cursor-pointer active:scale-95"
                    title="Eliminar Venta"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-surface-container-highest/20 text-xs">
        <span class="text-on-surface-variant font-medium">
          Mostrando {{ filteredSales.length }} de {{ sales.length }} transacciones
        </span>
      </div>
    </div>

    <!-- Sale Details Modal with Complete Customer & Items Breakdown -->
    <div v-if="selectedSale" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="selectedSale = null"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div>
            <h4 class="text-lg font-bold text-on-surface">Detalle de Transacción</h4>
            <p class="text-xs text-primary font-mono">{{ selectedSale.invoiceNo }}</p>
          </div>
          <button @click="selectedSale = null" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Cliente:</span>
            <span class="text-on-surface font-semibold">{{ selectedSale.customer }}</span>
          </div>
          <div v-if="selectedSale.customerDoc" class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Cédula / RIF:</span>
            <span class="text-on-surface font-mono font-bold">{{ selectedSale.customerDoc }}</span>
          </div>
          <div v-if="selectedSale.customerAddress" class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Dirección:</span>
            <span class="text-on-surface text-right text-xs max-w-[240px]">{{ selectedSale.customerAddress }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Productos:</span>
            <span class="text-on-surface font-semibold text-right max-w-[240px]">{{ selectedSale.items }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Agua Deducida:</span>
            <span class="text-cyan-400 font-mono font-bold">{{ formatNumber(selectedSale.waterLiters || 0) }} L</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Tasa Oficial BCV:</span>
            <span class="text-billing-green font-mono font-bold">Bs. {{ currencyStore.formattedRate }} / USD</span>
          </div>
          <div class="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
            <span class="text-on-surface-variant">Estado de Pago:</span>
            <span :class="selectedSale.status === 'PAID' ? 'text-billing-green' : 'text-admin-gold'" class="font-bold">
              {{ selectedSale.status === 'PAID' ? 'Pagado' : 'Pendiente' }}
            </span>
          </div>

          <!-- Dual Currency Total -->
          <div class="p-3.5 rounded-2xl bg-surface-container/60 space-y-1">
            <div class="flex justify-between text-base font-bold">
              <span class="text-on-surface">Total en Dólares:</span>
              <span class="text-primary font-mono">${{ formatMoney(selectedSale.total) }} USD</span>
            </div>
            <div class="flex justify-between text-sm font-bold">
              <span class="text-on-surface-variant">Total en Bolívares:</span>
              <span class="text-billing-green font-mono">{{ currencyStore.formatVes(currencyStore.toVes(selectedSale.total)) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
          <button
            @click="selectedSale = null"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            Cerrar
          </button>
          <button
            @click="printInvoice"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary flex items-center gap-2 glow-cyan-hover cursor-pointer active:scale-95"
          >
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>

    <!-- Modern POS Modal (Multiproduct Dynamic Cart & Customer Directory) -->
    <div v-if="showSaleModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md" @click="showSaleModal = false"></div>
      <div class="relative glass-card w-full max-w-4xl max-h-[92vh] flex flex-col z-10 animate-in overflow-hidden rounded-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-black/5 dark:border-white/5 bg-surface-container-highest/30">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">point_of_sale</span>
            </div>
            <div>
              <h4 class="text-base sm:text-lg font-bold text-on-surface">Punto de Venta (POS Comercial)</h4>
              <p class="text-xs text-on-surface-variant">Selección multiproducto, carrito dinámico y registro de cliente</p>
            </div>
          </div>
          <button @click="showSaleModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Form Error Alert -->
        <div v-if="formError" class="mx-4 mt-3 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ formError }}</span>
        </div>

        <!-- Content Body (2 Columns on Desktop) -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Columna Izquierda: Datos del Cliente (4 cols) -->
          <div class="lg:col-span-4 flex flex-col gap-3.5">
            <h5 class="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm text-primary">person</span>
              Datos del Cliente
            </h5>

            <!-- Tipo de Cliente -->
            <div class="grid grid-cols-2 gap-2 bg-surface-container-high/60 p-1 rounded-xl">
              <button
                type="button"
                @click="customerForm.type = 'NATURAL'; customerForm.docType = 'V'"
                class="py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer"
                :class="customerForm.type === 'NATURAL' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
              >
                Persona Natural
              </button>
              <button
                type="button"
                @click="customerForm.type = 'JURIDICO'; customerForm.docType = 'J'"
                class="py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer"
                :class="customerForm.type === 'JURIDICO' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
              >
                Empresa (RIF)
              </button>
            </div>

            <!-- Cédula / RIF con Autocompletado -->
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
                {{ customerForm.type === 'NATURAL' ? 'Cédula de Identidad *' : 'RIF de la Empresa *' }}
              </label>
              <div class="flex gap-2">
                <select
                  v-model="customerForm.docType"
                  class="bg-surface-container border-0 rounded-xl px-2.5 py-2 text-on-surface text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                  <option value="J">J-</option>
                  <option value="G">G-</option>
                </select>
                <input
                  v-model="customerForm.docNumber"
                  @input="onDocNumberInput"
                  type="text"
                  required
                  placeholder="Número de documento"
                  class="flex-1 bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs font-bold font-mono focus:ring-2 focus:ring-primary outline-none shadow-sm"
                />
              </div>
            </div>

            <!-- Nombre / Razón Social -->
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">
                {{ customerForm.type === 'NATURAL' ? 'Nombre y Apellido *' : 'Razón Social *' }}
              </label>
              <input
                v-model="customerForm.name"
                type="text"
                required
                placeholder="Ej: Distribuidora Los Andes"
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>

            <!-- Dirección -->
            <div>
              <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">Dirección de Entrega / Domicilio *</label>
              <textarea
                v-model="customerForm.address"
                required
                rows="2"
                placeholder="Calle, sector o punto de referencia"
                class="w-full bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs focus:ring-2 focus:ring-primary outline-none shadow-sm resize-none"
              ></textarea>
            </div>

            <!-- Teléfono & Correo Opcionales -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] font-semibold text-on-surface-variant mb-1">Teléfono (Opcional)</label>
                <input
                  v-model="customerForm.phone"
                  type="text"
                  placeholder="+58 414 0000000"
                  class="w-full bg-surface-container border-0 rounded-xl px-2.5 py-1.5 text-on-surface text-[11px] focus:ring-2 focus:ring-primary outline-none shadow-sm"
                />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-on-surface-variant mb-1">Email (Opcional)</label>
                <input
                  v-model="customerForm.email"
                  type="email"
                  placeholder="cliente@mail.com"
                  class="w-full bg-surface-container border-0 rounded-xl px-2.5 py-1.5 text-on-surface text-[11px] focus:ring-2 focus:ring-primary outline-none shadow-sm"
                />
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Catálogo & Carrito (8 cols) -->
          <div class="lg:col-span-8 flex flex-col gap-4">
            <!-- Catálogo Tabs -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h5 class="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-primary">inventory_2</span>
                  Catálogo Multiproducto
                </h5>
                <span class="text-[11px] text-billing-green font-mono font-bold">1 USD = Bs. {{ currencyStore.formattedRate }}</span>
              </div>

              <!-- Categorías Pills -->
              <div class="flex flex-wrap gap-1.5 pb-1">
                <button
                  v-for="cat in ['Todos', 'Agua', 'Insumos', 'Cafetería', 'Accesorios']"
                  :key="cat"
                  type="button"
                  @click="activeCategory = cat"
                  class="px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  :class="activeCategory === cat ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'"
                >
                  {{ cat }}
                </button>
              </div>

              <!-- Products Quick Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-44 overflow-y-auto pr-1">
                <button
                  v-for="prod in displayedProducts"
                  :key="prod.id"
                  type="button"
                  @click="addToCart(prod)"
                  class="p-2.5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high/80 text-left transition-all border border-black/5 dark:border-white/5 flex flex-col justify-between group cursor-pointer active:scale-95 shadow-sm"
                >
                  <div class="flex items-center justify-between w-full">
                    <span class="material-symbols-outlined text-primary text-base">{{ prod.icon }}</span>
                    <span class="text-[10px] font-extrabold text-billing-green font-mono">${{ prod.price.toFixed(2) }}</span>
                  </div>
                  <p class="text-xs font-bold text-on-surface line-clamp-1 mt-1 group-hover:text-primary transition-colors">
                    {{ prod.name }}
                  </p>
                  <span class="text-[10px] text-on-surface-variant font-mono">
                    {{ prod.category === 'Agua' ? `${prod.waterLiters}L Agua` : `Stock: ${prod.currentStock}` }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Tabla del Carrito en Tiempo Real -->
            <div class="flex-1 flex flex-col rounded-xl bg-surface-container-high/30 border border-black/5 dark:border-white/5 overflow-hidden">
              <div class="p-2.5 bg-surface-container-highest/40 border-b border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-bold text-on-surface">
                <span class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-primary">shopping_cart</span>
                  Productos en la Venta ({{ cartItems.length }})
                </span>
                <span class="text-[11px] text-cyan-400 font-mono">
                  💧 Total Agua: {{ formatNumber(cartTotalLiters) }} L
                </span>
              </div>

              <div class="flex-1 max-h-48 overflow-y-auto">
                <table v-if="cartItems.length > 0" class="w-full text-left text-xs border-collapse">
                  <tbody class="divide-y divide-black/5 dark:divide-white/5">
                    <tr v-for="item in cartItems" :key="item.productId" class="hover:bg-surface-container/50">
                      <td class="py-2 px-3 font-semibold text-on-surface">
                        {{ item.name }}
                        <span v-if="item.waterLiters > 0" class="text-[10px] text-cyan-400 block font-mono">
                          {{ item.waterLiters * item.quantity }}L agua
                        </span>
                      </td>
                      <!-- Quantity +/- selector -->
                      <td class="py-2 px-2 text-center">
                        <div class="inline-flex items-center gap-1 bg-surface-container rounded-lg p-0.5 shadow-sm">
                          <button
                            type="button"
                            @click="decrementItem(item)"
                            class="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-container-high text-on-surface font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            v-model.number="item.quantity"
                            type="number"
                            min="1"
                            class="w-8 text-center text-xs font-bold font-mono bg-transparent outline-none"
                          />
                          <button
                            type="button"
                            @click="incrementItem(item)"
                            class="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-container-high text-on-surface font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td class="py-2 px-3 text-right font-mono font-bold text-billing-green">
                        ${{ (item.price * item.quantity).toFixed(2) }}
                      </td>
                      <td class="py-2 px-2 text-right">
                        <button
                          type="button"
                          @click="removeFromCart(item)"
                          class="p-1 hover:text-error-red text-on-surface-variant rounded transition-colors cursor-pointer"
                        >
                          <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="p-6 text-center text-xs text-on-surface-variant">
                  <span class="material-symbols-outlined text-2xl text-on-surface-variant/40 block mb-1">add_shopping_cart</span>
                  No hay productos en el carrito. Selecciona productos del catálogo superior.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Financial Summary & Actions -->
        <div class="p-4 border-t border-black/5 dark:border-white/5 bg-surface-container-highest/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <!-- Total and Water Details -->
          <div class="flex items-center gap-6">
            <div>
              <span class="text-[11px] text-on-surface-variant font-medium">Total a Cobrar:</span>
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-extrabold text-billing-green font-mono">
                  ${{ formatMoney(cartTotalAmount) }}
                </span>
                <span class="text-xs font-bold text-on-surface font-mono">
                  (Bs. {{ currencyStore.formatVes(currencyStore.toVes(cartTotalAmount)) }})
                </span>
              </div>
            </div>

            <div class="hidden sm:block pl-4 border-l border-black/5 dark:border-white/5">
              <span class="text-[10px] text-on-surface-variant">Deducción Tanque:</span>
              <p class="text-xs font-bold text-cyan-400 font-mono">
                {{ formatNumber(cartTotalLiters) }} L (+{{ tanksStore.washWastePercentage }}% merma)
              </p>
            </div>
          </div>

          <!-- Payment status and action buttons -->
          <div class="flex items-center gap-2">
            <select
              v-model="salePaymentStatus"
              class="bg-surface-container border-0 rounded-xl px-3 py-2 text-on-surface text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer"
            >
              <option value="PAID">Pagado</option>
              <option value="PENDING">Pendiente</option>
            </select>

            <button
              type="button"
              @click="showSaleModal = false"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              @click="submitSale"
              :disabled="cartItems.length === 0"
              class="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-primary/25"
            >
              <span class="material-symbols-outlined text-base">check</span>
              <span>Procesar Venta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTanksStore } from '~/stores/tanks';
import { useCurrencyStore } from '~/stores/currency';
import { useCustomersStore } from '~/stores/customers';
import { useInventoryStore, type Product } from '~/stores/inventory';
import { useToast } from '~/composables/useToast';
import {
  validateRequired,
  validatePositiveNumber,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const tanksStore = useTanksStore();
const currencyStore = useCurrencyStore();
const customersStore = useCustomersStore();
const inventoryStore = useInventoryStore();
const toast = useToast();

const searchQuery = ref('');
const statusFilter = ref('');
const showSaleModal = ref(false);
const selectedSale = ref<any>(null);
const formError = ref<string | null>(null);
const activeCategory = ref('Todos');
const salePaymentStatus = ref<'PAID' | 'PENDING'>('PAID');

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  waterLiters: number;
}

const cartItems = ref<CartItem[]>([]);

const customerForm = reactive({
  type: 'NATURAL' as 'NATURAL' | 'JURIDICO',
  docType: 'V' as 'V' | 'E' | 'J' | 'G',
  docNumber: '',
  name: '',
  address: '',
  phone: '',
  email: '',
});

const sales = ref([
  {
    invoiceNo: 'INV-2026-001',
    customer: 'AquaExpress Delivery C.A.',
    customerDoc: 'J-31245678-0',
    customerAddress: 'Av. Las Industrias, Galpón 4, Zona Industrial',
    items: '50x Botellón 20L',
    waterLiters: 1000,
    total: 225.00,
    status: 'PAID',
  },
  {
    invoiceNo: 'INV-2026-002',
    customer: 'Minimarket Los Andes',
    customerDoc: 'J-40123987-1',
    customerAddress: 'Calle Real de San Antonio, Local 12',
    items: '20x Botellón 20L + 10x Botella 5L',
    waterLiters: 450,
    total: 110.00,
    status: 'PAID',
  },
  {
    invoiceNo: 'INV-2026-003',
    customer: 'Gimnasio PowerFit C.A.',
    customerDoc: 'J-29874512-3',
    customerAddress: 'Av. Francisco de Miranda, CC Oasis',
    items: '15x Botellón 20L',
    waterLiters: 300,
    total: 67.50,
    status: 'PENDING',
  },
  {
    invoiceNo: 'INV-2026-004',
    customer: 'Carlos Mendoza',
    customerDoc: 'V-18945120',
    customerAddress: 'Urb. Los Pinos, Vereda 5, Casa #14',
    items: '10x Botellón 20L + 2x Tapa 55mm + 1x Café',
    waterLiters: 200,
    total: 47.20,
    status: 'PAID',
  },
]);

onMounted(() => {
  customersStore.init();
  inventoryStore.init();
  tanksStore.init();
});

const displayedProducts = computed(() => {
  return inventoryStore.getProductsByCategory(activeCategory.value);
});

const cartTotalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const cartTotalLiters = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.waterLiters || 0) * item.quantity, 0);
});

const totalSalesAmount = computed(() => {
  return sales.value.reduce((acc, sale) => acc + sale.total, 0);
});

const totalLitersDispensed = computed(() => {
  return sales.value.reduce((acc, sale) => acc + (sale.waterLiters || 0), 0);
});

const paidSalesCount = computed(() => {
  return sales.value.filter(s => s.status === 'PAID').length;
});

const paidSalesAmount = computed(() => {
  return sales.value.filter(s => s.status === 'PAID').reduce((acc, s) => acc + s.total, 0);
});

const filteredSales = computed(() => {
  return sales.value.filter(sale => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) {
      return !statusFilter.value || sale.status === statusFilter.value;
    }
    const matchSearch =
      sale.invoiceNo.toLowerCase().includes(q) ||
      sale.customer.toLowerCase().includes(q) ||
      (sale.customerDoc && sale.customerDoc.toLowerCase().includes(q)) ||
      sale.items.toLowerCase().includes(q);
    const matchStatus = !statusFilter.value || sale.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const formatMoney = (val: number): string => {
  return (val || 0).toFixed(2);
};

const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('es-ES').format(Math.round(val || 0));
};

const openNewSaleModal = () => {
  formError.value = null;
  customerForm.type = 'NATURAL';
  customerForm.docType = 'V';
  customerForm.docNumber = '';
  customerForm.name = '';
  customerForm.address = '';
  customerForm.phone = '';
  customerForm.email = '';
  salePaymentStatus.value = 'PAID';

  // Default 1x Recarga 20L
  cartItems.value = [
    {
      productId: 'prod-2',
      name: 'Recarga de Botellón 20L (Retornable)',
      price: 3.50,
      quantity: 1,
      waterLiters: 20,
    },
  ];
  showSaleModal.value = true;
};

const onDocNumberInput = () => {
  if (customerForm.docNumber.trim().length >= 4) {
    const query = `${customerForm.docType}-${customerForm.docNumber.trim()}`;
    const found = customersStore.findCustomer(query);
    if (found) {
      customerForm.name = found.name;
      customerForm.address = found.address;
      customerForm.phone = found.phone || '';
      customerForm.email = found.email || '';
      customerForm.type = found.type;
    }
  }
};

const addToCart = (prod: Product) => {
  const existing = cartItems.value.find((i) => i.productId === prod.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: 1,
      waterLiters: prod.waterLiters || 0,
    });
  }
};

const incrementItem = (item: CartItem) => {
  item.quantity += 1;
};

const decrementItem = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    removeFromCart(item);
  }
};

const removeFromCart = (item: CartItem) => {
  cartItems.value = cartItems.value.filter((i) => i.productId !== item.productId);
};

const openDetails = (sale: any) => {
  selectedSale.value = sale;
};

const printInvoice = () => {
  const vesAmount = currencyStore.formatVes(currencyStore.toVes(selectedSale.value?.total || 0));
  toast.success(
    'Comprobante Listo',
    `Comprobante para ${selectedSale.value?.invoiceNo} listo para imprimir ($${formatMoney(selectedSale.value?.total)} / ${vesAmount}).`
  );
  selectedSale.value = null;
};

const deleteSale = (sale: any) => {
  sales.value = sales.value.filter(s => s.invoiceNo !== sale.invoiceNo);
  toast.deleteSuccess('Venta', `Venta ${sale.invoiceNo} eliminada.`);
};

const submitSale = () => {
  formError.value = null;
  const cleanedCustomer = sanitizeFormData(customerForm);

  if (cartItems.value.length === 0) {
    formError.value = 'Debes agregar al menos un producto al carrito.';
    return;
  }

  const docErr = validateRequired(cleanedCustomer.docNumber, 'La Cédula / RIF');
  if (docErr) {
    formError.value = docErr;
    return;
  }

  const nameErr = validateRequired(cleanedCustomer.name, 'El Nombre o Razón Social');
  if (nameErr) {
    formError.value = nameErr;
    return;
  }

  const addrErr = validateRequired(cleanedCustomer.address, 'La Dirección de entrega');
  if (addrErr) {
    formError.value = addrErr;
    return;
  }

  // 1. Register or update customer in Directory
  const customerRecord = customersStore.registerOrUpdateCustomer({
    type: cleanedCustomer.type,
    docType: cleanedCustomer.docType,
    docNumber: cleanedCustomer.docNumber,
    name: cleanedCustomer.name,
    address: cleanedCustomer.address,
    phone: cleanedCustomer.phone,
    email: cleanedCustomer.email,
  });

  // 2. Generate items description
  const itemsDescription = cartItems.value
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(' + ');

  const totalAmount = cartTotalAmount.value;
  const totalWater = cartTotalLiters.value;
  const nextNumber = sales.value.length + 1;
  const invoiceNo = `INV-2026-00${nextNumber}`;

  // 3. Deduct water from Master Consolidated Tank (+ calculate wash waste)
  let waterInfo = '';
  if (totalWater > 0) {
    const deductionResult = tanksStore.deductLiters(
      totalWater,
      undefined,
      `Venta ${invoiceNo} (${customerRecord.name})`
    );
    waterInfo = ` Se descontaron ${deductionResult.dispensed}L de agua (+${deductionResult.washWaste}L merma).`;
  }

  // 4. Deduct physical stock from Inventory Store
  inventoryStore.deductStock(
    cartItems.value.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  );

  // 5. Add sale record
  sales.value.unshift({
    invoiceNo,
    customer: customerRecord.name,
    customerDoc: customerRecord.fullDoc,
    customerAddress: customerRecord.address,
    items: itemsDescription,
    waterLiters: totalWater,
    total: totalAmount,
    status: salePaymentStatus.value,
  });

  showSaleModal.value = false;
  const vesTotal = currencyStore.formatVes(currencyStore.toVes(totalAmount));
  toast.createSuccess(
    'Venta Registrada',
    `Venta ${invoiceNo} procesada por $${formatMoney(totalAmount)} (${vesTotal}).${waterInfo}`
  );
};
</script>
