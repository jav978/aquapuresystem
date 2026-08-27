import { PrismaClient } from '@prisma/client';

export interface SyncResult {
  success: boolean;
  timestamp: string;
  syncedCounts: Record<string, number>;
  errors?: string[];
}

export class MirrorSyncService {
  private localPrisma: PrismaClient;
  private mirrorPrisma: PrismaClient | null = null;
  private mirrorUrl: string;
  private isSyncing = false;

  constructor(mirrorDatabaseUrl?: string) {
    this.localPrisma = new PrismaClient();
    this.mirrorUrl =
      mirrorDatabaseUrl ||
      process.env.INSFORGE_DATABASE_URL ||
      'postgresql://postgres:b206e860499585f06971edae2852cc2e@bt8vez2n.us-east.database.insforge.app:5432/insforge?sslmode=require';

    if (this.mirrorUrl) {
      this.mirrorPrisma = new PrismaClient({
        datasources: {
          db: {
            url: this.mirrorUrl,
          },
        },
      });
    }
  }

  public async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        syncedCounts: {},
        errors: ['Sync already in progress'],
      };
    }

    if (!this.mirrorPrisma) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        syncedCounts: {},
        errors: ['Mirror database connection is not configured'],
      };
    }

    this.isSyncing = true;
    const syncedCounts: Record<string, number> = {};
    const errors: string[] = [];

    try {
      // 1. Sync Users
      const localUsers = await this.localPrisma.user.findMany();
      let usersSynced = 0;
      for (const u of localUsers) {
        await this.mirrorPrisma.user.upsert({
          where: { id: u.id },
          update: {
            email: u.email,
            passwordHash: u.passwordHash,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            isActive: u.isActive,
            lastLoginAt: u.lastLoginAt,
            updatedAt: u.updatedAt,
          },
          create: {
            id: u.id,
            email: u.email,
            passwordHash: u.passwordHash,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            isActive: u.isActive,
            lastLoginAt: u.lastLoginAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          },
        });
        usersSynced++;
      }
      syncedCounts['users'] = usersSynced;

      // 2. Sync Warehouses
      const localWarehouses = await this.localPrisma.warehouse.findMany();
      let warehousesSynced = 0;
      for (const w of localWarehouses) {
        await this.mirrorPrisma.warehouse.upsert({
          where: { id: w.id },
          update: {
            name: w.name,
            code: w.code,
            address: w.address,
            isActive: w.isActive,
            updatedAt: w.updatedAt,
          },
          create: {
            id: w.id,
            name: w.name,
            code: w.code,
            address: w.address,
            isActive: w.isActive,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
          },
        });
        warehousesSynced++;
      }
      syncedCounts['warehouses'] = warehousesSynced;

      // 3. Sync Products
      const localProducts = await this.localPrisma.product.findMany();
      let productsSynced = 0;
      for (const p of localProducts) {
        await this.mirrorPrisma.product.upsert({
          where: { id: p.id },
          update: {
            sku: p.sku,
            name: p.name,
            description: p.description,
            category: p.category,
            unit: p.unit,
            price: p.price,
            cost: p.cost,
            minStock: p.minStock,
            maxStock: p.maxStock,
            isActive: p.isActive,
            imageUrl: p.imageUrl,
            updatedAt: p.updatedAt,
          },
          create: {
            id: p.id,
            sku: p.sku,
            name: p.name,
            description: p.description,
            category: p.category,
            unit: p.unit,
            price: p.price,
            cost: p.cost,
            minStock: p.minStock,
            maxStock: p.maxStock,
            isActive: p.isActive,
            imageUrl: p.imageUrl,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          },
        });
        productsSynced++;
      }
      syncedCounts['products'] = productsSynced;

      // 4. Sync Inventory
      const localInventory = await this.localPrisma.inventory.findMany();
      let inventorySynced = 0;
      for (const inv of localInventory) {
        await this.mirrorPrisma.inventory.upsert({
          where: { id: inv.id },
          update: {
            productId: inv.productId,
            warehouseId: inv.warehouseId,
            quantity: inv.quantity,
            reservedQuantity: inv.reservedQuantity,
            location: inv.location,
            updatedAt: inv.updatedAt,
          },
          create: {
            id: inv.id,
            productId: inv.productId,
            warehouseId: inv.warehouseId,
            quantity: inv.quantity,
            reservedQuantity: inv.reservedQuantity,
            location: inv.location,
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt,
          },
        });
        inventorySynced++;
      }
      syncedCounts['inventory'] = inventorySynced;

      // 5. Sync Customers
      const localCustomers = await this.localPrisma.customer.findMany();
      let customersSynced = 0;
      for (const c of localCustomers) {
        await this.mirrorPrisma.customer.upsert({
          where: { id: c.id },
          update: {
            code: c.code,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            taxId: c.taxId,
            creditLimit: c.creditLimit,
            isActive: c.isActive,
            updatedAt: c.updatedAt,
          },
          create: {
            id: c.id,
            code: c.code,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            taxId: c.taxId,
            creditLimit: c.creditLimit,
            isActive: c.isActive,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          },
        });
        customersSynced++;
      }
      syncedCounts['customers'] = customersSynced;

      // 6. Sync Sales & Sale Items
      const localSales = await this.localPrisma.sale.findMany({
        include: { items: true },
      });
      let salesSynced = 0;
      for (const s of localSales) {
        await this.mirrorPrisma.sale.upsert({
          where: { id: s.id },
          update: {
            saleNumber: s.saleNumber,
            customerId: s.customerId,
            userId: s.userId,
            status: s.status,
            subtotal: s.subtotal,
            taxAmount: s.taxAmount,
            discount: s.discount,
            total: s.total,
            notes: s.notes,
            saleDate: s.saleDate,
            updatedAt: s.updatedAt,
          },
          create: {
            id: s.id,
            saleNumber: s.saleNumber,
            customerId: s.customerId,
            userId: s.userId,
            status: s.status,
            subtotal: s.subtotal,
            taxAmount: s.taxAmount,
            discount: s.discount,
            total: s.total,
            notes: s.notes,
            saleDate: s.saleDate,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          },
        });

        for (const item of s.items) {
          await this.mirrorPrisma.saleItem.upsert({
            where: { id: item.id },
            update: {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: item.total,
            },
            create: {
              id: item.id,
              saleId: item.saleId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: item.total,
            },
          });
        }
        salesSynced++;
      }
      syncedCounts['sales'] = salesSynced;

      // 7. Sync Invoices & Invoice Items
      const localInvoices = await this.localPrisma.invoice.findMany({
        include: { items: true },
      });
      let invoicesSynced = 0;
      for (const inv of localInvoices) {
        await this.mirrorPrisma.invoice.upsert({
          where: { id: inv.id },
          update: {
            invoiceNumber: inv.invoiceNumber,
            saleId: inv.saleId,
            customerId: inv.customerId,
            userId: inv.userId,
            status: inv.status,
            subtotal: inv.subtotal,
            taxAmount: inv.taxAmount,
            total: inv.total,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            paidDate: inv.paidDate,
            notes: inv.notes,
            updatedAt: inv.updatedAt,
          },
          create: {
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            saleId: inv.saleId,
            customerId: inv.customerId,
            userId: inv.userId,
            status: inv.status,
            subtotal: inv.subtotal,
            taxAmount: inv.taxAmount,
            total: inv.total,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            paidDate: inv.paidDate,
            notes: inv.notes,
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt,
          },
        });

        for (const item of inv.items) {
          await this.mirrorPrisma.invoiceItem.upsert({
            where: { id: item.id },
            update: {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              taxRate: item.taxRate,
              total: item.total,
            },
            create: {
              id: item.id,
              invoiceId: item.invoiceId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              taxRate: item.taxRate,
              total: item.total,
            },
          });
        }
        invoicesSynced++;
      }
      syncedCounts['invoices'] = invoicesSynced;

      // 8. Sync System Settings
      const localSettings = await this.localPrisma.systemSetting.findMany();
      let settingsSynced = 0;
      for (const s of localSettings) {
        await this.mirrorPrisma.systemSetting.upsert({
          where: { key: s.key },
          update: {
            value: s.value,
            type: s.type,
            description: s.description,
            isPublic: s.isPublic,
            updatedAt: s.updatedAt,
          },
          create: {
            id: s.id,
            key: s.key,
            value: s.value,
            type: s.type,
            description: s.description,
            isPublic: s.isPublic,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          },
        });
        settingsSynced++;
      }
      syncedCounts['system_settings'] = settingsSynced;

      return {
        success: true,
        timestamp: new Date().toISOString(),
        syncedCounts,
      };
    } catch (err: any) {
      console.error('[MirrorSync] Error during database synchronization:', err);
      errors.push(err.message || String(err));
      return {
        success: false,
        timestamp: new Date().toISOString(),
        syncedCounts,
        errors,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  public startPeriodicSync(intervalMinutes = 10) {
    console.log(`[MirrorSync] Periodic mirror sync scheduled every ${intervalMinutes} minutes.`);
    setInterval(async () => {
      console.log('[MirrorSync] Running scheduled background mirror sync to InsForge...');
      const res = await this.syncAll();
      if (res.success) {
        console.log('[MirrorSync] Sync completed successfully:', res.syncedCounts);
      } else {
        console.warn('[MirrorSync] Scheduled sync encountered errors:', res.errors);
      }
    }, intervalMinutes * 60 * 1000);
  }

  public async disconnect() {
    await this.localPrisma.$disconnect();
    if (this.mirrorPrisma) {
      await this.mirrorPrisma.$disconnect();
    }
  }
}
