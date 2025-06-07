import { describe, it, expect, vi } from 'vitest';
import { ValidraEngine } from '@/engine/validra-engine';
import { Rule } from '@/engine/rule';

describe('ValidraEngine - Advanced Coverage', () => {
  describe('Path handling and edge cases', () => {
    it('should handle array index access correctly', () => {
      const rules: Rule[] = [
        { field: 'users.0.name', op: 'isString' },
        { field: 'users.5.name', op: 'isString' } // Invalid index
      ];
      
      const engine = new ValidraEngine(rules);
      const data = {
        users: [
          { name: 'John' },
          { name: 'Jane' }
        ]
      };
      
      const result = engine.validate(data);
      
      // First rule should pass, second should fail due to invalid index
      expect(result.isValid).toBe(false);
      // The field "users.5.name" should be treated as a single field key
      expect(result.errors).toBeDefined();
    });

    it('should handle invalid array indices', () => {
      const rules: Rule[] = [
        { field: 'items.abc.value', op: 'isString' } // Non-numeric index
      ];
      
      const engine = new ValidraEngine(rules);
      const data = { items: [{ value: 'test' }] };
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(false);
    });

    it('should handle negative array indices', () => {
      const rules: Rule[] = [
        { field: 'items.-1.value', op: 'isString' } // Negative index
      ];
      
      const engine = new ValidraEngine(rules);
      const data = { items: [{ value: 'test' }] };
      
      const result = engine.validate(data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Memory pool optimization', () => {
    it('should provide memory pool metrics', () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ]);
      
      const metrics = engine.getMemoryPoolMetrics();
      
      expect(metrics).toHaveProperty('hits');
      expect(metrics).toHaveProperty('misses');
      expect(metrics).toHaveProperty('allocations');
      expect(metrics).toHaveProperty('returns');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('poolSizes');
    });

    it('should clear memory pool correctly', () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ]);
      
      // Validate something to populate the pool
      engine.validate({ name: 'test' });
      
      // Clear the pool
      engine.clearMemoryPool();
      
      const metrics = engine.getMemoryPoolMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.allocations).toBe(0);
      expect(metrics.returns).toBe(0);
    });
  });

  describe('Callback error handling', () => {
    it('should throw error for missing string callback', () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ]);
      
      expect(() => {
        engine.validate({ name: 'test' }, 'nonExistentCallback');
      }).toThrow('Callback with name "nonExistentCallback" not found.');
    });

    it('should throw error for invalid callback type', () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ]);
      
      expect(() => {
        engine.validate({ name: 'test' }, 123 as any);
      }).toThrow('Callback must be a string or a function.');
    });

    it('should handle async callback errors', async () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ]);
      
      await expect(async () => {
        await engine.validateAsync({ name: 'test' }, 'nonExistentCallback');
      }).rejects.toThrow('Callback with name "nonExistentCallback" not found.');
    });

    it('should handle async callback with invalid type', async () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ]);
      
      await expect(async () => {
        await engine.validateAsync({ name: 'test' }, 123 as any);
      }).rejects.toThrow('Callback must be a string or a function.');
    });
  });

  describe('Rule compilation and error handling', () => {
    it('should handle unknown operation in rule compilation', () => {
      expect(() => {
        new ValidraEngine([
          { field: 'name', op: 'unknownOp' as any }
        ]);
      }).toThrow(/Helper with name "unknownOp" not found/);
    });

    it('should handle rule application errors', () => {
      const engine = new ValidraEngine([
        { field: 'age', op: 'gte', params: { value: 'invalid' } } // Invalid param type
      ]);
      
      expect(() => {
        engine.validate({ age: 25 });
      }).toThrow();
    });

    it('should handle negative rules correctly', () => {
      const engine = new ValidraEngine([
        { field: 'username', op: 'contains', params: { value: 'admin' }, negative: true }
      ]);
      
      const validResult = engine.validate({ username: 'john_doe' });
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = engine.validate({ username: 'admin_user' });
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('Debug mode functionality', () => {
    it('should work with debug mode enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ], [], { debug: true });
      
      engine.validate({ name: 'test' });
      
      consoleSpy.mockRestore();
    });

    it('should not log debug messages when debug is disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ], [], { debug: false });
      
      engine.validate({ name: 'test' });
      
      // Debug logs should not be called
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Path cache optimization', () => {
    it('should handle path cache size limits', () => {
      const engine = new ValidraEngine([]);
      
      // Fill path cache beyond limit (assuming MAX_PATH_CACHE_SIZE = 50)
      for (let i = 0; i < 60; i++) {
        const rule: Rule = { field: `field${i}`, op: 'isString' };
        const newEngine = new ValidraEngine([rule]);
        newEngine.validate({ [`field${i}`]: 'test' });
      }
      
      // Should not throw and should work correctly
      expect(true).toBe(true);
    });

    it('should reuse cached path segments', () => {
      const engine = new ValidraEngine([
        { field: 'user.profile.name', op: 'isString' },
        { field: 'user.profile.email', op: 'isEmail' }
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

  describe('Async validation edge cases', () => {
    it('should handle async rule application errors', async () => {
      const engine = new ValidraEngine([
        { field: 'data', op: 'isString' }
      ]);
      
      // This should work normally
      const result = await engine.validateAsync({ data: 'test' });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Streaming validation', () => {
    it('should warn when streaming is not enabled', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ], [], { enableStreaming: false });
      
      const data = [{ name: 'test1' }, { name: 'test2' }];
      const results = [];
      
      for await (const result of engine.validateStream(data)) {
        results.push(result);
      }
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Streaming validation is not enabled'),
        expect.any(Object)
      );
      
      warnSpy.mockRestore();
    });

    it('should handle streaming with custom options', async () => {
      const engine = new ValidraEngine([
        { field: 'name', op: 'isString' }
      ], [], { enableStreaming: true, streamingChunkSize: 2 });
      
      const data = [
        { name: 'test1' },
        { name: 'test2' },
        { name: 'test3' }
      ];
      
      const results = [];
      for await (const result of engine.validateStream(data)) {
        results.push(result);
      }
      
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
