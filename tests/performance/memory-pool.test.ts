import { describe, it, expect, beforeEach } from 'vitest';
import { ValidraEngine, ValidraMemoryPool, MemoryPoolFactories } from '@/engine';

describe('Memory Pool Optimizations', () => {
  let engine: ValidraEngine;
  let rules: any[];

  beforeEach(() => {
    rules = [
      { field: 'name', op: 'isString' } as any,
      { field: 'age', op: 'isNumber' } as any,
      { field: 'email', op: 'contains', params: { value: '@' } } as any
    ];
  });

  describe('Memory Pool Functionality', () => {
    it('should enable memory pool by default', () => {
      engine = new ValidraEngine(rules);
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBe(0);
    });

    it('should reuse objects from memory pool during validation', () => {
      engine = new ValidraEngine(rules, [], { enableMemoryPool: true });
      
      const testData = { name: 'John', age: 30, email: 'john@test.com' };
      
      // Perform multiple validations
      for (let i = 0; i < 10; i++) {
        const result = engine.validate(testData);
        expect(result.isValid).toBe(true);
      }
      
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.hitRate).toBeGreaterThan(0);
    });

    it('should handle memory pool with invalid data', () => {
      engine = new ValidraEngine(rules, [], { enableMemoryPool: true });
      
      const invalidData = { name: 123, age: 'invalid', email: 'noemail' };
      
      const result = engine.validate(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });

    it('should clear memory pool correctly', () => {
      engine = new ValidraEngine(rules, [], { enableMemoryPool: true });
      
      // Perform some validations
      engine.validate({ name: 'Test', age: 25, email: 'test@email.com' });
      
      let metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      
      // Clear pool
      engine.clearMemoryPool();
      
      metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
    });

    it('should work with memory pool disabled', () => {
      engine = new ValidraEngine(rules, [], { enableMemoryPool: false });
      
      const testData = { name: 'John', age: 30, email: 'john@test.com' };
      const result = engine.validate(testData);
      
      expect(result.isValid).toBe(true);
      
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBe(0);
    });
  });

  describe('Memory Pool Factories', () => {
    let pool: ValidraMemoryPool;

    beforeEach(() => {
      pool = new ValidraMemoryPool(5);
    });

    it('should create and reset validation results', () => {
      const result1 = pool.get('validationResult', MemoryPoolFactories.validationResult);
      expect(result1.isValid).toBe(true);
      expect(result1.data).toBe(null);
      expect(result1.errors).toEqual({});

      // Modify the result
      result1.isValid = false;
      result1.data = { test: 'data' } as any;
      result1.errors = { field: ['error'] as any };

      // Return to pool
      pool.return('validationResult', result1, MemoryPoolFactories.resetValidationResult);

      // Get it again
      const result2 = pool.get('validationResult', MemoryPoolFactories.validationResult);
      expect(result2).toBe(result1); // Same object
      expect(result2.isValid).toBe(true); // Reset
      expect(result2.data).toBe(null); // Reset
      expect(result2.errors).toEqual({}); // Reset
    });

    it('should create and reset error arrays', () => {
      const arr1 = pool.get('errorArray', MemoryPoolFactories.errorArray);
      expect(arr1).toEqual([]);

      // Modify array
      arr1.push('error1', 'error2');
      expect(arr1.length).toBe(2);

      // Return to pool
      pool.return('errorArray', arr1, MemoryPoolFactories.resetErrorArray);

      // Get it again
      const arr2 = pool.get('errorArray', MemoryPoolFactories.errorArray);
      expect(arr2).toBe(arr1); // Same object
      expect(arr2.length).toBe(0); // Reset
    });

    it('should create and reset arguments arrays', () => {
      const args1 = pool.get('argumentsArray', MemoryPoolFactories.argumentsArray);
      expect(args1).toEqual([]);

      // Modify array
      args1.push('arg1', 42, true);
      expect(args1.length).toBe(3);

      // Return to pool
      pool.return('argumentsArray', args1, MemoryPoolFactories.resetArgumentsArray);

      // Get it again
      const args2 = pool.get('argumentsArray', MemoryPoolFactories.argumentsArray);
      expect(args2).toBe(args1); // Same object
      expect(args2.length).toBe(0); // Reset
    });
  });

  describe('High-frequency validation scenarios', () => {
    it('should handle thousands of validations efficiently', () => {
      engine = new ValidraEngine(rules, [], { 
        enableMemoryPool: true,
        memoryPoolSize: 50 
      });
      
      const startTime = performance.now();
      
      // Simulate high-frequency validation (like RabbitMQ message processing)
      for (let i = 0; i < 1000; i++) {
        const testData = {
          name: `User${i}`,
          age: 20 + (i % 50),
          email: `user${i}@test.com`
        };
        
        const result = engine.validate(testData);
        expect(result.isValid).toBe(true);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second for 1000 validations)
      expect(duration).toBeLessThan(1000);
      
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.hitRate).toBeGreaterThan(50); // Should have good hit rate
      
      console.log(`High-frequency test completed in ${duration.toFixed(2)}ms`);
      console.log(`Memory pool hit rate: ${metrics.hitRate.toFixed(2)}%`);
    });

    it('should handle validation errors efficiently with memory pool', () => {
      engine = new ValidraEngine(rules, [], { enableMemoryPool: true });
      
      // Mix of valid and invalid data
      const testCases = [
        { name: 'Valid', age: 25, email: 'valid@test.com' }, // Valid
        { name: 123, age: 25, email: 'valid@test.com' }, // Invalid name
        { name: 'Valid', age: 'invalid', email: 'valid@test.com' }, // Invalid age
        { name: 'Valid', age: 25, email: 'invalid' }, // Invalid email
        { name: 123, age: 'invalid', email: 'invalid' }, // All invalid
      ];
      
      let validCount = 0;
      let invalidCount = 0;
      
      for (let i = 0; i < 100; i++) {
        const testData = testCases[i % testCases.length]!;
        const result = engine.validate(testData);
        
        if (result.isValid) {
          validCount++;
        } else {
          invalidCount++;
          expect(result.errors).toBeDefined();
        }
      }
      
      expect(validCount).toBe(20); // 1 valid case out of 5, repeated 20 times
      expect(invalidCount).toBe(80); // 4 invalid cases out of 5, repeated 20 times
      
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });
  });
});
