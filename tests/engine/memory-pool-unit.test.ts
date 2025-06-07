import { describe, it, expect, beforeEach } from 'vitest';
import { ValidraMemoryPool, MemoryPoolFactories } from '@/engine/memory-pool';

describe('ValidraMemoryPool', () => {
  let pool: ValidraMemoryPool;

  beforeEach(() => {
    pool = new ValidraMemoryPool(5); // Small pool for testing
  });

  describe('Constructor', () => {
    it('should create pool with default size', () => {
      const defaultPool = new ValidraMemoryPool();
      expect(defaultPool).toBeInstanceOf(ValidraMemoryPool);
    });

    it('should create pool with custom size', () => {
      const customPool = new ValidraMemoryPool(10);
      expect(customPool).toBeInstanceOf(ValidraMemoryPool);
    });
  });

  describe('get() method', () => {
    it('should create new object on first call', () => {
      const factory = () => ({ value: 'test' });
      const obj = pool.get('test', factory);
      
      expect(obj).toEqual({ value: 'test' });
    });

    it('should return same object type from factory', () => {
      const stringFactory = () => 'test string';
      const numberFactory = () => 42;
      const objectFactory = () => ({ key: 'value' });
      
      expect(pool.get('string', stringFactory)).toBe('test string');
      expect(pool.get('number', numberFactory)).toBe(42);
      expect(pool.get('object', objectFactory)).toEqual({ key: 'value' });
    });

    it('should create separate pools for different types', () => {
      const factory1 = () => ({ type: 'first' });
      const factory2 = () => ({ type: 'second' });
      
      const obj1 = pool.get('type1', factory1);
      const obj2 = pool.get('type2', factory2);
      
      expect(obj1).toEqual({ type: 'first' });
      expect(obj2).toEqual({ type: 'second' });
    });

    it('should increment miss counter on new object creation', () => {
      const factory = () => ({ value: 'test' });
      
      const initialMetrics = pool.getMetrics();
      pool.get('test', factory);
      const afterMetrics = pool.getMetrics();
      
      expect(afterMetrics.misses).toBe(initialMetrics.misses + 1);
      expect(afterMetrics.allocations).toBe(initialMetrics.allocations + 1);
    });
  });

  describe('return() method', () => {
    it('should return object to pool', () => {
      const factory = () => ({ value: 'test' });
      
      // Get and return an object
      const obj = pool.get('test', factory);
      pool.return('test', obj);
      
      const metrics = pool.getMetrics();
      expect(metrics.returns).toBe(1);
    });

    it('should reuse returned object', () => {
      const factory = () => ({ value: 'test' });
      
      // Get, return, then get again
      const obj1 = pool.get('test', factory);
      pool.return('test', obj1);
      const obj2 = pool.get('test', factory);
      
      expect(obj1).toBe(obj2); // Same object reference
    });

    it('should increment hit counter when reusing object', () => {
      const factory = () => ({ value: 'test' });
      
      const obj = pool.get('test', factory);
      pool.return('test', obj);
      
      const beforeHit = pool.getMetrics().hits;
      pool.get('test', factory);
      const afterHit = pool.getMetrics().hits;
      
      expect(afterHit).toBe(beforeHit + 1);
    });

    it('should apply reset function when returning object', () => {
      const factory = () => ({ value: 'test', processed: true });
      const resetFn = (obj: any) => {
        obj.value = '';
        obj.processed = false;
      };
      
      const obj = pool.get('test', factory);
      obj.value = 'modified';
      obj.processed = true;
      
      pool.return('test', obj, resetFn);
      const reusedObj = pool.get('test', factory);
      
      expect(reusedObj.value).toBe('');
      expect(reusedObj.processed).toBe(false);
    });

    it('should handle null objects gracefully', () => {
      expect(() => {
        pool.return('test', null);
      }).not.toThrow();
    });

    it('should handle undefined objects gracefully', () => {
      expect(() => {
        pool.return('test', undefined);
      }).not.toThrow();
    });

    it('should respect maximum pool size', () => {
      const smallPool = new ValidraMemoryPool(2);
      const factory = () => ({ id: Math.random() });
      
      // Create and return more objects than pool size
      const obj1 = smallPool.get('test', factory);
      const obj2 = smallPool.get('test', factory);
      const obj3 = smallPool.get('test', factory);
      
      smallPool.return('test', obj1);
      smallPool.return('test', obj2);
      smallPool.return('test', obj3); // This should not be stored (pool full)
      
      const metrics = smallPool.getMetrics();
      expect(metrics.poolSizes.test).toBeLessThanOrEqual(2);
    });
  });

  describe('getMetrics() method', () => {
    it('should return initial metrics', () => {
      const metrics = pool.getMetrics();
      
      expect(metrics).toHaveProperty('hits', 0);
      expect(metrics).toHaveProperty('misses', 0);
      expect(metrics).toHaveProperty('allocations', 0);
      expect(metrics).toHaveProperty('returns', 0);
      expect(metrics).toHaveProperty('totalRequests', 0);
      expect(metrics).toHaveProperty('hitRate', 0);
      expect(metrics).toHaveProperty('poolSizes');
    });

    it('should calculate hit rate correctly', () => {
      const factory = () => ({ value: 'test' });
      
      // 1 miss, 1 hit
      const obj = pool.get('test', factory); // miss
      pool.return('test', obj);
      pool.get('test', factory); // hit
      
      const metrics = pool.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.hitRate).toBe(50);
    });

    it('should track pool sizes correctly', () => {
      const factory = () => ({ value: 'test' });
      
      const obj1 = pool.get('type1', factory);
      const obj2 = pool.get('type2', factory);
      
      pool.return('type1', obj1);
      pool.return('type2', obj2);
      
      const metrics = pool.getMetrics();
      expect(metrics.poolSizes.type1).toBe(1);
      expect(metrics.poolSizes.type2).toBe(1);
    });

    it('should handle zero requests for hit rate calculation', () => {
      const metrics = pool.getMetrics();
      expect(metrics.hitRate).toBe(0);
    });
  });

  describe('clear() method', () => {
    it('should clear all pools and reset metrics', () => {
      const factory = () => ({ value: 'test' });
      
      // Add some data
      const obj = pool.get('test', factory);
      pool.return('test', obj);
      
      // Verify data exists
      let metrics = pool.getMetrics();
      expect(metrics.returns).toBeGreaterThan(0);
      expect(Object.keys(metrics.poolSizes)).toContain('test');
      
      // Clear and verify
      pool.clear();
      metrics = pool.getMetrics();
      
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.allocations).toBe(0);
      expect(metrics.returns).toBe(0);
      expect(Object.keys(metrics.poolSizes)).toHaveLength(0);
    });
  });

  describe('Multiple object types', () => {
    it('should handle multiple object types independently', () => {
      const arrayFactory = () => [] as any[];
      const objectFactory = () => ({});
      const stringWrapperFactory = () => ({ value: '' }); // Use object wrapper for string
      
      // Get objects of different types
      const arr = pool.get('array', arrayFactory);
      const obj = pool.get('object', objectFactory);
      const strWrapper = pool.get('stringWrapper', stringWrapperFactory);
      
      expect(Array.isArray(arr)).toBe(true);
      expect(typeof obj).toBe('object');
      expect(typeof strWrapper).toBe('object');
      expect(strWrapper.value).toBe('');
      
      // Return them
      pool.return('array', arr);
      pool.return('object', obj);
      pool.return('stringWrapper', strWrapper);
      
      // Verify they're stored separately
      const metrics = pool.getMetrics();
      expect(metrics.poolSizes.array).toBe(1);
      expect(metrics.poolSizes.object).toBe(1);
      expect(metrics.poolSizes.stringWrapper).toBe(1);
    });
  });

  describe('Performance characteristics', () => {
    it('should reuse objects efficiently', () => {
      const factory = () => ({ data: new Array(100).fill(0) });
      
      // Get and return same object multiple times
      let obj = pool.get('perf', factory);
      const originalRef = obj;
      
      for (let i = 0; i < 10; i++) {
        pool.return('perf', obj);
        obj = pool.get('perf', factory);
      }
      
      // Should be the same object reference
      expect(obj).toBe(originalRef);
      
      const metrics = pool.getMetrics();
      expect(metrics.hits).toBe(10);
      expect(metrics.misses).toBe(1);
    });

    it('should handle high-frequency usage', () => {
      const factory = () => ({ counter: 0 });
      const resetFn = (obj: any) => { obj.counter = 0; };
      
      // Simulate high-frequency get/return cycle
      for (let i = 0; i < 100; i++) {
        const obj = pool.get('highfreq', factory);
        obj.counter = i;
        pool.return('highfreq', obj, resetFn);
      }
      
      const metrics = pool.getMetrics();
      expect(metrics.totalRequests).toBe(100);
      expect(metrics.returns).toBe(100);
      // After first miss, all should be hits
      expect(metrics.hits).toBe(99);
      expect(metrics.misses).toBe(1);
    });
  });
});

describe('MemoryPoolFactories', () => {
  let pool: ValidraMemoryPool;

  beforeEach(() => {
    pool = new ValidraMemoryPool(10);
  });

  describe('validationResult factory', () => {
    it('should create validation result object', () => {
      const result = pool.get('validationResult', MemoryPoolFactories.validationResult);
      
      expect(result).toHaveProperty('isValid', true);
      expect(result).toHaveProperty('data', null);
      expect(result).toHaveProperty('errors', {});
    });

    it('should reset validation result correctly', () => {
      const result = pool.get('validationResult', MemoryPoolFactories.validationResult);
      
      // Modify the result
      result.isValid = false;
      (result as any).data = { test: 'data' };
      result.errors = { field: ['error'] };
      
      // Reset it
      MemoryPoolFactories.resetValidationResult(result);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toBe(null);
      expect(result.errors).toEqual({});
    });
  });

  describe('errorArray factory', () => {
    it('should create empty array', () => {
      const arr = pool.get('errorArray', MemoryPoolFactories.errorArray);
      
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(0);
    });

    it('should reset array correctly', () => {
      const arr = pool.get('errorArray', MemoryPoolFactories.errorArray);
      
      // Add some items
      arr.push('error1', 'error2', 'error3');
      expect(arr.length).toBe(3);
      
      // Reset it
      MemoryPoolFactories.resetErrorArray(arr);
      
      expect(arr.length).toBe(0);
    });
  });

  describe('argumentsArray factory', () => {
    it('should create empty array', () => {
      const args = pool.get('argumentsArray', MemoryPoolFactories.argumentsArray);
      
      expect(Array.isArray(args)).toBe(true);
      expect(args.length).toBe(0);
    });

    it('should reset arguments array correctly', () => {
      const args = pool.get('argumentsArray', MemoryPoolFactories.argumentsArray);
      
      // Add some arguments
      args.push('arg1', 'arg2', 'arg3');
      expect(args.length).toBe(3);
      
      // Reset it
      MemoryPoolFactories.resetArgumentsArray(args);
      
      expect(args.length).toBe(0);
    });
  });

  describe('Factory integration with pool', () => {
    it('should work with validation result factory in pool', () => {
      // Get, modify, return with reset
      const result1 = pool.get('validationResult', MemoryPoolFactories.validationResult);
      result1.isValid = false;
      (result1 as any).data = { modified: true };
      
      pool.return('validationResult', result1, MemoryPoolFactories.resetValidationResult);
      
      // Get again - should be reset
      const result2 = pool.get('validationResult', MemoryPoolFactories.validationResult);
      
      expect(result1).toBe(result2); // Same object
      expect(result2.isValid).toBe(true); // Reset to default
      expect(result2.data).toBe(null); // Reset to default
      expect(result2.errors).toEqual({}); // Reset to default
    });

    it('should work with error array factory in pool', () => {
      const arr1 = pool.get('errorArray', MemoryPoolFactories.errorArray);
      arr1.push('error1', 'error2');
      
      pool.return('errorArray', arr1, MemoryPoolFactories.resetErrorArray);
      
      const arr2 = pool.get('errorArray', MemoryPoolFactories.errorArray);
      
      expect(arr1).toBe(arr2); // Same object
      expect(arr2.length).toBe(0); // Reset to empty
    });

    it('should work with arguments array factory in pool', () => {
      const args1 = pool.get('argumentsArray', MemoryPoolFactories.argumentsArray);
      args1.push('value', 'param1', 'param2');
      
      pool.return('argumentsArray', args1, MemoryPoolFactories.resetArgumentsArray);
      
      const args2 = pool.get('argumentsArray', MemoryPoolFactories.argumentsArray);
      
      expect(args1).toBe(args2); // Same object
      expect(args2.length).toBe(0); // Reset to empty
    });
  });
});
