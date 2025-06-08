import { describe, expect, it, vi } from 'vitest';
import { StreamValidator } from '../../../src/engine/components/stream-validator';

describe('StreamValidator', () => {
  const mockRuleCompiler = {
    compile: () => [{ helper: (v: any) => v.value === 1 }],
    getHelper: () => undefined,
    compileRules: () => [],
    getMetrics: () => ({}),
    clearCache: () => {},
  };
  const mockDataExtractor = {};
  const mockMemoryPoolManager = {};

  it('should yield results for sync iterable', async () => {
    const validator = new StreamValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const data = [{ value: 1 }, { value: 2 }, { value: 1 }];
    const results: any[] = [];
    for await (const res of validator.validateStream(data, v => ({ isValid: v.value === 1, data: v }))) {
      results.push(res);
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it('should yield results for async iterable', async () => {
    const validator = new StreamValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    async function* gen() {
      yield { value: 1 };
      yield { value: 2 };
    }
    const results: any[] = [];
    for await (const res of validator.validateStream(gen(), v => ({ isValid: v.value === 1, data: v }))) {
      results.push(res);
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it('should call onChunkComplete callback for last chunk', async () => {
    const validator = new StreamValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const data = [{ value: 1 }, { value: 2 }, { value: 1 }];
    const onChunkComplete = vi.fn();
    const results: any[] = [];
    for await (const res of validator.validateStream(data, v => ({ isValid: v.value === 1, data: v }), {
      chunkSize: 2,
      onChunkComplete,
    })) {
      results.push(res);
    }
    // Debe llamarse al menos una vez (por el último chunk)
    expect(onChunkComplete).toHaveBeenCalled();
    // Verifica que la última llamada existe y tiene el chunkSize correcto
    const calls = onChunkComplete.mock && Array.isArray(onChunkComplete.mock.calls) ? onChunkComplete.mock.calls : [];
    const lastCall = Array.isArray(calls) && calls.length > 0 ? calls[calls.length - 1] : undefined;
    expect(lastCall && lastCall[0] && lastCall[0].chunkSize).toBe(1); // El último chunk tiene 1 elemento
  });

  describe('validateArray', () => {
    const mockRuleCompiler = {
      compile: () => [{ helper: (v: any) => v.value === 1 }],
      getHelper: () => undefined,
      compileRules: () => [],
      getMetrics: () => ({}),
      clearCache: () => {},
    };
    const mockDataExtractor = {};
    const mockMemoryPoolManager = {};

    it('returns summary and results for sync validator', async () => {
      const validator = new StreamValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPoolManager as any,
      );
      const data = [{ value: 1 }, { value: 2 }, { value: 1 }];
      const result = await validator.validateArray(data, v => ({ isValid: v.value === 1, data: v }));
      expect(result.summary.totalProcessed).toBe(3);
      expect(result.summary.totalErrors).toBe(1);
      expect(result.summary.successRate).toBeCloseTo(66.666, 1);
      expect(result.results.length).toBe(3);
    });

    it('returns summary and results for async validator', async () => {
      const validator = new StreamValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPoolManager as any,
      );
      const data = [{ value: 1 }, { value: 2 }];
      const result = await validator.validateArray(data, async v => ({ isValid: v.value === 1, data: v }));
      expect(result.summary.totalProcessed).toBe(2);
      expect(result.summary.totalErrors).toBe(1);
      expect(result.summary.successRate).toBeCloseTo(50, 1);
      expect(result.results.length).toBe(2);
    });

    it('returns correct summary for empty array', async () => {
      const validator = new StreamValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPoolManager as any,
      );
      const result = await validator.validateArray([], v => ({ isValid: true, data: v }));
      expect(result.summary.totalProcessed).toBe(0);
      expect(result.summary.totalErrors).toBe(0);
      expect(result.summary.successRate).toBe(0);
      expect(result.results.length).toBe(0);
    });

    it('returns early if validateStream yields a summary object', async () => {
      const validator = new StreamValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPoolManager as any,
      );
      // Mock validateStream to yield a summary object en la primera iteración
      validator.validateStream = async function* () {
        yield { totalProcessed: 2, totalErrors: 1, successRate: 50 };
      } as any;
      const data = [{ value: 1 }, { value: 2 }];
      const result = await validator.validateArray(data, v => ({ isValid: true, data: v }));
      expect(result.summary.totalProcessed).toBe(2);
      expect(result.results.length).toBe(0);
    });

    it('handles errors thrown by the validator', async () => {
      const validator = new StreamValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPoolManager as any,
      );
      const data = [{ value: 1 }, { value: 2 }];
      const result = await validator.validateArray(data, v => {
        if (v.value === 2) {
          throw new Error('fail');
        }
        return { isValid: true, data: v };
      });
      expect(result.results.length).toBe(2);
      expect(result.results[1].isValid).toBe(false);
      expect(result.results[1].message).toBe('fail');
    });
  });
});
