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

    console.debug('Validation result:', result);

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
});
