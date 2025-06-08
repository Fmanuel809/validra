import { MemoryPoolFactories, ValidraMemoryPool } from '@/engine/memory-pool';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ValidraMemoryPool', () => {
  let pool: ValidraMemoryPool;

  beforeEach(() => {
    pool = new ValidraMemoryPool(2); // pequeño para forzar límites
  });

  it('returns a new object if pool is empty', () => {
    const obj = pool.get('test', () => ({ foo: 1 }));
    expect(obj).toEqual({ foo: 1 });
    const metrics = pool.getMetrics();
    expect(metrics.misses).toBe(1);
    expect(metrics.allocations).toBe(1);
  });

  it('reuses returned objects', () => {
    const obj = { foo: 2 };
    pool.return('test', obj);
    const obj2 = pool.get('test', () => ({ foo: 3 }));
    expect(obj2).toBe(obj);
    expect(pool.getMetrics().hits).toBe(1);
  });

  it('does not return null or undefined objects to the pool', () => {
    pool.return('test', null as any);
    pool.return('test', undefined as any);
    expect(pool.getMetrics().returns).toBe(0);
  });

  it('does not exceed maxSize for a type', () => {
    pool.return('test', { a: 1 });
    pool.return('test', { a: 2 });
    pool.return('test', { a: 3 }); // este no debe entrar
    expect(pool.getMetrics().poolSizes['test']).toBe(2);
  });

  it('applies resetFn when returning objects', () => {
    const obj = { x: 1 };
    pool.return('reset', obj, o => {
      o.x = 0;
    });
    const reused = pool.get('reset', () => ({ x: 2 }));
    expect(reused.x).toBe(0);
  });

  it('clear() empties all pools and resets metrics', () => {
    pool.return('test', { a: 1 });
    pool.get('test', () => ({ a: 2 }));
    pool.clear();
    expect(pool.getMetrics().poolSizes['test']).toBeUndefined();
    expect(pool.getMetrics().hits).toBe(0);
    expect(pool.getMetrics().misses).toBe(0);
  });

  it('getMetrics() returns correct stats after several operations', () => {
    pool.get('foo', () => ({}));
    pool.get('foo', () => ({}));
    pool.return('foo', {});
    pool.get('foo', () => ({}));
    const m = pool.getMetrics();
    expect(m.totalRequests).toBe(3);
    expect(m.hitRate).toBeGreaterThanOrEqual(0);
    expect(typeof m.poolSizes.foo).toBe('number');
  });

  it('factories and resetters work as expected', () => {
    const v = MemoryPoolFactories.validationResult();
    expect(v.isValid).toBe(true);
    MemoryPoolFactories.resetValidationResult(v);
    expect(v.data).toBeNull();
    const arr = MemoryPoolFactories.errorArray();
    arr.push('err');
    MemoryPoolFactories.resetErrorArray(arr);
    expect(arr.length).toBe(0);
    const args = MemoryPoolFactories.argumentsArray();
    args.push(1);
    MemoryPoolFactories.resetArgumentsArray(args);
    expect(args.length).toBe(0);
  });
});
