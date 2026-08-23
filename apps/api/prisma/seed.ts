import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role, ProductCategory, UnitOfMeasure, SaleStatus, InvoiceStatus, MovementType, PaymentMethod, PaymentStatus, ReturnStatus, ReturnCondition, SettingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      code: 'MAIN',
      address: '123 Main St, City',
      isActive: true,
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aquasystem.com' },
    update: {},
    create: {
      email: 'admin@aquasystem.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@aquasystem.com' },
    update: {},
    create: {
      email: 'manager@aquasystem.com',
      passwordHash: hashedPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: Role.MANAGER,
      isActive: true,
    },
  });

  // Create operator user
  const operator = await prisma.user.upsert({
    where: { email: 'operator@aquasystem.com' },
    update: {},
    create: {
      email: 'operator@aquasystem.com',
      passwordHash: hashedPassword,
      firstName: 'Operator',
      lastName: 'User',
      role: Role.OPERATOR,
      isActive: true,
    },
  });

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'WB-001' },
      update: {},
      create: {
        sku: 'WB-001',
        name: '500ml Water Bottle',
        description: 'Premium spring water bottle',
        category: ProductCategory.WATER_BOTTLES,
        unit: UnitOfMeasure.UNIT,
        price: 1.50,
        cost: 0.75,
        minStock: 100,
        maxStock: 1000,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'WJ-001' },
      update: {},
      create: {
        sku: 'WJ-001',
        name: '5L Water Jug',
        description: 'Large water jug for dispensers',
        category: ProductCategory.WATER_JUGS,
        unit: UnitOfMeasure.UNIT,
        price: 8.00,
        cost: 4.00,
        minStock: 20,
        maxStock: 200,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'FL-001' },
      update: {},
      create: {
        sku: 'FL-001',
        name: 'Carbon Filter Cartridge',
        description: 'Replacement filter for water dispensers',
        category: ProductCategory.FILTERS,
        unit: UnitOfMeasure.PACK,
        price: 12.00,
        cost: 6.00,
        minStock: 10,
        maxStock: 100,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DS-001' },
      update: {},
      create: {
        sku: 'DS-001',
        name: 'Hot/Cold Water Dispenser',
        description: 'Stainless steel water dispenser',
        category: ProductCategory.DISPENSERS,
        unit: UnitOfMeasure.UNIT,
        price: 150.00,
        cost: 90.00,
        minStock: 2,
        maxStock: 20,
        isActive: true,
      },
    }),
  ]);

  // Initialize inventory for products
  for (const product of products) {
    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouse.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 0,
        reservedQty: 0,
      },
    });
  }

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { code: 'CUST-001' },
      update: {},
      create: {
        code: 'CUST-001',
        name: 'AquaPure Retail Store',
        email: 'orders@aquapure-retail.com',
        phone: '+1-555-0101',
        address: '100 Retail Ave, City',
        taxId: 'TAX-001',
        creditLimit: 50000,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-002' },
      update: {},
      create: {
        code: 'CUST-002',
        name: 'Green Valley Offices',
        email: 'facilities@greenvalley.com',
        phone: '+1-555-0102',
        address: '200 Business Blvd, City',
        taxId: 'TAX-002',
        creditLimit: 25000,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-003' },
      update: {},
      create: {
        code: 'CUST-003',
        name: 'Sunrise Café',
        email: 'owner@sunrisecafe.com',
        phone: '+1-555-0103',
        address: '300 Coffee St, City',
        taxId: 'TAX-003',
        creditLimit: 10000,
        isActive: true,
      },
    }),
  ]);

  // Create system settings
  await Promise.all([
    prisma.systemSetting.upsert({
      where: { key: 'company.name' },
      update: {},
      create: { key: 'company.name', value: 'AquaPure Pro', type: SettingType.STRING, description: 'Company name', isPublic: true },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'company.address' },
      update: {},
      create: { key: 'company.address', value: '123 Water St, City', type: SettingType.STRING, description: 'Company address', isPublic: true },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'company.phone' },
      update: {},
      create: { key: 'company.phone', value: '+1-555-0000', type: SettingType.STRING, description: 'Company phone', isPublic: true },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'company.email' },
      update: {},
      create: { key: 'company.email', value: 'info@aquasystem.com', type: SettingType.STRING, description: 'Company email', isPublic: true },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'tax.rate' },
      update: {},
      create: { key: 'tax.rate', value: '21', type: SettingType.NUMBER, description: 'Default tax rate percentage', isPublic: true },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'currency' },
      update: {},
      create: { key: 'currency', value: 'EUR', type: SettingType.STRING, description: 'Default currency', isPublic: true },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'invoice.prefix' },
      update: {},
      create: { key: 'invoice.prefix', value: 'INV', type: SettingType.STRING, description: 'Invoice number prefix', isPublic: false },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'sale.prefix' },
      update: {},
      create: { key: 'sale.prefix', value: 'SALE', type: SettingType.STRING, description: 'Sale number prefix', isPublic: false },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'low.stock.threshold' },
      update: {},
      create: { key: 'low.stock.threshold', value: '0.2', type: SettingType.NUMBER, description: 'Low stock threshold as percentage of min stock', isPublic: false },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'theme.default' },
      update: {},
      create: { key: 'theme.default', value: 'light', type: SettingType.STRING, description: 'Default theme', isPublic: true },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${products.length} products`);
  console.log(`Created ${customers.length} customers`);
  console.log(`Created users: admin, manager, operator`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });