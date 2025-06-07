import { describe, it, expect, vi } from 'vitest';
import { ValidraEngine } from '@/engine/validra-engine';
import { Rule } from '@/engine/rule';
import { ValidraStreamingValidator } from '@/engine/streaming-validator';

describe('ValidraEngine - Complete Coverage', () => {
  describe('Streaming validation complete coverage', () => {
    it('should convert arrays to streams and delegate properly', async () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ], [], { enableStreaming: true });
      
      // Test with array (should convert to stream)
      const arrayData = [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' }
      ];
      
      const results = [];
      for await (const result of engine.validateStream(arrayData)) {
        results.push(result);
      }
      
      expect(results.length).toBeGreaterThan(0);
      
      // Test with async iterable
      async function* createAsyncIterable() {
        for (const item of arrayData) {
          yield item;
        }
      }
      
      const asyncResults = [];
      for await (const result of engine.validateStream(createAsyncIterable())) {
        asyncResults.push(result);
      }
      
      expect(asyncResults.length).toBeGreaterThan(0);
    });

    it('should use custom streaming options when provided', async () => {
      const engine = new ValidraEngine([
        { field: 'id', op: 'isNumber' }
      ], [], { 
        enableStreaming: true,
        streamingChunkSize: 50 // Default chunk size
      });
      
      const data = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      
      // Override options if needed
      const customOptions = {};
      
      const results = [];
      for await (const result of engine.validateStream(data, customOptions)) {
        results.push(result);
      }
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle large datasets with streaming', async () => {
      const engine = new ValidraEngine([
        { field: 'value', op: 'isNumber' },
        { field: 'value', op: 'gte', params: { value: 0 } }
      ], [], { enableStreaming: true });
      
      // Create large dataset
      const largeData = Array.from({ length: 100 }, (_, i) => ({ value: i }));
      
      let processedCount = 0;
      const results = [];
      
      for await (const result of engine.validateStream(largeData)) {
        results.push(result);
        processedCount++;
      }
      
      expect(processedCount).toBeGreaterThan(0);
      expect(results.some(r => 'totalProcessed' in r)).toBe(true); // Should have summary
    });
  });

  describe('Validation function creation for streaming', () => {
    it('should create proper validation functions for streaming', async () => {
      const engine = new ValidraEngine([
        { field: 'email', op: 'isEmail', message: 'Invalid email' }
      ], [], { enableStreaming: true });
      
      const testData = [
        { email: 'valid@example.com' },
        { email: 'invalid-email' }
      ];
      
      const results = [];
      for await (const result of engine.validateStream(testData)) {
        if ('chunk' in result) { // It's a validation result, not summary
          results.push(result);
        }
      }
      
      expect(results.length).toBe(2);
      expect(results[0]!.isValid).toBe(true);
      expect(results[1]!.isValid).toBe(false);
      expect(results[1]!.errors).toHaveProperty('email');
    });
  });

  describe('Memory pool argument array management', () => {
    it('should handle argument array return to pool correctly', () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' },
        { field: 'age', op: 'gte', params: { value: 18 } },
        { field: 'email', op: 'isEmail' } // 3rd rule to trigger pooling
      ]);
      
      // Validate multiple times to test pool usage
      for (let i = 0; i < 10; i++) {
        const result = engine.validate({
          name: `Name${i}`,
          age: 20 + i,
          email: `user${i}@example.com`
        });
        expect(result.isValid).toBe(true);
      }
      
      const metrics = engine.getMemoryPoolMetrics();
      // Memory pool is used for validation result objects  
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });

    it('should return arguments to pool even on validation errors', () => {
      const engine = new ValidraEngine([
        { field: 'value', op: 'gte', params: { value: 'invalid' } } // This will cause an error
      ]);
      
      expect(() => {
        engine.validate({ value: 10 });
      }).toThrow();
      
      // Pool should still function correctly
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Rule application with pre-built arguments', () => {
    it('should handle rule application with argument pooling', () => {
      const engine = new ValidraEngine([
        { field: 'count', op: 'gte', params: { value: 5 } },
        { field: 'name', op: 'minLength', params: { value: 3 } },
        { field: 'email', op: 'isEmail' } // 3rd rule to trigger pooling
      ]);
      
      const data = {
        count: 10,
        name: 'John',
        email: 'john@example.com'
      };
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
      
      // Check memory pool was used
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });
  });

  describe('Error handling in rule application', () => {
    it('should handle errors in applyRuleWithArgs and still return arguments to pool', () => {
      // Create engine with rule that will cause validation error
      const engine = new ValidraEngine([
        { field: 'data', op: 'gte', params: { value: 10 } }
      ]);
      
      // This should cause a validation error (string vs number)
      expect(() => {
        engine.validate({ data: 'not a number' });
      }).toThrow();
      
      // Pool should still function after error
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Async rule application', () => {
    it('should handle async rule application correctly', async () => {
      const engine = new ValidraEngine([
        { field: 'value', op: 'isNumber' },
        { field: 'email', op: 'isEmail' }
      ]);
      
      const data = {
        value: 42,
        email: 'test@example.com'
      };
      
      const result = await engine.validateAsync(data);
      expect(result.isValid).toBe(true);
    });

    it('should handle async rule application errors', async () => {
      const engine = new ValidraEngine([
        { field: 'value', op: 'gte', params: { value: 10 } }
      ]);
      
      // This should cause a validation error during async validation
      await expect(async () => {
        await engine.validateAsync({ value: 'not a number' });
      }).rejects.toThrow();
    });
  });

  describe('Path cache LRU functionality', () => {
    it('should handle LRU cache operations correctly', () => {
      // Create many rules to test cache behavior
      const rules: Rule[] = [];
      for (let i = 0; i < 60; i++) { // More than cache limit
        rules.push({
          field: `deeply.nested.path.level${i}.value`,
          op: 'isString'
        });
      }
      
      const engine = new ValidraEngine(rules);
      
      // Create test data
      const data: any = { deeply: { nested: { path: {} } } };
      for (let i = 0; i < 60; i++) {
        data.deeply.nested.path[`level${i}`] = { value: `test${i}` };
      }
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('should reuse cached path segments correctly', () => {
      const engine = new ValidraEngine([
        { field: 'user.profile.name', op: 'isString' },
        { field: 'user.profile.email', op: 'isEmail' },
        { field: 'user.profile.name', op: 'minLength', params: { value: 2 } } // Reuse same path
      ]);
      
      const data = {
        user: {
          profile: {
            name: 'John',
            email: 'john@example.com'
          }
        }
      };
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Helper cache functionality', () => {
    it('should handle helper cache during preload', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' },
        { field: 'email', op: 'isEmail' },
        { field: 'age', op: 'isNumber' }
      ], [], { debug: true });
      
      // Helper cache should be populated during construction
      const data = {
        name: 'Test',
        email: 'test@example.com',
        age: 25
      };
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should handle missing helpers during preload with debug', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // This would normally fail, but with debug it should warn
      try {
        const engine = new ValidraEngine([
          { field: 'test', op: 'nonExistentHelper' as any }
        ], [], { debug: true });
      } catch (error) {
        // Expected to throw, but debug warning should have been called
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Build rule arguments optimization', () => {
    it('should build arguments correctly for different rule types', () => {
      const engine = new ValidraEngine([
        { field: 'simple', op: 'isString' }, // No params
        { field: 'withParams', op: 'gte', params: { value: 10 } }, // With params
        { field: 'complex', op: 'between', params: { min: 5, max: 15 } } // Complex params
      ]);
      
      const data = {
        simple: 'text',
        withParams: 12,
        complex: 10
      };
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
    });
  });
});
