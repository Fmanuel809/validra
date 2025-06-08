import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryPoolManager } from '../../../src/engine/components/memory-pool-manager';

describe('MemoryPoolManager', () => {
  let manager: MemoryPoolManager;

  describe('when enabled', () => {
    beforeEach(() => {
      manager = new MemoryPoolManager(true, 2);
    });

    it('getValidationResult returns a valid object', () => {
      const result = manager.getValidationResult();
      expect(result).toEqual({ isValid: true, data: null, errors: {} });
    });

    it('returnValidationResult resets and pools the object', () => {
      const result = manager.getValidationResult();
      result.isValid = false;
      result.data = 123;
      // Ajuste: errors debe ser un objeto con arrays de objetos que tengan al menos message
      result.errors = { foo: [{ message: 'error' }] };
      manager.returnValidationResult(result);
      const pooled = manager.getValidationResult();
      expect(pooled).toEqual({ isValid: true, data: null, errors: {} });
    });

    it('getArgumentsArray returns an array', () => {
      const arr = manager.getArgumentsArray();
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(0);
    });

    it('returnArgumentsArray resets and pools the array', () => {
      const arr = manager.getArgumentsArray();
      arr.push(1, 2, 3);
      manager.returnArgumentsArray(arr);
      const pooled = manager.getArgumentsArray();
      expect(pooled.length).toBe(0);
    });

    it('getErrorArray returns an array', () => {
      const arr = manager.getErrorArray();
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(0);
    });

    it('returnErrorArray resets and pools the array', () => {
      const arr = manager.getErrorArray();
      arr.push('err1', 'err2');
      manager.returnErrorArray(arr);
      const pooled = manager.getErrorArray();
      expect(pooled.length).toBe(0);
    });

    it('shouldPoolArguments returns true only for paramCount > 1', () => {
      expect(manager.shouldPoolArguments(0)).toBe(false);
      expect(manager.shouldPoolArguments(1)).toBe(false);
      expect(manager.shouldPoolArguments(2)).toBe(true);
      expect(manager.shouldPoolArguments(10)).toBe(true);
    });

    it('shouldPoolValidationResult returns true only for rulesCount > 2', () => {
      expect(manager.shouldPoolValidationResult(0)).toBe(false);
      expect(manager.shouldPoolValidationResult(2)).toBe(false);
      expect(manager.shouldPoolValidationResult(3)).toBe(true);
      expect(manager.shouldPoolValidationResult(10)).toBe(true);
    });

    it('clear empties all pools and resets metrics', () => {
      manager.getValidationResult();
      manager.getArgumentsArray();
      manager.getErrorArray();
      manager.clear();
      const metrics = manager.getMetrics();
      expect(Object.values(metrics.poolSizes).every(v => v === 0)).toBe(true);
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.allocations).toBe(0);
      expect(metrics.returns).toBe(0);
    });

    it('getMetrics returns correct structure', () => {
      const metrics = manager.getMetrics();
      expect(metrics).toHaveProperty('hits');
      expect(metrics).toHaveProperty('misses');
      expect(metrics).toHaveProperty('allocations');
      expect(metrics).toHaveProperty('returns');
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('poolSizes');
    });

    it('isEnabled returns true', () => {
      expect(manager.isEnabled()).toBe(true);
    });
  });

  describe('when disabled', () => {
    beforeEach(() => {
      manager = new MemoryPoolManager(false, 2);
    });

    it('getValidationResult always returns a new object', () => {
      const a = manager.getValidationResult();
      const b = manager.getValidationResult();
      expect(a).not.toBe(b);
      expect(a).toEqual({ isValid: true, data: null, errors: {} });
    });

    it('returnValidationResult does nothing', () => {
      const result = { isValid: false, data: 1, errors: { foo: [{ message: 'error' }] } };
      expect(() => manager.returnValidationResult(result as any)).not.toThrow();
    });

    it('getArgumentsArray always returns a new array', () => {
      const a = manager.getArgumentsArray();
      const b = manager.getArgumentsArray();
      expect(a).not.toBe(b);
      expect(a.length).toBe(0);
    });

    it('returnArgumentsArray does nothing', () => {
      const arr = [1, 2, 3];
      expect(() => manager.returnArgumentsArray(arr)).not.toThrow();
    });

    it('getErrorArray always returns a new array', () => {
      const a = manager.getErrorArray();
      const b = manager.getErrorArray();
      expect(a).not.toBe(b);
      expect(a.length).toBe(0);
    });

    it('returnErrorArray does nothing', () => {
      const arr = ['err'];
      expect(() => manager.returnErrorArray(arr)).not.toThrow();
    });

    it('shouldPoolArguments always returns false', () => {
      expect(manager.shouldPoolArguments(10)).toBe(false);
    });

    it('shouldPoolValidationResult always returns false', () => {
      expect(manager.shouldPoolValidationResult(10)).toBe(false);
    });

    it('clear does not throw', () => {
      expect(() => manager.clear()).not.toThrow();
    });

    it('getMetrics returns correct structure', () => {
      const metrics = manager.getMetrics();
      expect(metrics).toHaveProperty('hits');
      expect(metrics).toHaveProperty('misses');
      expect(metrics).toHaveProperty('allocations');
      expect(metrics).toHaveProperty('returns');
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('poolSizes');
    });

    it('isEnabled returns false', () => {
      expect(manager.isEnabled()).toBe(false);
    });
  });
});
