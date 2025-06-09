// Utilidad para recolectar métricas de performance
export interface PerfMetrics {
  durationMs: number;
  memoryStart: number;
  memoryEnd: number;
  memoryPeak: number;
  throughput: number;
  items: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  poolMetrics?: any;
}

function getPercentile(arr: number[], p: number): number {
  if (arr.length === 0) {
    return 0;
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  const value = sorted[Math.max(0, idx)];
  return typeof value === 'number' ? value : 0;
}

export async function collectPerformance(
  fn: (rec?: (t: number) => void) => Promise<any>,
  items: number,
  getPoolMetrics?: () => any,
): Promise<PerfMetrics> {
  global.gc?.();
  const memStart = process.memoryUsage().heapUsed;
  let memPeak = memStart;
  const interval = setInterval(() => {
    const mem = process.memoryUsage().heapUsed;
    if (mem > memPeak) {
      memPeak = mem;
    }
  }, 10);
  const latencies: number[] = [];
  const t0 = performance.now();
  await fn(lat => latencies.push(lat));
  const t1 = performance.now();
  clearInterval(interval);
  const memEnd = process.memoryUsage().heapUsed;
  const avgLatencyMs = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : (t1 - t0) / items;
  const p95LatencyMs = getPercentile(latencies, 95) || avgLatencyMs;
  const p99LatencyMs = getPercentile(latencies, 99) || avgLatencyMs;
  const poolMetrics = getPoolMetrics ? getPoolMetrics() : undefined;
  return {
    durationMs: t1 - t0,
    memoryStart: memStart,
    memoryEnd: memEnd,
    memoryPeak: memPeak,
    throughput: items / ((t1 - t0) / 1000),
    items,
    avgLatencyMs,
    p95LatencyMs,
    p99LatencyMs,
    poolMetrics,
  };
}
