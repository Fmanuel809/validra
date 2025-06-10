// EJEMPLO DE MICROSERVICIO VALIDRA CON CONCURRENCIA REAL
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

// Simulamos latencias reales de I/O en microservicio
const simulateAsyncValidation = async (data: any) => {
  // Simular DB lookup (10-50ms)
  if (data.userId) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 10));
  }

  // Simular Redis check (2-15ms)
  if (data.role) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 13 + 2));
  }

  // Simular API externa (50-200ms)
  if (data.currency) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50));
  }
};

class ValidraMicroservice {
  private engine: ValidraEngine;
  private requestCount = 0;
  private totalResponseTime = 0;
  private totalValidraTime = 0;
  private minValidraTime = Infinity;
  private maxValidraTime = 0;
  private validraTimes: number[] = [];

  constructor(usarMemoryPool: boolean) {
    this.engine = new ValidraEngine(advancedRules, {
      debug: false,
      enableMemoryPool: usarMemoryPool,
      memoryPoolSize: 500,
      enableStreaming: false,
      silent: true,
    });
  }

  async validateRequest(data: any, usarModoAsincrono: boolean = true): Promise<any> {
    const startTime = performance.now();

    // Simular validaciones con I/O real (DB, Redis, APIs)
    await simulateAsyncValidation(data);

    // Medir SOLO el tiempo de Validra
    const validraStartTime = performance.now();
    let result;
    if (usarModoAsincrono) {
      result = await this.engine.validateAsync(data);
    } else {
      result = this.engine.validate(data); // Método síncrono correcto
    }
    const validraEndTime = performance.now();
    const validraTime = validraEndTime - validraStartTime;

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Métricas del microservicio
    this.requestCount++;
    this.totalResponseTime += responseTime;

    // Métricas específicas de Validra
    this.totalValidraTime += validraTime;
    this.minValidraTime = Math.min(this.minValidraTime, validraTime);
    this.maxValidraTime = Math.max(this.maxValidraTime, validraTime);
    this.validraTimes.push(validraTime);

    return {
      ...result,
      metadata: {
        responseTime: Math.round(responseTime * 100) / 100, // Precisión de 0.01ms en segundos
        validraTime: Math.round(validraTime * 1000000) / 1000000, // Precisión de 0.000001s (microsegundos)
        requestId: this.requestCount,
      },
    };
  }

  getMicroserviceMetrics() {
    return {
      totalRequests: this.requestCount,
      avgResponseTime: this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0,
      validraMetrics: {
        avgValidraTime: this.requestCount > 0 ? this.totalValidraTime / this.requestCount : 0,
        minValidraTime: this.minValidraTime === Infinity ? 0 : this.minValidraTime,
        maxValidraTime: this.maxValidraTime,
        totalValidraTime: this.totalValidraTime,
        medianValidraTime: this.calculateMedian(this.validraTimes),
        p95ValidraTime: this.calculatePercentile(this.validraTimes, 95),
        p99ValidraTime: this.calculatePercentile(this.validraTimes, 99),
      },
    };
  }

  private calculateMedian(times: number[]): number {
    if (times.length === 0) {
      return 0;
    }
    const sorted = [...times].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculatePercentile(times: number[], percentile: number): number {
    if (times.length === 0) {
      return 0;
    }
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getEngineMetrics() {
    return this.engine.getMetrics();
  }
}

async function main() {
  console.log('🔄 DEMO MICROSERVICIO CONCURRENTE VALIDRA');

  // PROMPTS INTERACTIVOS
  const cantidadStr = await promptUser('📦 Cantidad de requests concurrentes: ');
  const total = Number(cantidadStr) > 0 ? Number(cantidadStr) : 50;
  const usarPoolStr = await promptUser('💾 Usar MemoryPool (s/N): ');
  const usarMemoryPool = /^s/i.test(usarPoolStr);
  const modoValidacionStr = await promptUser('⚙️  Modo de validación (async/sync): ');
  const usarModoAsincrono = !/^sync?$/i.test(modoValidacionStr);
  const ioLatencyStr = await promptUser('⏱️  Simular latencia I/O (s/N): ');
  const simularIO = /^s/i.test(ioLatencyStr);

  const microservice = new ValidraMicroservice(usarMemoryPool);

  console.log(`\n🚀 Simulando microservicio con ${total} requests concurrentes...`);
  console.log(`💾 MemoryPool: ${usarMemoryPool ? 'Habilitado' : 'Deshabilitado'}`);
  console.log(`⚙️  Modo de validación: ${usarModoAsincrono ? 'Asíncrono' : 'Síncrono'}`);
  console.log(`⏱️  I/O Simulado: ${simularIO ? 'Habilitado' : 'Deshabilitado'}`);

  // Generar datos de requests simulando usuarios reales
  const { data } = generateAdvancedDemoDataWithProgress(total, 0.1); // 10% inválidos

  // Agregar campos típicos de microservicio
  const requests = data.map((item, i) => ({
    ...item,
    userId: `user-${i}`,
    role: i % 3 === 0 ? 'admin' : 'user',
    currency: ['USD', 'EUR', 'MXN'][i % 3],
    timestamp: Date.now(),
  }));

  // Medir tiempo de validación concurrente
  const t0 = performance.now();

  const results = await Promise.all(
    requests.map(async (request, i) => {
      if (simularIO) {
        await simulateAsyncValidation(request);
      }
      const result = await microservice.validateRequest(request, usarModoAsincrono);

      if ((i + 1) % Math.max(1, Math.floor(total / 10)) === 0 || i === requests.length - 1) {
        console.log(`⚡ Procesando request ${i + 1} de ${total}`);
      }

      return result;
    }),
  );

  const t1 = performance.now();
  const totalTime = t1 - t0;

  console.log(`\n✅ Total de requests procesados: ${total}`);
  console.log(`🔄 Throughput: ${(total / (totalTime / 1000)).toFixed(2)} req/sec`);

  // Análisis de resultados
  const validResults = results.filter(r => r.isValid);
  const avgResponseTime = results.reduce((sum, r) => sum + r.metadata.responseTime, 0) / results.length;
  const avgValidraTime = results.reduce((sum, r) => sum + r.metadata.validraTime, 0) / results.length;

  console.log(
    `✅ Requests válidos: ${validResults.length}/${total} (${((validResults.length / total) * 100).toFixed(1)}%)`,
  );
  console.log(`📈 Tiempo promedio de respuesta: ${(avgResponseTime / 1000).toFixed(3)}s`);
  console.log(`⚡ Tiempo promedio de Validra: ${(avgValidraTime / 1000).toFixed(6)}s`);
  console.log(`📊 Porcentaje tiempo Validra: ${((avgValidraTime / avgResponseTime) * 100).toFixed(1)}%`);

  printMetrics(microservice, totalTime);
  console.log('\n🔄 DEMO MICROSERVICIO FINALIZADA');
}

function printMetrics(microservice: ValidraMicroservice, tiempo: number) {
  const microMetrics = microservice.getMicroserviceMetrics();
  const engineMetrics = microservice.getEngineMetrics();

  console.log('\n--- MÉTRICAS DEL MICROSERVICIO ---');
  console.log('Tiempo total (s):', (tiempo / 1000).toFixed(3));
  console.log(`Total requests: ${microMetrics.totalRequests}`);
  console.log(`Tiempo promedio de respuesta: ${(microMetrics.avgResponseTime / 1000).toFixed(3)}s`);

  console.log('\n--- MÉTRICAS DE VALIDRA ---');
  console.log(`⚡ Tiempo promedio de Validra: ${(microMetrics.validraMetrics.avgValidraTime / 1000).toFixed(6)}s`);
  console.log(`⚡ Tiempo mínimo de Validra: ${(microMetrics.validraMetrics.minValidraTime / 1000).toFixed(6)}s`);
  console.log(`⚡ Tiempo máximo de Validra: ${(microMetrics.validraMetrics.maxValidraTime / 1000).toFixed(6)}s`);
  console.log(`⚡ Mediana tiempo Validra: ${(microMetrics.validraMetrics.medianValidraTime / 1000).toFixed(6)}s`);
  console.log(`⚡ P95 tiempo Validra: ${(microMetrics.validraMetrics.p95ValidraTime / 1000).toFixed(6)}s`);
  console.log(`⚡ P99 tiempo Validra: ${(microMetrics.validraMetrics.p99ValidraTime / 1000).toFixed(6)}s`);
  console.log(`⚡ Tiempo total acumulado: ${(microMetrics.validraMetrics.totalValidraTime / 1000).toFixed(3)}s`);

  console.log('\n--- MÉTRICAS DEL ENGINE ---');

  // Métricas detalladas del engine
  console.log('\n> RuleCompiler:');
  console.log(`  - Reglas compiladas en caché: ${engineMetrics.ruleCompiler.compiledRulesCount}`);
  console.log(`  - Cache hits: ${engineMetrics.ruleCompiler.cacheHits}`);
  console.log(`  - Cache misses: ${engineMetrics.ruleCompiler.cacheMisses}`);
  const rcTotal = engineMetrics.ruleCompiler.cacheHits + engineMetrics.ruleCompiler.cacheMisses;
  console.log(
    `  - Hit rate: ${rcTotal > 0 ? ((engineMetrics.ruleCompiler.cacheHits / rcTotal) * 100).toFixed(2) : 'N/A'}%`,
  );

  console.log('\n> DataExtractor:');
  console.log(`  - Extractions totales: ${engineMetrics.dataExtractor.totalExtractions}`);
  console.log(`  - Cache hits: ${engineMetrics.dataExtractor.cacheHits}`);
  console.log(`  - Cache misses: ${engineMetrics.dataExtractor.cacheMisses}`);
  const deTotal = engineMetrics.dataExtractor.cacheHits + engineMetrics.dataExtractor.cacheMisses;
  console.log(
    `  - Hit rate: ${deTotal > 0 ? ((engineMetrics.dataExtractor.cacheHits / deTotal) * 100).toFixed(2) : 'N/A'}%`,
  );

  console.log('\n> MemoryPool:');
  console.log(`  - Hits: ${engineMetrics.memoryPool.hits}`);
  console.log(`  - Misses: ${engineMetrics.memoryPool.misses}`);
  console.log(`  - Allocations: ${engineMetrics.memoryPool.allocations}`);
  console.log(`  - Returns: ${engineMetrics.memoryPool.returns}`);
  console.log(`  - Total requests: ${engineMetrics.memoryPool.totalRequests}`);
  console.log(`  - Hit rate: ${engineMetrics.memoryPool.hitRate.toFixed(2)}%`);
  console.log(`  - Pool sizes: ${JSON.stringify(engineMetrics.memoryPool.poolSizes)}`);

  console.log('\n> CacheManager:');
  console.log('  - PathCache:');
  console.log(`    - Size: ${engineMetrics.cache.pathCache.size}`);
  console.log(`    - Hits: ${engineMetrics.cache.pathCache.hits}`);
  console.log(`    - Misses: ${engineMetrics.cache.pathCache.misses}`);
  console.log(`    - Hit rate: ${engineMetrics.cache.pathCache.hitRate.toFixed(2)}%`);
  console.log('  - HelperCache:');
  console.log(`    - Size: ${engineMetrics.cache.helperCache.size}`);
  console.log(`    - Entries: ${engineMetrics.cache.helperCache.entries}`);
  console.log(`  - Total memory usage (MB): ${(engineMetrics.cache.totalMemoryUsage / (1024 * 1024)).toFixed(3)}`);

  console.log('\n> ErrorHandler:');
  if (engineMetrics.errorHandler) {
    Object.entries(engineMetrics.errorHandler).forEach(([k, v]) => {
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
  console.log(`  - Active callbacks: ${engineMetrics.callbackManager.activeCallbacks}`);
}

main().catch(console.error);
