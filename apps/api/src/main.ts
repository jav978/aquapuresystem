import 'reflect-metadata';
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, helmet, compression } from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';
import { authentication } from './authentication';
import { channels } from './channels';
import { container, TYPES } from './infrastructure/config/di.container';
import { PrismaService } from '@aquasystem/infrastructure';
import { logger } from '@aquasystem/infrastructure';

// Import services
import { UsersService } from './infrastructure/feathers/services/users.service';
import { ProductsService } from './infrastructure/feathers/services/products.service';
import { CustomersService } from './infrastructure/feathers/services/customers.service';
import { WarehousesService } from './infrastructure/feathers/services/warehouses.service';
import { SalesService } from './infrastructure/feathers/services/sales.service';
import { InvoicesService } from './infrastructure/feathers/services/invoices.service';
import { ReturnsService } from './infrastructure/feathers/services/returns.service';
import { PaymentsService } from './infrastructure/feathers/services/payments.service';
import { SettingsService } from './infrastructure/feathers/services/settings.service';
import { InventoryMovementsService } from './infrastructure/feathers/services/inventory-movements.service';

const app = koa(feathers());

// Load configuration
app.configure(configuration());

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(bodyParser());
app.use(parseAuthentication());
app.use(errorHandler());

// Database
const prisma = new PrismaService();
app.set('prisma', prisma);

// Dependency Injection
app.set('container', container);

// Authentication
app.configure(authentication);

// REST API
app.configure(rest());

// Socket.io
app.configure(socketio({
  cors: {
    origin: true,
    credentials: true,
  },
}));

// Register services
app.use('users', new UsersService());
app.use('products', new ProductsService());
app.use('customers', new CustomersService());
app.use('warehouses', new WarehousesService());
app.use('sales', new SalesService());
app.use('invoices', new InvoicesService());
app.use('returns', new ReturnsService());
app.use('payments', new PaymentsService());
app.use('settings', new SettingsService());
app.use('inventory-movements', new InventoryMovementsService());

// Channels
app.configure(channels);

// Health check
app.use('/health', async (ctx) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    ctx.status = 503;
    ctx.body = { status: 'error', timestamp: new Date().toISOString() };
  }
});

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error: any) {
    logger.error({ err: error }, 'Unhandled error');
    ctx.status = error.status || 500;
    ctx.body = {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
    };
  }
});

// Start server
const PORT = process.env.PORT || 3030;

async function start() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 REST API: http://localhost:${PORT}`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

start();