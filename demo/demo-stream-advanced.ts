// DEMO STREAMING AVANZADO - VALIDRA
import { performance } from 'perf_hooks';
import readline from 'readline';
import { ValidraEngine } from '../src/engine/validra-engine';
import { generateAdvancedDemoDataWithProgress } from './data-generator-advanced';
import { advancedRules } from './ruleset-advanced';

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🔵 DEMO STREAMING AVANZADA VALIDRA');

  // PROMPTS INTERACTIVOS
  const cantidadStr = await promptUser('📦 Cantidad de datos a generar: ');
  const total = Number(cantidadStr) > 0 ? Number(cantidadStr) : 100000;
  const usarPoolStr = await promptUser('💾 Usar MemoryPool (s/N): ');
  const usarMemoryPool = /^s/i.test(usarPoolStr);

  // Inicializar engine con la configuración elegida
  const engine = new ValidraEngine(advancedRules, {
    debug: false,
    enableMemoryPool: usarMemoryPool,
    memoryPoolSize: 200,
    enableStreaming: true,
    silent: true,
  });

  // Medir tiempo de generación de datos
  const { data } = generateAdvancedDemoDataWithProgress(total, 0.25);

  // Medir tiempo de validación
  const t0 = performance.now();
  let processed = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _ of engine.validateStream(data)) {
    processed++;
    if (processed % 1000 === 0 || processed === data.length) {
      console.log(`⚡ Validando registro ${processed} de ${data.length}`);
    }
  }
  const t1 = performance.now();
  console.log(`\n✅ Total de registros validados: ${total}`);
  printMetrics(engine, t1 - t0);
  console.log('\n🔵 DEMO STREAMING FINALIZADA');
}

function printMetrics(engine: ValidraEngine, tiempo: number) {
  const metrics = engine.getMetrics();
  console.log('\n--- MÉTRICAS DEL ENGINE ---');
  console.log('Tiempo total (s):', (tiempo / 1000).toFixed(3));

  // Métricas detalladas
  console.log('\n> RuleCompiler:');
  console.log(`  - Reglas compiladas en caché: ${metrics.ruleCompiler.compiledRulesCount}`);
  console.log(`  - Cache hits: ${metrics.ruleCompiler.cacheHits}`);
  console.log(`  - Cache misses: ${metrics.ruleCompiler.cacheMisses}`);
  const rcTotal = metrics.ruleCompiler.cacheHits + metrics.ruleCompiler.cacheMisses;
  console.log(`  - Hit rate: ${rcTotal > 0 ? ((metrics.ruleCompiler.cacheHits / rcTotal) * 100).toFixed(2) : 'N/A'}%`);

  console.log('\n> DataExtractor:');
  console.log(`  - Extractions totales: ${metrics.dataExtractor.totalExtractions}`);
  console.log(`  - Cache hits: ${metrics.dataExtractor.cacheHits}`);
  console.log(`  - Cache misses: ${metrics.dataExtractor.cacheMisses}`);
  const deTotal = metrics.dataExtractor.cacheHits + metrics.dataExtractor.cacheMisses;
  console.log(`  - Hit rate: ${deTotal > 0 ? ((metrics.dataExtractor.cacheHits / deTotal) * 100).toFixed(2) : 'N/A'}%`);

  console.log('\n> MemoryPool:');
  console.log(`  - Hits: ${metrics.memoryPool.hits}`);
  console.log(`  - Misses: ${metrics.memoryPool.misses}`);
  console.log(`  - Allocations: ${metrics.memoryPool.allocations}`);
  console.log(`  - Returns: ${metrics.memoryPool.returns}`);
  console.log(`  - Total requests: ${metrics.memoryPool.totalRequests}`);
  console.log(`  - Hit rate: ${metrics.memoryPool.hitRate.toFixed(2)}%`);
  console.log(`  - Pool sizes: ${JSON.stringify(metrics.memoryPool.poolSizes)}`);

  console.log('\n> CacheManager:');
  console.log('  - PathCache:');
  console.log(`    - Size: ${metrics.cache.pathCache.size}`);
  console.log(`    - Hits: ${metrics.cache.pathCache.hits}`);
  console.log(`    - Misses: ${metrics.cache.pathCache.misses}`);
  console.log(`    - Hit rate: ${metrics.cache.pathCache.hitRate.toFixed(2)}%`);
  console.log('  - HelperCache:');
  console.log(`    - Size: ${metrics.cache.helperCache.size}`);
  console.log(`    - Entries: ${metrics.cache.helperCache.entries}`);
  console.log(`  - Total memory usage (bytes): ${metrics.cache.totalMemoryUsage}`);

  console.log('\n> ErrorHandler:');
  if (metrics.errorHandler) {
    Object.entries(metrics.errorHandler).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        console.log(`  - ${k}: ${JSON.stringify(v)}`);
      } else {
        console.log(`  - ${k}: ${v}`);
      }
    });
  } else {
    console.log('  - Sin métricas disponibles');
  }

  console.log('\n> CallbackManager:');
  console.log(`  - Active callbacks: ${metrics.callbackManager.activeCallbacks}`);
}

main().catch(console.error);
