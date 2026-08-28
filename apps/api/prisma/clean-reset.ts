import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpieza de datos de la base de datos para Producción...');

  // 1. Limpiar tablas transaccionales y de negocio en orden de dependencia de claves foráneas
  console.log('🗑️  Eliminando pagos, devoluciones, facturas y ventas...');
  await prisma.payment.deleteMany({});
  await prisma.returnItem.deleteMany({});
  await prisma.return.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});

  console.log('🗑️  Eliminando movimientos y registros de inventario...');
  await prisma.inventoryMovement.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.warehouse.deleteMany({});

  console.log('🗑️  Eliminando clientes y logs de auditoría...');
  await prisma.customer.deleteMany({});
  await prisma.activityLog.deleteMany({});

  // 2. Limpiar todos los usuarios excepto los que tienen rol ADMIN
  console.log('🗑️  Eliminando usuarios secundarios (dejando solo Administrador)...');
  await prisma.user.deleteMany({
    where: {
      role: {
        not: Role.ADMIN,
      },
    },
  });

  // 3. Asegurar que existe al menos el usuario Administrador principal
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aquapure.com' },
    update: {
      role: Role.ADMIN,
      isActive: true,
      passwordHash: hashedPassword,
    },
    create: {
      email: 'admin@aquapure.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'AquaPure',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Asegurar también el admin@aquasystem.com si se usa como alias
  await prisma.user.upsert({
    where: { email: 'admin@aquasystem.com' },
    update: {
      role: Role.ADMIN,
      isActive: true,
      passwordHash: hashedPassword,
    },
    create: {
      email: 'admin@aquasystem.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'AquaPure',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Base de datos limpia y lista para Producción.');
  console.log(`👤 Usuario Administrador activo: ${adminUser.email} (Rol: ADMIN)`);
  console.log('📦 El sistema está listo para cargar usuarios, rubros, almacenes, tanques y productos desde cero.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza de la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
