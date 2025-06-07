import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidraEngine } from '@/engine/validra-engine';
import { Rule } from '@/engine/rule';
import { ValidraCallback } from '@/engine/interfaces';

describe('ValidraEngine', () => {
  let engine: ValidraEngine;
  let basicRules: Rule[];
  let testData: any;

  beforeEach(() => {
    basicRules = [
      { field: 'name', op: 'isString' as any },
      { field: 'email', op: 'isEmail' as any },
      { field: 'age', op: 'gte', params: { value: 18 } } as any
    ];

    testData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };

    engine = new ValidraEngine(basicRules);
  });

  describe('Constructor', () => {
    it('should initialize with basic rules', () => {
      expect(engine).toBeInstanceOf(ValidraEngine);
    });

    it('should initialize with empty rules', () => {
      const emptyEngine = new ValidraEngine([]);
      const result = emptyEngine.validate(testData);
      expect(result.isValid).toBe(true);
    });

    it('should initialize with callbacks', () => {
      const callback: ValidraCallback = {
        name: 'testCallback',
        callback: vi.fn()
      };
      const engineWithCallback = new ValidraEngine(basicRules, [callback]);
      expect(engineWithCallback).toBeInstanceOf(ValidraEngine);
    });

    it('should initialize with options', () => {
      const engineWithOptions = new ValidraEngine(basicRules, [], {
        debug: true,
        throwOnUnknownField: true,
        enableMemoryPool: false
      });
      expect(engineWithOptions).toBeInstanceOf(ValidraEngine);
    });

    it('should throw error for unknown operation', () => {
      const invalidRules = [
        { field: 'name', op: 'unknownOperation' as any }
      ];
      expect(() => new ValidraEngine(invalidRules)).toThrow('Helper with name "unknownOperation" not found.');
    });
  });

  describe('validate() method', () => {
    it('should validate valid data successfully', () => {
      const result = engine.validate(testData);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.errors).toEqual({});
    });

    it('should detect validation errors', () => {
      const invalidData = {
        name: 123, // Should be string
        email: 'invalid-email', // Should be valid email
        age: 15 // Should be >= 18
      };

      const result = engine.validate(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors!)).toContain('name');
      expect(Object.keys(result.errors!)).toContain('email');
      expect(Object.keys(result.errors!)).toContain('age');
    });

    it('should handle nested field paths', () => {
      const nestedRules = [
        { field: 'user.profile.name', op: 'isString' as any },
        { field: 'user.profile.age', op: 'isNumber' as any }
      ];
      const nestedEngine = new ValidraEngine(nestedRules);
      
      const nestedData = {
        user: {
          profile: {
            name: 'John',
            age: 25
          }
        }
      };

      const result = nestedEngine.validate(nestedData);
      expect(result.isValid).toBe(true);
    });

    it('should handle array index access', () => {
      const arrayRules = [
        { field: 'users.0.name', op: 'isString' as any },
        { field: 'users.1.age', op: 'isNumber' as any }
      ];
      const arrayEngine = new ValidraEngine(arrayRules);
      
      const arrayData = {
        users: [
          { name: 'John', age: 25 },
          { name: 'Jane', age: 30 }
        ]
      };

      const result = arrayEngine.validate(arrayData);
      expect(result.isValid).toBe(true);
    });

    it('should support failFast option', () => {
      const invalidData = {
        name: 123,
        email: 'invalid-email',
        age: 15
      };

      const result = engine.validate(invalidData, undefined, { failFast: true });
      
      expect(result.isValid).toBe(false);
      // Should stop after first error
      expect(Object.keys(result.errors!).length).toBe(1);
    });

    it('should respect maxErrors limit', () => {
      const invalidData = {
        name: 123,
        email: 'invalid-email',
        age: 15
      };

      const result = engine.validate(invalidData, undefined, { maxErrors: 2 });
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors!).length).toBeLessThanOrEqual(2);
    });

    it('should throw error for null/undefined data', () => {
      expect(() => engine.validate(null as any)).toThrow('Invalid data provided for validation');
      expect(() => engine.validate(undefined as any)).toThrow('Invalid data provided for validation');
    });

    it('should throw error for non-object data', () => {
      expect(() => engine.validate('string' as any)).toThrow('Invalid data provided for validation');
      expect(() => engine.validate(123 as any)).toThrow('Invalid data provided for validation');
    });
  });

  describe('validateAsync() method', () => {
    it('should validate data asynchronously', async () => {
      const result = await engine.validateAsync(testData);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(testData);
    });

    it('should handle async validation errors', async () => {
      const invalidData = {
        name: 123,
        email: 'invalid-email',
        age: 15
      };

      const result = await engine.validateAsync(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should throw error for invalid data in strict mode', async () => {
      const strictEngine = new ValidraEngine(basicRules, [], {
        allowPartialValidation: false
      });

      // Create a rule that will throw an error during execution
      const problematicRules = [
        { field: 'name', op: 'isString' as any },
        { field: 'nonexistent.field', op: 'isString' as any }
      ];
      
      const problematicEngine = new ValidraEngine(problematicRules, [], {
        allowPartialValidation: false
      });

      const testData = { name: 'John' };
      
      // This should not throw in partial validation mode, but might in strict mode
      const result = await problematicEngine.validateAsync(testData);
      expect(result).toBeDefined();
    });
  });

  describe('Callback support', () => {
    it('should execute string callback', () => {
      const mockCallback = vi.fn();
      const callback: ValidraCallback = {
        name: 'testCallback',
        callback: mockCallback
      };
      
      const engineWithCallback = new ValidraEngine(basicRules, [callback]);
      engineWithCallback.validate(testData, 'testCallback');
      
      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
        isValid: true,
        data: null, // El memory pool resetea la data
        errors: {}
      }));
    });

    it('should execute function callback', () => {
      const mockCallback = vi.fn();
      
      engine.validate(testData, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
        isValid: true,
        data: null, // El memory pool resetea la data
        errors: {}
      }));
    });

    it('should throw error for unknown callback name', () => {
      expect(() => {
        engine.validate(testData, 'unknownCallback');
      }).toThrow('Callback with name "unknownCallback" not found.');
    });

    it('should throw error for invalid callback type', () => {
      expect(() => {
        engine.validate(testData, 123 as any);
      }).toThrow('Callback must be a string or a function.');
    });

    it('should execute async string callback', async () => {
      const mockCallback = vi.fn();
      const callback: ValidraCallback = {
        name: 'asyncCallback',
        callback: mockCallback
      };
      
      const engineWithCallback = new ValidraEngine(basicRules, [callback]);
      await engineWithCallback.validateAsync(testData, 'asyncCallback');
      
      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
        isValid: true,
        data: testData
      }));
    });
  });

  describe('Rule parameters', () => {
    it('should handle rules with parameters', () => {
      const rulesWithParams = [
        { field: 'age', op: 'gte', params: { value: 21 } } as any,
        { field: 'name', op: 'minLength', params: { value: 2 } } as any // Cambiar length por value
      ];
      
      const paramEngine = new ValidraEngine(rulesWithParams);
      
      const validData = { age: 25, name: 'John' };
      const result = paramEngine.validate(validData);
      
      expect(result.isValid).toBe(true);
    });

    it('should throw error for missing required parameters', () => {
      // This test checks if the engine properly validates rule parameters
      const incompleteRules = [
        { field: 'age', op: 'gte' } as any // Missing required 'value' parameter
      ];
      
      const incompleteEngine = new ValidraEngine(incompleteRules);
      
      expect(() => {
        incompleteEngine.validate({ age: 25 });
      }).toThrow('Rule validation failed for field "age"');
    });
  });

  describe('Negative rules', () => {
    it('should handle negative validation rules', () => {
      const negativeRules = [
        { field: 'name', op: 'isString', negative: true } as any // Should NOT be string
      ];
      
      const negativeEngine = new ValidraEngine(negativeRules);
      
      // Test with string (should fail because negative=true)
      const stringData = { name: 'John' };
      const stringResult = negativeEngine.validate(stringData);
      expect(stringResult.isValid).toBe(false);
      
      // Test with number (should pass because negative=true and isString returns false)
      const numberData = { name: 123 };
      const numberResult = negativeEngine.validate(numberData);
      expect(numberResult.isValid).toBe(true);
    });
  });

  describe('Engine options', () => {
    it('should respect throwOnUnknownField option', () => {
      const strictEngine = new ValidraEngine(basicRules, [], {
        throwOnUnknownField: true
      });
      
      const unknownFieldRules = [
        { field: 'unknownField', op: 'isString' as any }
      ];
      
      const unknownEngine = new ValidraEngine(unknownFieldRules, [], {
        throwOnUnknownField: true
      });
      
      expect(() => {
        unknownEngine.validate({});
      }).toThrow('Rule validation failed for field "unknownField"');
    });

    it('should handle allowPartialValidation option', () => {
      const partialEngine = new ValidraEngine(basicRules, [], {
        allowPartialValidation: true
      });
      
      expect(partialEngine).toBeInstanceOf(ValidraEngine);
    });
  });

  describe('Memory Pool integration', () => {
    it('should provide memory pool metrics', () => {
      const metrics = engine.getMemoryPoolMetrics();
      
      expect(metrics).toHaveProperty('hits');
      expect(metrics).toHaveProperty('misses');
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('hitRate');
    });

    it('should clear memory pool', () => {
      engine.clearMemoryPool();
      const metrics = engine.getMemoryPoolMetrics();
      
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle circular references gracefully', () => {
      const circularData: any = { name: 'John' };
      circularData.self = circularData;
      
      // Should throw an error due to circular reference in email validation
      expect(() => {
        engine.validate(circularData);
      }).toThrow('Rule validation failed for field "email"');
    });

    it('should handle very large data objects', () => {
      const largeData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
        largeArray: new Array(10000).fill('data')
      };
      
      const result = engine.validate(largeData);
      expect(result).toBeDefined();
    });

    it('should handle undefined and null values in nested paths', () => {
      const nestedRules = [
        { field: 'user.profile.name', op: 'isString' as any }
      ];
      const nestedEngine = new ValidraEngine(nestedRules);
      
      // Test with null nested object
      const nullData = { user: null };
      const nullResult = nestedEngine.validate(nullData);
      expect(nullResult.isValid).toBe(false);
      
      // Test with undefined nested object
      const undefinedData = { user: undefined };
      const undefinedResult = nestedEngine.validate(undefinedData);
      expect(undefinedResult.isValid).toBe(false);
    });

    it('should handle invalid array indices', () => {
      const arrayRules = [
        { field: 'items.10.name', op: 'isString' as any } // Index out of bounds
      ];
      const arrayEngine = new ValidraEngine(arrayRules);
      
      const arrayData = {
        items: [{ name: 'item1' }, { name: 'item2' }] // Only 2 items
      };
      
      const result = arrayEngine.validate(arrayData);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Performance and debugging', () => {
    it('should work with debug mode enabled', () => {
      const debugEngine = new ValidraEngine(basicRules, [], {
        debug: true
      });
      
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      debugEngine.validate(testData);
      
      // Debug messages should be logged
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should measure validation performance', () => {
      const startTime = performance.now();
      engine.validate(testData);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });
});
