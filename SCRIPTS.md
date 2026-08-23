# AquaSystem - Scripts Reference

## Main Scripts

### `start.sh` - Production Startup
Main entry point for running AquaSystem with Docker Compose.

```bash
# Start everything
./start.sh

# Start with options
./start.sh start          # Normal start (default)
./start.sh stop           # Stop all services
./start.sh restart        # Restart all services
./start.sh logs           # Follow logs (all services)
./start.sh logs api       # Follow API logs only
./start.sh status         # Show container status
./start.sh clean          # Remove all containers, volumes, images
./start.sh db:migrate     # Run migrations only
./start.sh db:seed        # Seed database only
./start.sh db:studio      # Open Prisma Studio
./start.sh build          # Build all packages
./start.sh test           # Run tests
./start.sh lint           # Run linter
./start.sh typecheck      # TypeScript check

# Environment variables
SKIP_BUILD=true ./start.sh      # Skip build step
SKIP_DB=true ./start.sh         # Skip migrations/seeding
FOLLOW_LOGS=true ./start.sh     # Follow logs after start
```

### `dev.sh` - Development Mode
Runs API and Web locally with hot reload (only infrastructure in Docker).

```bash
./dev.sh
```

**Features:**
- PostgreSQL & Redis in Docker
- API (Feathers) on port 3030 with hot reload
- Web (Nuxt 3) on port 3000 with hot reload
- Auto-runs migrations & seeding
- Ctrl+C stops everything cleanly

### `db.sh` - Database Management
```bash
./db.sh migrate          # Run pending migrations
./db.sh migrate:prod     # Production migrations (with confirmation)
./db.sh generate         # Generate Prisma Client
./db.sh seed             # Seed initial data
./db.sh studio           # Open Prisma Studio
./db.sh reset            # Reset DB (DELETES ALL DATA)
./db.sh status           # Show migration status
./db.sh diff             # Show schema diff
./db.sh pull             # Pull schema from DB
./db.sh push             # Push schema to DB
./db.sh backup           # Create SQL backup
./db.sh restore <file>   # Restore from backup
```

### `test.sh` - Test Runner
```bash
./test.sh unit           # Unit tests
./test.sh unit:watch     # Unit tests (watch mode)
./test.sh unit:coverage  # Unit tests with coverage
./test.sh e2e            # E2E tests
./test.sh e2e:ui         # E2E with Playwright UI
./test.sh e2e:headed     # E2E headed mode
./test.sh lint           # Linter
./test.sh lint:fix       # Linter with auto-fix
./test.sh typecheck      # TypeScript check
./test.sh format         # Prettier format
./test.sh all            # Full test suite
./test.sh ci             # CI pipeline (typecheck + lint + test + build)
```

## Quick Start

```bash
# 1. First time setup
git clone <repo>
cd aquapuresystem

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Development mode (recommended for development)
./dev.sh

# 4. Or production mode
./start.sh
```

## Service URLs

| Service | Development | Production (Docker) |
|---------|-------------|---------------------|
| Web (Nuxt) | http://localhost:3000 | http://localhost:3000 |
| API (Feathers) | http://localhost:3030 | http://localhost:3030 |
| API Health | http://localhost:3030/health | http://localhost:3030/health |
| PostgreSQL | localhost:5432 | localhost:5432 |
| Redis | localhost:6379 | localhost:6379 |
| Prisma Studio | `./db.sh studio` | `./start.sh db:studio` |

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aquasystem.com | admin123 |
| Manager | manager@aquasystem.com | admin123 |
| Operator | operator@aquasystem.com | admin123 |

## Environment Variables

Key variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://aqua:password@localhost:5432/aquasystem
DB_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-32-char-secret-minimum
JWT_REFRESH_SECRET=your-32-char-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@aquasystem.com
SMTP_PASS=password

# Frontend
NUXT_PUBLIC_API_URL=http://localhost:3030
NUXT_PUBLIC_WS_URL=ws://localhost:3030
```

## Docker Commands

```bash
# View logs
docker-compose logs -f              # All services
docker-compose logs -f api          # API only
docker-compose logs -f web          # Web only
docker-compose logs -f postgres     # PostgreSQL only

# Execute commands in containers
docker-compose exec api sh          # API shell
docker-compose exec web sh          # Web shell
docker-compose exec postgres psql -U aqua -d aquasystem  # PostgreSQL shell

# Restart specific service
docker-compose restart api
docker-compose restart web

# Rebuild and restart
docker-compose up -d --build api
docker-compose up -d --build web

# Full reset
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port conflicts
```bash
# Check what's using ports
lsof -i :3000  # Web
lsof -i :3030  # API
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Database connection issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify database is ready
docker-compose exec postgres pg_isready -U aqua -d aquasystem
```

### Clear everything and start fresh
```bash
./start.sh clean
./start.sh
```

### Permission issues
```bash
# Fix script permissions
chmod +x *.sh
```

## CI/CD Integration

The scripts are designed to work in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run CI
  run: |
    ./test.sh ci
    ./start.sh build
```