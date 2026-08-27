import 'reflect-metadata';
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors } from '@feathersjs/koa';
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

// ============================================================
// Allowed CORS origins (restrict in production)
// ============================================================
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,*')
  .split(',')
  .map(o => o.trim());

const app = koa(feathers());

// Load configuration
app.configure(configuration());

// ============================================================
// Security: HTTP Security Headers
// ============================================================
app.use(async (ctx, next) => {
  // Prevent browsers from MIME-type sniffing
  ctx.set('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  ctx.set('X-Frame-Options', 'DENY');
  // Enable XSS protection in older browsers
  ctx.set('X-XSS-Protection', '1; mode=block');
  // Strict Transport Security (uncomment in production with HTTPS)
  // ctx.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Remove server fingerprinting
  ctx.remove('X-Powered-By');
  // Referrer policy
  ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  await next();
});

// ============================================================
// Security: CORS — restrict to known origins
// ============================================================
app.use(cors({
  origin: (ctx) => {
    const requestOrigin = ctx.request.headers.origin;
    if (!requestOrigin) return '*';
    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
    return requestOrigin;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // Cache preflight for 24h
}));

app.use(bodyParser());
app.use(parseAuthentication());
app.use(errorHandler());

// ============================================================
// Database
// ============================================================
const prisma = new PrismaService();
app.set('prisma', prisma);

// Dependency Injection
app.set('container', container);

// REST API
app.configure(rest());

// Socket.io
app.configure(socketio({
  cors: {
    origin: '*',
    credentials: true,
  },
}));

// Authentication
app.configure(authentication);

// ============================================================
// Register services
// ============================================================
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

// ============================================================
// Health Check
// ============================================================
class HealthService {
  async find() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
app.use('health', new HealthService());

// ============================================================
// Global Error Handler
// ============================================================
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

// ============================================================
// Start Server
// ============================================================
const PORT = process.env.API_PORT || process.env.PORT || 3030;

let server: any;

async function start() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    server = await app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 REST API: http://localhost:${PORT}`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
      logger.info(`🛡️  CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
    });

    // Start InsForge cloud mirror background sync
    if (process.env.INSFORGE_MIRROR_SYNC !== 'false') {
      try {
        const { MirrorSyncService } = await import('./infrastructure/sync/mirror-sync.service');
        const mirrorSync = new MirrorSyncService();
        mirrorSync.startPeriodicSync(15); // Sync every 15 minutes
        logger.info('☁️  InsForge Cloud Mirror Sync active (Interval: 15 min)');
      } catch (mirrorErr) {
        logger.warn({ err: mirrorErr }, 'InsForge mirror sync initialization skipped');
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  if (server && typeof server.close === 'function') {
    server.close();
  }
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();