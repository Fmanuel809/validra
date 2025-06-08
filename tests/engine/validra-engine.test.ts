import type { ValidraCallback } from '@/engine/interfaces';
import type { Rule } from '@/engine/rule';
import { ValidraEngine } from '@/engine/validra-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ValidraEngine', () => {
  let rules: Rule[];
  let callbacks: ValidraCallback[];
  let engine: ValidraEngine;

  beforeEach(() => {
    // Define rules according to Helper type
    rules = [
      { op: 'isEmail', field: 'email' },
      { op: 'gte', field: 'age', params: { value: 18 } },
      { op: 'isEmpty', field: 'name', negative: true },
    ];
    callbacks = [{ name: 'onComplete', callback: vi.fn() }];
    engine = new ValidraEngine(rules, callbacks, {
      debug: false,
    });
  });

  it('validates valid data successfully', () => {
    const data = { email: 'user@example.com', age: 25, name: 'Ana' };
    const result = engine.validate(data);

    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(data);
    expect(result.errors).toBe(undefined);
  });

  it('returns errors for invalid data', () => {
    const data = { email: 'no-email', age: 15, name: '' };
    const result = engine.validate(data);

    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(Object.keys(result.errors!).length).toBeGreaterThan(0);
  });

  it('throws error if data is not an object', () => {
    // @ts-expect-error pruebas de entrada inválida
    expect(() => engine.validate(null)).toThrow('Data must be a valid object');
    // @ts-expect-error pruebas de entrada inválida
    expect(() => engine.validate(123)).toThrow('Data must be a valid object');
  });

  it('executes named callback', () => {
    const data = { email: 'user@example.com', age: 30, name: 'Luis' };
    engine.validate(data, 'onComplete');
    expect(callbacks[0]!.callback).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('throws error if named callback does not exist', () => {
    const data = { email: 'user@example.com', age: 30, name: 'Luis' };
    expect(() => engine.validate(data, 'noExiste')).toThrow('Callback with name "noExiste" not found.');
  });

  it('executes callback as function', () => {
    const cb = vi.fn();
    const data = { email: 'a@b.com', age: 20, name: 'Ana' };
    engine.validate(data, cb);
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('applies failFast and maxErrors options', () => {
    const data = { email: 'no-email', age: 15, name: '' };
    const result = engine.validate(data, undefined, { failFast: true, maxErrors: 1 });
    expect(result.isValid).toBe(false);
  });

  it('getMetrics returns component metrics', () => {
    const metrics = engine.getMetrics();
    expect(metrics).toHaveProperty('ruleCompiler');
    expect(metrics).toHaveProperty('dataExtractor');
    expect(metrics).toHaveProperty('memoryPool');
    expect(metrics).toHaveProperty('cache');
    expect(metrics).toHaveProperty('errorHandler');
    expect(metrics).toHaveProperty('callbackManager');
  });

  it('clearCaches clears caches without throwing', () => {
    expect(() => engine.clearCaches()).not.toThrow();
  });

  it('validateAsync validates data successfully', async () => {
    const data = { email: 'user@example.com', age: 22, name: 'María' };
    const result = await engine.validateAsync(data);

    console.debug('Validation result:', result.errors);

    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(data);
  });

  it('validateAsync throws error if data is invalid', async () => {
    // @ts-expect-error pruebas de entrada inválida
    await expect(engine.validateAsync(undefined)).rejects.toThrow('Data must be a valid object');
  });

  it('validateStream processes data iterable', async () => {
    const dataArray = [
      { email: 'u1@e.com', age: 21, name: 'A' },
      { email: 'u2@e.com', age: 19, name: 'B' },
    ];
    const results: any[] = [];
    for await (const chunk of engine.validateStream(dataArray)) {
      results.push(chunk);
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it('validateStream warns if streaming is disabled', async () => {
    const engineNoStream = new ValidraEngine(rules, [], { enableStreaming: false });
    const warnSpy = vi.spyOn(engineNoStream['logger'], 'warn');
    const dataArray = [{ email: 'a@b.com', age: 20, name: 'Ana' }];
    for await (const _item of engineNoStream.validateStream(dataArray)) {
      void _item; // evitar advertencia de variable no usada
    }
    expect(warnSpy).toHaveBeenCalled();
  });

  it('throws error if data is array, Date or function', () => {
    const badInputs: any[] = [[], new Date(), () => ({})];
    badInputs.forEach(input => {
      expect(() => engine.validate(input)).toThrow('Data must be a valid object');
    });
  });

  it('throws error if callback argument is invalid type', () => {
    const data = { email: 'a@b.com', age: 20, name: 'Ana' };
    // @ts-expect-error invalid callback
    expect(() => engine.validate(data, 42)).toThrow('Callback must be a string or a function');
  });

  it('logs debug info for validate and validateAsync when debug=true', async () => {
    const dbgEngine = new ValidraEngine(rules, [], { debug: true });
    const dbgSpy = vi.spyOn(dbgEngine['logger'], 'debug').mockImplementation(() => undefined);
    const data = { email: 'a@b.com', age: 20, name: 'Ana' };

    dbgEngine.validate(data);
    expect(dbgSpy).toHaveBeenCalled();

    await dbgEngine.validateAsync(data);
    expect(dbgSpy).toHaveBeenCalled();

    dbgSpy.mockRestore();
  });

  it('warns on slow synchronous validation (>100ms)', () => {
    const slowEngine = new ValidraEngine(rules, [], { debug: false });
    const warnSpy = vi.spyOn(slowEngine['logger'], 'warn').mockImplementation(() => undefined);
    let calls = 0;
    vi.spyOn(globalThis.performance, 'now').mockImplementation(() => (calls++ === 0 ? 0 : 150));

    slowEngine.validate({ email: 'a@b.com', age: 20, name: 'Ana' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slow validation detected'),
      expect.objectContaining({ duration: expect.any(String), rulesCount: expect.any(Number) }),
    );

    warnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('validateStream yields chunks and summary when streaming is enabled', async () => {
    const streamEngine = new ValidraEngine(rules, [], { enableStreaming: true });
    const dataArray = [
      { email: 'x@x.com', age: 30, name: 'A' },
      { email: 'y@y.com', age: 17, name: 'B' },
    ];
    const chunks: any[] = [];
    const sumary$: any = {};
    // Usar callbacks válidos y corregir return
    const options = {
      onChunkComplete(chunk: any) {
        chunks.push(chunk);
      },
      onComplete(_summary: any) {
        Object.assign(sumary$, _summary);
      },
    };
    // Consumir el async generator sin asignar variable ni advertencia
    for await (const unused of streamEngine.validateStream(dataArray, options)) {
      void unused;
    }
    expect(sumary$.totalProcessed).toBe(dataArray.length);

    const iter = streamEngine.validateStream(dataArray, options);
    await iter.next();
    await iter.next();
    const { value, done } = await iter.return(sumary$);
    expect(done).toBe(true);
    expect(value).toHaveProperty('totalProcessed', dataArray.length);
  });

  it('uses injected asyncValidator when provided', async () => {
    const fakeAsync = {
      validateAsync: vi.fn().mockResolvedValue({ isValid: true, data: {} }),
    };
    const depEngine = new ValidraEngine(rules, [], {}, { asyncValidator: fakeAsync as any });
    const data = { email: 'a@b.com', age: 20, name: 'Ana' };
    const res = await depEngine.validateAsync(data);
    expect(fakeAsync.validateAsync).toHaveBeenCalledWith(data, rules);
    expect(res.isValid).toBe(true);
  });

  it('continues on helper exception when allowPartialValidation=true', () => {
    const badRules = [{ field: 'email', op: 'doesNotExist' }];
    const partialEngine = new ValidraEngine(badRules as any, [], { allowPartialValidation: true });
    const result = partialEngine.validate({ email: 'x@x.com' } as any);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('email');
  });

  it('throws on unknown operator when throwOnUnknownField=true', () => {
    const badRules = [{ field: 'email', op: 'doesNotExist' }];
    const badEngine = new ValidraEngine(badRules as any, [], { throwOnUnknownField: true });
    expect(() => badEngine.validate({ email: 'a@b.com' })).toThrow(
      /Helper with name "doesNotExist" not found|Unknown helper or operator/,
    );
  });

  it('clearCaches resets cache and memory pool metrics', () => {
    const data = { email: 'a@b.com', age: 25, name: 'Ana' };
    engine.validate(data);
    const before = engine.getMetrics();
    engine.clearCaches();
    const after = engine.getMetrics();
    expect(after).not.toEqual(before);
  });

  it('getMetrics counters reset after clearCaches', () => {
    const data = { email: 'u@u.com', age: 21, name: 'Zoe' };
    engine.validate(data);
    const before = engine.getMetrics().dataExtractor;
    engine.clearCaches();
    const after = engine.getMetrics().dataExtractor;
    expect(after.cacheHits + after.cacheMisses + after.totalExtractions).toBeLessThanOrEqual(
      before.cacheHits + before.cacheMisses + before.totalExtractions,
    );
  });

  it('removes empty errors object from result (coverage for errors cleanup)', async () => {
    // Forzar un resultado con errors vacío
    const data = { email: 'user@example.com', age: 25, name: 'Ana' };
    // Patch el engine para forzar errors vacío en el resultado
    const engineWithPatch = new ValidraEngine(rules, callbacks, { debug: false });
    const spy = vi.spyOn(engineWithPatch['asyncValidator'], 'validateAsync').mockResolvedValue({
      isValid: true,
      data,
      errors: {},
    });
    const result = await engineWithPatch.validateAsync(data);
    expect(result.errors).toBeUndefined();
    spy.mockRestore();
  });

  it('validateStream handles error and calls errorHandler', async () => {
    const streamEngine = new ValidraEngine(rules, [], { enableStreaming: true });
    // Patch errorHandler para detectar llamada
    const error = new Error('stream error');
    const fakeValidationError = {
      message: error.message,
      severity: 'high' as const,
      category: 'validation' as const,
      timestamp: Date.now(),
      recoverable: false,
    };
    const errorHandlerSpy = vi
      .spyOn(streamEngine['errorHandler'], 'handleError')
      .mockImplementation(() => fakeValidationError);
    // Patch streamValidator para lanzar error
    vi.spyOn(streamEngine['streamValidator'], 'validateStream').mockImplementation(() => {
      throw error;
    });
    const dataArray = [{ email: 'fail@fail.com', age: 0, name: '' }];
    let thrown: unknown;
    try {
      // for-await para consumir el generator y disparar el error
      for await (const _ of streamEngine.validateStream(dataArray)) {
        void _;
      }
    } catch (e) {
      thrown = e;
    }
    expect(errorHandlerSpy).toHaveBeenCalledWith(error, expect.objectContaining({ metadata: expect.any(Object) }));
    expect(thrown).toEqual(fakeValidationError);
    errorHandlerSpy.mockRestore();
  });

  it('throws error if named callback does not exist (async branch)', async () => {
    const data = { email: 'user@example.com', age: 30, name: 'Luis' };
    await expect(engine.validateAsync(data, 'noExiste')).rejects.toThrow('Callback with name "noExiste" not found.');
  });

  it('throws error if callback argument is invalid type (async branch)', async () => {
    const data = { email: 'a@b.com', age: 20, name: 'Ana' };
    // @ts-expect-error invalid callback
    await expect(engine.validateAsync(data, 42)).rejects.toThrow('Callback must be a string or a function.');
  });

  it('executes named callback (async branch)', async () => {
    const cb = vi.fn();
    const data = { email: 'user@example.com', age: 30, name: 'Luis' };
    const asyncCallbacks = [{ name: 'onComplete', callback: cb }];
    const engineAsync = new ValidraEngine(rules, asyncCallbacks, { debug: false });
    await engineAsync.validateAsync(data, 'onComplete');
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('executes callback as function (async branch)', async () => {
    const cb = vi.fn();
    const data = { email: 'user@example.com', age: 30, name: 'Luis' };
    const engineAsync = new ValidraEngine(rules, [], { debug: false });
    await engineAsync.validateAsync(data, cb);
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });
});
