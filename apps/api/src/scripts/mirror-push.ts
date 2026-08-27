import { MirrorSyncService } from '../infrastructure/sync/mirror-sync.service';

async function main() {
  console.log('🔄 Iniciando sincronización de base de datos local -> Espejo InsForge Cloud...');
  const syncService = new MirrorSyncService();

  const startTime = Date.now();
  const result = await syncService.syncAll();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  if (result.success) {
    console.log(`✅ Sincronización exitosa en ${duration}s.`);
    console.log('📊 Registros espejados en InsForge:');
    for (const [table, count] of Object.entries(result.syncedCounts)) {
      console.log(`   - ${table}: ${count} registros`);
    }
  } else {
    console.error('❌ Error durante la sincronización:', result.errors);
    process.exit(1);
  }

  await syncService.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error in mirror push:', err);
  process.exit(1);
});
