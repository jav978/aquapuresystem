<template>
  <div class="flex flex-col gap-6 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">Configuración Global</h2>
        <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Administre los parámetros operativos, identidad corporativa y puntos de venta.</p>
      </div>

      <!-- Theme Switcher Quick Toggle -->
      <div class="flex items-center gap-1.5 sm:gap-2 bg-surface-container-high/70 p-1.5 rounded-xl self-start sm:self-auto shadow-sm flex-shrink-0">
        <button
          type="button"
          @click="setTheme('light')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="!themeStore.isDark ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="material-symbols-outlined text-sm">light_mode</span>
          Modo Claro
        </button>
        <button
          type="button"
          @click="setTheme('dark')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="themeStore.isDark ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="material-symbols-outlined text-sm">dark_mode</span>
          Modo Oscuro
        </button>
      </div>
    </div>

    <!-- 2x2 Grid of Settings Cards -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <!-- Card 1: Información de la Empresa -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <span class="material-symbols-outlined text-primary text-xl">domain</span>
            <h3 class="text-base font-bold text-on-surface">Información de la Empresa</h3>
          </div>

          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Upload Logo Box -->
              <div
                @click="triggerUploadLogo"
                class="w-full sm:w-36 h-32 rounded-2xl border border-dashed border-black/10 dark:border-white/10 hover:border-primary/60 bg-surface-container/40 hover:bg-surface-container-high/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all flex-shrink-0 group"
              >
                <span class="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">add_photo_alternate</span>
                <span class="text-xs font-bold text-on-surface mt-1.5">Subir Logotipo</span>
                <span class="text-[10px] text-on-surface-variant/70 mt-1 leading-tight">Formato PNG o SVG. Máx 2MB.</span>
              </div>

              <!-- Commercial Name -->
              <div class="flex-1 flex flex-col justify-center">
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre Comercial *</label>
                <input
                  v-model="companyForm.businessName"
                  type="text"
                  required
                  class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">RUC / NIT *</label>
                <input
                  v-model="companyForm.taxId"
                  type="text"
                  required
                  class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface-variant mb-1">Teléfono *</label>
                <input
                  v-model="companyForm.phone"
                  type="text"
                  required
                  class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Dirección Principal *</label>
              <input
                v-model="companyForm.address"
                type="text"
                required
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Métodos de Pago -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <span class="material-symbols-outlined text-primary text-xl">payments</span>
            <h3 class="text-base font-bold text-on-surface">Métodos de Pago</h3>
          </div>

          <div class="space-y-3">
            <!-- Cash -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">payments</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Efectivo</p>
                  <p class="text-xs text-on-surface-variant">Moneda local</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.cash" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- Transfer -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Transferencia Bancaria</p>
                  <p class="text-xs text-on-surface-variant">B2B / Grandes montos</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.transfer" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- POS Terminal -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">point_of_sale</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Terminal POS</p>
                  <p class="text-xs text-on-surface-variant">Tarjetas de crédito/débito</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.pos" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- QR / Mobile -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span class="material-symbols-outlined text-xl">qr_code_scanner</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface leading-tight">Pago Móvil / QR</p>
                  <p class="text-xs text-on-surface-variant">Billeteras digitales</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="paymentMethods.qr" class="sr-only peer" />
                <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Ajustes Generales -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <span class="material-symbols-outlined text-primary text-xl">tune</span>
            <h3 class="text-base font-bold text-on-surface">Ajustes Generales</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Idioma de Interfaz</label>
              <select
                v-model="generalSettings.language"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="es-LA">Español (América Latina)</option>
                <option value="es-ES">Español (España)</option>
                <option value="en-US">English (United States)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Moneda Principal</label>
              <select
                v-model="generalSettings.currency"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="USD">Dólares Americanos (USD - $)</option>
                <option value="PEN">Soles (PEN - S/)</option>
                <option value="EUR">Euros (EUR - €)</option>
                <option value="MXN">Pesos Mexicanos (MXN - $)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Zona Horaria Operativa</label>
              <select
                v-model="generalSettings.timezone"
                class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
              >
                <option value="UTC-5">(UTC-05:00) Lima, Quito, Bogotá, Panamá</option>
                <option value="UTC-4">(UTC-04:00) Caracas, La Paz, Santiago</option>
                <option value="UTC-6">(UTC-06:00) Ciudad de México, San José</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 4: Puntos de Venta (Sucursales) -->
      <div class="card-elevated p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">store</span>
              <h3 class="text-base font-bold text-on-surface">Puntos de Venta (Sucursales)</h3>
            </div>

            <button
              type="button"
              @click="openAddBranchModal"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-hover transition-all cursor-pointer active:scale-95"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Nueva Sucursal</span>
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="branch in branches"
              :key="branch.id"
              class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 transition-colors shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-xl">{{ branch.isMatrix ? 'apartment' : 'storefront' }}</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-bold text-on-surface leading-tight">{{ branch.name }}</p>
                    <span
                      class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
                      :class="branch.isMatrix ? 'bg-admin-gold/20 text-admin-gold' : 'bg-primary/20 text-primary'"
                    >
                      {{ branch.isMatrix ? 'Casa Matriz' : 'Sucursal' }}
                    </span>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-0.5">{{ branch.address }}</p>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  @click="editBranch(branch)"
                  class="p-2 hover:text-primary hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
                  title="Editar Sucursal"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  v-if="!branch.isMatrix"
                  @click="deleteBranch(branch)"
                  class="p-2 hover:text-error-red hover:bg-error-red/10 rounded-xl transition-colors cursor-pointer"
                  title="Eliminar Sucursal"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 5: Copias de Seguridad & Respaldo (Backups & Disaster Recovery) -->
      <div class="card-elevated p-6 flex flex-col justify-between xl:col-span-2 border border-primary/20 bg-gradient-to-br from-surface-container/80 via-surface-container to-surface-container-high/60">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shadow-inner">
                <span class="material-symbols-outlined text-2xl">shield_lock</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-on-surface">Copias de Seguridad & Respaldo de Datos</h3>
                <p class="text-xs text-on-surface-variant">Protección contra apagones, desastres y pérdida de datos operativos.</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-billing-green/15 text-billing-green border border-billing-green/20">
                <span class="w-2 h-2 rounded-full bg-billing-green animate-pulse"></span>
                Base de Datos Protegida
              </span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div class="p-3.5 rounded-xl bg-surface-container-high/60 border border-black/5 dark:border-white/5">
              <span class="text-[11px] font-semibold text-on-surface-variant block">Facturas / Ventas</span>
              <strong class="text-lg font-extrabold text-primary">{{ salesStore.invoices.length }}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-surface-container-high/60 border border-black/5 dark:border-white/5">
              <span class="text-[11px] font-semibold text-on-surface-variant block">Clientes Registrados</span>
              <strong class="text-lg font-extrabold text-cyan-400">{{ customersStore.customers.length }}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-surface-container-high/60 border border-black/5 dark:border-white/5">
              <span class="text-[11px] font-semibold text-on-surface-variant block">Productos & Insumos</span>
              <strong class="text-lg font-extrabold text-admin-gold">{{ inventoryStore.products.length }}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-surface-container-high/60 border border-black/5 dark:border-white/5">
              <span class="text-[11px] font-semibold text-on-surface-variant block">Tanque Consolidado</span>
              <strong class="text-lg font-extrabold text-billing-green">{{ tanksStore.masterTank.currentLiters }} L</strong>
            </div>
          </div>

          <!-- Options and Actions Row -->
          <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container/50 border border-black/5 dark:border-white/5">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-primary">history</span>
                <span class="text-xs text-on-surface-variant">Último Respaldo:</span>
                <strong class="text-xs text-on-surface font-mono">{{ backupStore.formattedLastBackup }}</strong>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="backupStore.autoBackupOnDayClose"
                    @change="toggleAutoBackup"
                    class="sr-only peer"
                  />
                  <div class="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span class="text-xs text-on-surface font-medium">Respaldo automático al cierre de caja / fin de jornada</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                @click="openRestoreModal"
                class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <span class="material-symbols-outlined text-base text-admin-gold">upload_file</span>
                <span>Restaurar Base de Datos</span>
              </button>

              <button
                type="button"
                @click="triggerExportBackup"
                :disabled="backupStore.isBackingUp"
                class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 glow-cyan-hover transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-base">download</span>
                <span>{{ backupStore.isBackingUp ? 'Generando...' : 'Descargar Copia de Seguridad (.JSON)' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 6: Seguridad & Autorizaciones de Supervisor (PIN Dinámico 24 Horas) -->
      <div class="card-elevated p-6 flex flex-col justify-between xl:col-span-2 border border-amber-500/30 bg-gradient-to-br from-surface-container/90 via-surface-container to-surface-container-high/70 shadow-lg shadow-amber-500/5">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-inner">
                <span class="material-symbols-outlined text-2xl">shield_person</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-on-surface">PIN de Supervisor & Control de Seguridad (24 Horas)</h3>
                <p class="text-xs text-on-surface-variant">Autorización dinámica requerida para edición de facturas, anulaciones y reversos de inventario.</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="salesStore.supervisorSecurity.isLocked"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-error text-white shadow-md shadow-error/25 animate-pulse"
              >
                <span class="material-symbols-outlined text-sm">lock</span>
                BLOQUEADO (3 Intentos Fallidos)
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30"
              >
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                PIN Activo y Seguro
              </span>
            </div>
          </div>

          <!-- Main PIN Panel and Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <!-- Left: Active PIN Card -->
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">PIN Activo del Día</span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface text-on-surface-variant border border-black/5 dark:border-white/5">
                  {{ salesStore.supervisorSecurity.mode === 'AUTO_DAILY' ? 'Automático' : 'Manual' }}
                </span>
              </div>

              <div class="my-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-3xl font-black font-mono tracking-widest text-on-surface">
                    {{ showSupervisorPin ? salesStore.supervisorSecurity.pin : '••••' }}
                  </span>
                  <button
                    type="button"
                    @click="showSupervisorPin = !showSupervisorPin"
                    class="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface transition-colors cursor-pointer"
                    :title="showSupervisorPin ? 'Ocultar PIN' : 'Mostrar PIN'"
                  >
                    <span class="material-symbols-outlined text-lg">{{ showSupervisorPin ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>

                <button
                  type="button"
                  @click="copySupervisorPin"
                  class="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center gap-1 border border-black/5 dark:border-white/5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Copiar PIN"
                >
                  <span class="material-symbols-outlined text-sm text-amber-500">content_copy</span>
                  <span>Copiar</span>
                </button>
              </div>

              <p class="text-[10px] text-on-surface-variant">
                Generado: {{ formatIsoDate(salesStore.supervisorSecurity.generatedAt) }}
              </p>
            </div>

            <!-- Middle: 24h Expiration Timer -->
            <div class="p-4 rounded-2xl bg-surface-container-high/60 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-2 text-primary">
                <span class="material-symbols-outlined text-lg">timer</span>
                <span class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Vigencia (24 Horas)</span>
              </div>
              <div>
                <strong class="text-lg font-extrabold text-on-surface block font-mono">
                  {{ salesStore.timeRemainingFormatted }}
                </strong>
                <span class="text-xs text-on-surface-variant">
                  Expira: {{ formatIsoDate(salesStore.supervisorSecurity.expiresAt) }}
                </span>
              </div>
              <div class="w-full bg-surface-container-highest rounded-full h-1.5 mt-3 overflow-hidden">
                <div class="bg-primary h-1.5 rounded-full" style="width: 75%"></div>
              </div>
            </div>

            <!-- Right: Security Attempts & Lock Status -->
            <div
              class="p-4 rounded-2xl border flex flex-col justify-between"
              :class="salesStore.supervisorSecurity.isLocked ? 'bg-error/15 border-error/40' : 'bg-surface-container-high/60 border-black/5 dark:border-white/5'"
            >
              <div class="flex items-center gap-2 mb-2" :class="salesStore.supervisorSecurity.isLocked ? 'text-error' : 'text-billing-green'">
                <span class="material-symbols-outlined text-lg">{{ salesStore.supervisorSecurity.isLocked ? 'lock_person' : 'verified_user' }}</span>
                <span class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Protección Anti-Fuerza Bruta</span>
              </div>
              <div>
                <strong class="text-lg font-extrabold block" :class="salesStore.supervisorSecurity.isLocked ? 'text-error font-black' : 'text-on-surface'">
                  {{ salesStore.supervisorSecurity.failedAttempts }} / 3 Intentos Fallidos
                </strong>
                <span class="text-xs" :class="salesStore.supervisorSecurity.isLocked ? 'text-error font-semibold' : 'text-on-surface-variant'">
                  {{ salesStore.supervisorSecurity.isLocked ? 'Bloqueado. Requiere desbloqueo de Administrador.' : 'Límite de seguridad de 3 intentos.' }}
                </span>
              </div>
              <div class="mt-2">
                <button
                  v-if="salesStore.supervisorSecurity.isLocked || salesStore.supervisorSecurity.failedAttempts > 0"
                  type="button"
                  @click="unlockSupervisorSecurity"
                  class="w-full px-3 py-1.5 rounded-xl bg-error hover:bg-error/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">lock_open</span>
                  <span>Desbloquear Intentos Ahora</span>
                </button>
                <span v-else class="text-[10px] text-billing-green font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">check_circle</span>
                  Sistema Operativo y Seguro
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Actions Bar -->
          <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container/50 border border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="salesStore.supervisorSecurity.autoRotateDaily"
                  @change="toggleAutoRotateDaily"
                  class="sr-only peer"
                />
                <div class="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
              <div>
                <span class="text-xs text-on-surface font-semibold block">Rotación Diaria Automática</span>
                <span class="text-[10px] text-on-surface-variant">Generar un nuevo código aleatorio automáticamente cada 24 horas.</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                @click="openManualPinModal"
                class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <span class="material-symbols-outlined text-base text-amber-500">edit_square</span>
                <span>Asignar PIN Manual</span>
              </button>

              <button
                type="button"
                @click="generateDailyRandomPin"
                class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <span class="material-symbols-outlined text-base">autorenew</span>
                <span>Generar Nuevo PIN Aleatorio (24h)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Settings Floating / Bottom Action Bar -->
    <div class="flex justify-end pt-2">
      <button
        @click="saveAllSettings"
        class="bg-primary text-on-primary font-bold text-sm px-8 py-3 rounded-xl glow-cyan-hover shadow-lg shadow-primary/25 cursor-pointer active:scale-95 flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-lg">save</span>
        Guardar Configuración Global
      </button>
    </div>

    <!-- Branch Modal -->
    <div v-if="showBranchModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showBranchModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-primary/15 text-primary material-symbols-outlined">storefront</span>
            <h4 class="text-base font-bold text-on-surface">
              {{ isEditingBranch ? 'Editar Sucursal' : 'Nueva Sucursal' }}
            </h4>
          </div>
          <button @click="showBranchModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="branchError" class="mb-4 p-3 rounded-xl bg-error-red/10 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ branchError }}</span>
        </div>

        <form @submit.prevent="saveBranch" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre de la Sucursal *</label>
            <input
              v-model="branchForm.name"
              type="text"
              required
              placeholder="Ej: Sucursal Norte"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Dirección *</label>
            <input
              v-model="branchForm.address"
              type="text"
              required
              placeholder="Ej: Av. Las Américas 450"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showBranchModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs glow-cyan-hover transition-all cursor-pointer active:scale-95"
            >
              {{ isEditingBranch ? 'Guardar Cambios' : 'Registrar Sucursal' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Restore Backup Modal -->
    <div v-if="showRestoreModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="closeRestoreModal"></div>
      <div class="relative glass-card w-full max-w-lg p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-admin-gold/15 text-admin-gold material-symbols-outlined">settings_backup_restore</span>
            <div>
              <h4 class="text-base font-bold text-on-surface">Restaurar Copia de Seguridad</h4>
              <p class="text-xs text-on-surface-variant">Recuperación completa de base de datos desde archivo .JSON</p>
            </div>
          </div>
          <button @click="closeRestoreModal" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="restoreError" class="mb-4 p-3.5 rounded-xl bg-error-red/10 border border-error-red/20 text-error-red text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-base flex-shrink-0">error</span>
          <span>{{ restoreError }}</span>
        </div>

        <div class="space-y-4">
          <!-- File selection -->
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1.5">Seleccionar archivo de respaldo (.json) *</label>
            <input
              type="file"
              accept=".json"
              @change="handleFileSelected"
              class="w-full text-xs text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-on-primary hover:file:bg-primary-hover cursor-pointer bg-surface-container p-2 rounded-xl"
            />
          </div>

          <!-- Preview details if package is parsed -->
          <div v-if="pendingBackupPackage" class="p-4 rounded-xl bg-surface-container-high border border-primary/20 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">verified</span>
                Copia de Seguridad Verificada
              </span>
              <span class="text-[10px] font-mono text-on-surface-variant">{{ pendingBackupPackage.metadata.checksum }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="text-on-surface-variant">Fecha: <strong class="text-on-surface">{{ formatIsoDate(pendingBackupPackage.metadata.createdAt) }}</strong></div>
              <div class="text-on-surface-variant">Ventas / Facturas: <strong class="text-on-surface font-mono">{{ pendingBackupPackage.metadata.totalInvoices }}</strong></div>
              <div class="text-on-surface-variant">Clientes: <strong class="text-on-surface font-mono">{{ pendingBackupPackage.metadata.totalCustomers }}</strong></div>
              <div class="text-on-surface-variant">Tanque: <strong class="text-on-surface font-mono">{{ pendingBackupPackage.metadata.masterTankLiters }} L</strong></div>
            </div>
          </div>

          <!-- Supervisor PIN Input -->
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">PIN de Supervisor (Autorización requerida) *</label>
            <input
              v-model="supervisorPinInput"
              type="password"
              maxlength="8"
              placeholder="Ingrese PIN de Supervisor (Ej: 1234)"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary outline-none font-mono shadow-sm"
            />
          </div>

          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
            <span class="material-symbols-outlined text-base flex-shrink-0 mt-0.5">warning</span>
            <span>Esta operación sobreescribirá los datos del sistema con los contenidos del archivo de respaldo.</span>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="closeRestoreModal"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="executeRestore"
              :disabled="!pendingBackupPackage || !supervisorPinInput || backupStore.isRestoring"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-primary text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-base">restore</span>
              <span>{{ backupStore.isRestoring ? 'Restaurando...' : 'Confirmar y Restaurar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual PIN Assignment Modal -->
    <div v-if="showManualPinModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showManualPinModal = false"></div>
      <div class="relative glass-card w-full max-w-md p-6 z-10 animate-in">
        <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-amber-500/15 text-amber-500 material-symbols-outlined">pin</span>
            <h4 class="text-base font-bold text-on-surface">Asignar PIN de Supervisor</h4>
          </div>
          <button @click="showManualPinModal = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="manualPinError" class="mb-4 p-3 rounded-xl bg-error/10 text-error text-xs font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{{ manualPinError }}</span>
        </div>

        <form @submit.prevent="saveManualPin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nuevo Código PIN (4 a 8 dígitos) *</label>
            <input
              v-model="manualPinInput"
              type="password"
              maxlength="8"
              required
              placeholder="Ej: 5824"
              class="w-full bg-surface-container border-0 rounded-xl px-4 py-3 text-on-surface text-lg font-mono text-center tracking-widest focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
            />
            <p class="text-[11px] text-on-surface-variant mt-1">Este PIN tendrá vigencia de 24 horas a partir del momento en que sea guardado.</p>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              @click="showManualPinModal = false"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <span class="material-symbols-outlined text-base">save</span>
              <span>Guardar y Activar PIN (24h)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useThemeStore } from '~/stores/theme';
import { useBackupStore } from '~/stores/backup';
import { useSalesStore } from '~/stores/sales';
import { useCustomersStore } from '~/stores/customers';
import { useInventoryStore } from '~/stores/inventory';
import { useTanksStore } from '~/stores/tanks';
import { useToast } from '~/composables/useToast';
import {
  validateRequired,
  validateTaxId,
  validatePhone,
  sanitizeFormData,
} from '~/utils/validators';

definePageMeta({
  middleware: ['auth'],
});

const themeStore = useThemeStore();
const backupStore = useBackupStore();
const salesStore = useSalesStore();
const customersStore = useCustomersStore();
const inventoryStore = useInventoryStore();
const tanksStore = useTanksStore();
const toast = useToast();

const showBranchModal = ref(false);
const isEditingBranch = ref(false);
const editingBranchId = ref<string | null>(null);
const branchError = ref('');

// Backup & Restoration Modal state
const showRestoreModal = ref(false);
const restoreError = ref('');
const supervisorPinInput = ref('');
const pendingBackupPackage = ref<any>(null);

// Supervisor Security State
const showSupervisorPin = ref(false);
const showManualPinModal = ref(false);
const manualPinInput = ref('');
const manualPinError = ref('');

const branchForm = reactive({
  name: '',
  address: '',
});

const companyForm = reactive({
  businessName: 'AquaPure Pro S.A.',
  taxId: '20549382910',
  phone: '+51 987 654 321',
  address: 'Av. Tecnológica 1042, Parque Industrial',
});

const paymentMethods = reactive({
  cash: true,
  transfer: true,
  pos: false,
  qr: true,
});

const generalSettings = reactive({
  language: 'es-LA',
  currency: 'USD',
  timezone: 'UTC-5',
});

const branches = ref([
  {
    id: 'b-1',
    name: 'Local Principal',
    address: 'Av. Tecnológica 1042, Zona Centro',
    isMatrix: true,
  },
  {
    id: 'b-2',
    name: 'Sucursal Norte',
    address: 'Plaza Comercial Los Pinos, L-12',
    isMatrix: false,
  },
]);

const setTheme = (mode: 'light' | 'dark') => {
  themeStore.setTheme(mode);
  toast.info(`Tema cambiado a ${mode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}`);
};

const triggerUploadLogo = () => {
  toast.info('Seleccione un archivo de imagen (PNG o SVG) para el logotipo.');
};

const openAddBranchModal = () => {
  isEditingBranch.value = false;
  editingBranchId.value = null;
  branchError.value = '';
  branchForm.name = '';
  branchForm.address = '';
  showBranchModal.value = true;
};

const editBranch = (branch: any) => {
  isEditingBranch.value = true;
  editingBranchId.value = branch.id;
  branchError.value = '';
  branchForm.name = branch.name;
  branchForm.address = branch.address;
  showBranchModal.value = true;
};

const saveBranch = () => {
  branchError.value = '';
  const cleaned = sanitizeFormData(branchForm);

  const nameError = validateRequired(cleaned.name, 'El nombre de la sucursal');
  if (nameError) {
    branchError.value = nameError;
    return;
  }

  const addressError = validateRequired(cleaned.address, 'La dirección');
  if (addressError) {
    branchError.value = addressError;
    return;
  }

  if (isEditingBranch.value && editingBranchId.value) {
    const idx = branches.value.findIndex(b => b.id === editingBranchId.value);
    if (idx !== -1) {
      branches.value[idx].name = cleaned.name;
      branches.value[idx].address = cleaned.address;
      toast.updateSuccess('Sucursal', `Sucursal ${cleaned.name} actualizada.`);
    }
  } else {
    branches.value.push({
      id: `b-${Date.now()}`,
      name: cleaned.name,
      address: cleaned.address,
      isMatrix: false,
    });
    toast.createSuccess('Sucursal', `Sucursal ${cleaned.name} agregada al sistema.`);
  }

  showBranchModal.value = false;
};

const deleteBranch = (branch: any) => {
  branches.value = branches.value.filter((b) => b.id !== branch.id);
  toast.deleteSuccess('Sucursal', `Sucursal ${branch.name} eliminada.`);
};

// Supervisor PIN Security Handlers
const generateDailyRandomPin = () => {
  const newPin = salesStore.generateNewDailyPin('AUTO_DAILY');
  showSupervisorPin.value = true;
  toast.success('Nuevo PIN Diario Generado', `PIN de Supervisor del día: ${newPin} (Vigente por 24h)`);
};

const openManualPinModal = () => {
  manualPinInput.value = '';
  manualPinError.value = '';
  showManualPinModal.value = true;
};

const saveManualPin = () => {
  manualPinError.value = '';
  const pin = manualPinInput.value.trim();
  if (pin.length < 4 || pin.length > 8) {
    manualPinError.value = 'El PIN debe tener entre 4 y 8 dígitos.';
    return;
  }

  salesStore.generateNewDailyPin('MANUAL', pin);
  showSupervisorPin.value = true;
  showManualPinModal.value = false;
  toast.success('PIN Asignado Manualmente', `Nuevo PIN de Supervisor: ${pin} activado con vigencia de 24 horas.`);
};

const unlockSupervisorSecurity = () => {
  salesStore.unlockSupervisorPin();
  toast.success('Sistema Desbloqueado', 'Se restableció el contador de intentos y se reactivaron las autorizaciones.');
};

const copySupervisorPin = async () => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(salesStore.supervisorSecurity.pin);
      toast.info('PIN Copiado', 'El código de supervisor fue copiado al portapapeles.');
      return;
    } catch {
      // ignore
    }
  }
  toast.info('PIN de Supervisor', `Código: ${salesStore.supervisorSecurity.pin}`);
};

const toggleAutoRotateDaily = (event: Event) => {
  const target = event.target as HTMLInputElement;
  salesStore.setAutoRotateDaily(target.checked);
  toast.info(
    'Rotación de PIN',
    target.checked
      ? 'Rotación automática diaria activada (nuevo PIN cada 24h).'
      : 'Rotación automática desactivada.'
  );
};

// Backup & Disaster Recovery Actions
const triggerExportBackup = () => {
  const result = backupStore.exportBackupToFile();
  if (result.success) {
    toast.success(
      'Copia de Seguridad Generada',
      `Archivo ${result.filename} (${Math.round(result.sizeBytes / 1024)} KB) descargado exitosamente.`
    );
  } else {
    toast.error('Error al generar respaldo', 'No se pudo crear el archivo de copia de seguridad.');
  }
};

const toggleAutoBackup = (event: Event) => {
  const target = event.target as HTMLInputElement;
  backupStore.setAutoBackup(target.checked);
  toast.info(
    'Respaldo Automático',
    target.checked
      ? 'Respaldo automático al cierre de caja activado.'
      : 'Respaldo automático al cierre de caja desactivado.'
  );
};

const openRestoreModal = () => {
  restoreError.value = '';
  supervisorPinInput.value = '';
  pendingBackupPackage.value = null;
  showRestoreModal.value = true;
};

const closeRestoreModal = () => {
  showRestoreModal.value = false;
  restoreError.value = '';
  supervisorPinInput.value = '';
  pendingBackupPackage.value = null;
};

const handleFileSelected = (event: Event) => {
  restoreError.value = '';
  pendingBackupPackage.value = null;
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const validation = backupStore.validateBackupContent(text);
    if (!validation.valid || !validation.pkg) {
      restoreError.value = validation.error || 'Archivo de respaldo inválido.';
      return;
    }
    pendingBackupPackage.value = validation.pkg;
  };
  reader.onerror = () => {
    restoreError.value = 'Error al leer el archivo seleccionado.';
  };
  reader.readAsText(file);
};

const executeRestore = () => {
  restoreError.value = '';
  if (!pendingBackupPackage.value) {
    restoreError.value = 'Debe seleccionar un archivo de respaldo válido.';
    return;
  }
  if (!supervisorPinInput.value.trim()) {
    restoreError.value = 'Debe ingresar el PIN de Supervisor para autorizar la restauración.';
    return;
  }

  const result = backupStore.restoreFromBackupPackage(
    pendingBackupPackage.value,
    supervisorPinInput.value.trim()
  );

  if (!result.success) {
    restoreError.value = result.error || 'No se pudo restaurar la base de datos.';
    return;
  }

  toast.success(
    'Base de Datos Restaurada',
    `Se restauraron exitosamente ${result.stats?.invoices || 0} facturas, ${result.stats?.customers || 0} clientes y niveles de tanque.`
  );
  closeRestoreModal();
};

const formatIsoDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const saveAllSettings = () => {
  const cleanedCompany = sanitizeFormData(companyForm);

  const nameErr = validateRequired(cleanedCompany.businessName, 'El nombre comercial');
  if (nameErr) {
    toast.error('Error de validación', nameErr);
    return;
  }

  const taxErr = validateTaxId(cleanedCompany.taxId, 'El RUC/NIT');
  if (taxErr) {
    toast.error('Error de validación', taxErr);
    return;
  }

  const phoneErr = validatePhone(cleanedCompany.phone, 'El teléfono');
  if (phoneErr) {
    toast.error('Error de validación', phoneErr);
    return;
  }

  // Persist company form to localStorage for backup consistency
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('aquapure_company_form_v1', JSON.stringify(cleanedCompany));
      localStorage.setItem('aquapure_branches_v1', JSON.stringify(branches.value));
      localStorage.setItem('aquapure_payment_methods_v1', JSON.stringify(paymentMethods));
      localStorage.setItem('aquapure_general_settings_v1', JSON.stringify(generalSettings));
    } catch {
      // ignore
    }
  }

  toast.success('Configuración guardada', 'Todos los parámetros corporativos fueron actualizados.');
};
</script>
