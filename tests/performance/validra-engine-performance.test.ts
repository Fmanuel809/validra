import type { Rule } from '@/engine/rule';
import { ValidraEngine } from '@/engine/validra-engine';
import { describe, it } from 'vitest';
import generateTestData from './data-generators';
import { collectPerformance } from './metrics-collector';

const testConfigurations = [
  { enableMemoryPool: true, enableStreaming: false, name: 'MemoryPool+NonStreaming' },
  { enableMemoryPool: false, enableStreaming: false, name: 'NoMemoryPool+NonStreaming' },
  { enableMemoryPool: true, enableStreaming: true, name: 'MemoryPool+Streaming' },
  { enableMemoryPool: false, enableStreaming: true, name: 'NoMemoryPool+Streaming' },
];

// Reglas complejas válidas para forzar uso del memory pool
const complexRules: Rule[] = [
  { op: 'isEmail', field: 'email' },
  { op: 'gte', field: 'age', params: { value: 18 } },
  { op: 'lte', field: 'age', params: { value: 80 } },
  { op: 'isEmpty', field: 'name', negative: true },
  { op: 'regexMatch', field: 'address', params: { regex: '^Calle' } },
  { op: 'between', field: 'score', params: { min: 0, max: 100 } },
  { op: 'eq', field: 'type', params: { value: 'A' } },
  { op: 'gte', field: 'balance', params: { value: 0 } },
  { op: 'lte', field: 'zip', params: { value: 99999 } },
  { op: 'minLength', field: 'notes', params: { value: 5 } },
];

const testCases = [
  { name: '10K', count: 10_000 },
  { name: '100K', count: 100_000 },
];

describe('ValidraEngine Performance', () => {
  const allResults: any[] = [];
  for (const testCase of testCases) {
    for (const config of testConfigurations) {
      it(`Performance (${testCase.name} registros, ${config.name})`, async () => {
        const data = generateTestData(testCase.count, true); // true = datos complejos
        const engine = new ValidraEngine(complexRules, [], {
          enableMemoryPool: config.enableMemoryPool,
          enableStreaming: config.enableStreaming,
          streamingChunkSize: 500,
          memoryPoolSize: 1000, // Aumenta el tamaño del pool para pruebas de stress
        });
        const poolMetricsFn = () => engine['memoryPoolManager'].getMetrics();
        const perf = await collectPerformance(
          async rec => {
            if (config.enableStreaming) {
              for await (const item of engine.validateStream(data)) {
                if (rec) {
                  rec(0);
                }
                void item;
              }
            } else {
              for (const item of data) {
                const t0 = performance.now();
                engine.validate(item);
                const t1 = performance.now();
                if (rec) {
                  rec(t1 - t0);
                }
              }
            }
          },
          data.length,
          poolMetricsFn,
        );
        const result = {
          '🔧 Configuración': config.name,
          '📊 Tamaño dataset': testCase.name,
          '🧮 Total validaciones': perf.items,
          '⏱️ Duración total (ms)': perf.durationMs.toFixed(2),
          '⚡ Throughput (val/s)': perf.throughput.toFixed(2),
          '⏳ Latencia promedio (ms)': perf.avgLatencyMs.toFixed(4),
          'P95 (ms)': perf.p95LatencyMs.toFixed(4),
          'P99 (ms)': perf.p99LatencyMs.toFixed(4),
          '🟩 Memoria inicial (MB)': (perf.memoryStart / 1024 / 1024).toFixed(2),
          '🟦 Memoria final (MB)': (perf.memoryEnd / 1024 / 1024).toFixed(2),
          '🟥 Pico memoria (MB)': (perf.memoryPeak / 1024 / 1024).toFixed(2),
          '♻️ Pool hit rate (%)':
            perf.poolMetrics?.hitRate !== undefined ? (perf.poolMetrics.hitRate * 1).toFixed(2) : 'N/A',
          '✅ Pool hits': perf.poolMetrics?.hits ?? 'N/A',
          '❌ Pool misses': perf.poolMetrics?.misses ?? 'N/A',
          '🆕 Pool allocations': perf.poolMetrics?.allocations ?? 'N/A',
          '🔁 Pool returns': perf.poolMetrics?.returns ?? 'N/A',
          '🔢 Pool total reqs': perf.poolMetrics?.totalRequests ?? 'N/A',
          '📦 Pool sizes': perf.poolMetrics?.poolSizes ? JSON.stringify(perf.poolMetrics.poolSizes) : 'N/A',
        };
        allResults.push(result);
        // Imprime en consola la tabla
        console.log(`\n[${testCase.name} - ${config.name}]`);
        console.table(result);
      });
    }
  }

  /* afterAll(() => {
    // Unifica todas las métricas en una sola tabla
    const configs = allResults.map(r => `${r['🔧 Configuración']} (${r['📊 Tamaño dataset']})`);
    // Elimina emojis y deja nombres simples de métricas
    const metricMap: Record<string, string> = {
      '🧮 Total validaciones': 'Total validaciones',
      '⏱️ Duración total (ms)': 'Duración total (ms)',
      '⚡ Throughput (val/s)': 'Throughput (val/s)',
      '⏳ Latencia promedio (ms)': 'Latencia promedio (ms)',
      'P95 (ms)': 'P95 (ms)',
      'P99 (ms)': 'P99 (ms)',
      '🟩 Memoria inicial (MB)': 'Memoria inicial (MB)',
      '🟦 Memoria final (MB)': 'Memoria final (MB)',
      '🟥 Pico memoria (MB)': 'Pico memoria (MB)',
      '♻️ Pool hit rate (%)': 'Pool hit rate (%)',
      '✅ Pool hits': 'Pool hits',
      '❌ Pool misses': 'Pool misses',
      '🆕 Pool allocations': 'Pool allocations',
      '🔁 Pool returns': 'Pool returns',
      '🔢 Pool total reqs': 'Pool total reqs',
      '📦 Pool sizes': 'Pool sizes',
    };
    // Selecciona las métricas a mostrar (sin configuración ni tamaño dataset)
    const metricKeys = Object.keys(allResults[0]).filter(k => k !== '🔧 Configuración' && k !== '📊 Tamaño dataset');
    let md = '# Resultados de Performance y Estrés de Validra Engine\n';
    // Header: Métrica | Config1 (10K) | Config2 (10K) | ... | Config1 (100K) | ...
    md += `\n| Métrica | ${configs.join(' | ')} |\n`;
    md += `|---|${configs.map(() => '---').join('|')}|\n`;
    for (const metric of metricKeys) {
      const row = [metricMap[metric as keyof typeof metricMap] || metric];
      for (const result of allResults) {
        row.push(result[metric]);
      }
      md += `| ${row.join(' | ')} |\n`;
    }
    // Explicaciones (con iconos y estilo)
    const explanations =
      // eslint-disable-next-line max-len
      '\n---\n\n## 📝 Explicación de indicadores\n\n- 🔧 **Configuración**: Combinación de opciones del engine.\n- 📊 **Tamaño dataset**: Cantidad de registros validados.\n- 🧮 **Total validaciones**: Número total de validaciones ejecutadas.\n- ⏱️ **Duración total (ms)**: Tiempo total de la prueba en milisegundos.\n- ⚡ **Throughput (val/s)**: Validaciones procesadas por segundo.\n- ⏳ **Latencia promedio (ms)**: Tiempo promedio por validación.\n- **P95/P99 (ms)**: Percentiles de latencia (el 95%/99% de las validaciones son más rápidas que este valor).\n- 🟩 **Memoria inicial (MB)**: Uso de memoria al inicio.\n- 🟦 **Memoria final (MB)**: Uso de memoria al final.\n- 🟥 **Pico memoria (MB)**: Máximo uso de memoria observado.\n- ♻️ **Pool hit rate (%)**: Porcentaje de reutilización del pool de memoria.\n- ✅ **Pool hits**: Veces que se reutilizó un objeto del pool.\n- ❌ **Pool misses**: Veces que no se encontró objeto en el pool.\n- 🆕 **Pool allocations**: Nuevos objetos creados por el pool.\n- 🔁 **Pool returns**: Objetos devueltos al pool.\n- 🔢 **Pool total reqs**: Total de solicitudes al pool.\n- 📦 **Pool sizes**: Tamaño de cada pool de objetos al finalizar.\n\n---\n\n> **Tip:** Si ves ♻️, ✅, 🔁 con valores altos, el memory pool está funcionando y optimizando recursos.\n';
    md += explanations;
    const outPath = path.join(__dirname, '../../PERFORMANCE_RESULT.md');
    fs.writeFileSync(outPath, md, 'utf8');
    console.log(`\nResultados exportados a: ${outPath}`);
  }); */
});
