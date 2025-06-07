import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidraEngine } from '@/engine/validra-engine';
import { Rule } from '@/engine/rule';

describe('ValidraEngine - Uncovered Lines Coverage Tests', () => {
  let engine: ValidraEngine;

  beforeEach(() => {
    // Basic setup for most tests
    const rules: Rule[] = [
      { field: 'name', op: 'isString' as const },
      { field: 'age', op: 'gte', params: { value: 18 } }
    ];
    
    engine = new ValidraEngine(rules, [], {
      enableMemoryPool: true,
      debug: true
    });
  });

  describe('Data Size Calculation Error Handling - Line 81', () => {
    it('should handle circular references in getDataSize', async () => {
      // Create circular reference data with proper field
      const circularData: any = { name: 'John', age: 25 };
      circularData.self = circularData;

      // Use partial validation to continue despite errors
      const partialEngine = new ValidraEngine(
        [{ field: 'name', op: 'isString' as const }],
        [],
        { allowPartialValidation: true }
      );

      // This should trigger the catch block in getDataSize (line 81)
      const result = await partialEngine.validateAsync(circularData);
      
      // Should still work despite circular reference
      expect(result).toBeDefined();
      expect(result.data).toBe(circularData);
      expect(result.isValid).toBe(true); // name field validation should pass
    });

    it('should handle very large data sets that exceed JSON.stringify limits', () => {
      // Create a very large data structure
      const largeData = {
        name: 'John',
        age: 25,
        data: new Array(1000).fill(0).map((_, i) => ({
          id: i,
          value: `large_value_${i}`.repeat(50)
        }))
      };

      // This might trigger size calculation issues
      const result = engine.validate(largeData);
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Missing Parameter Error - Line 139', () => {
    it('should handle error when required parameter is missing', () => {
      const rulesWithMissingParams: Rule[] = [
        // Create a rule that expects params but won't have them
        { field: 'age', op: 'gte', params: { value: undefined } } as any // Missing 'value' param
      ];
      
      const engineWithBadRules = new ValidraEngine(rulesWithMissingParams);
      
      expect(() => {
        engineWithBadRules.validate({ age: 25 });
      }).toThrow(/Rule validation failed for field "age"/);
    });

    it('should handle undefined params object', () => {
      const rulesWithUndefinedParams: Rule[] = [
        { field: 'age', op: 'gte' } as any // Missing params entirely
      ];
      
      const engineWithBadRules = new ValidraEngine(rulesWithUndefinedParams);
      
      expect(() => {
        engineWithBadRules.validate({ age: 25 });
      }).toThrow(/Rule validation failed for field "age"/);
    });
  });

  describe('Memory Pool Return - Line 154', () => {
    it('should return large argument arrays to memory pool', () => {
      const rules: Rule[] = [
        { 
          field: 'value', 
          op: 'between', 
          params: { min: 10, max: 50 } 
        }
      ];
      
      const memoryPoolEngine = new ValidraEngine(rules, [], {
        enableMemoryPool: true
      });
      
      // This should trigger memory pool usage for arguments
      const result = memoryPoolEngine.validate({ value: 25 });
      expect(result.isValid).toBe(true);
    });

    it('should handle memory pool disabled scenario', () => {
      const rules: Rule[] = [
        { 
          field: 'value', 
          op: 'between', 
          params: { min: 10, max: 50 } 
        }
      ];
      
      const noPoolEngine = new ValidraEngine(rules, [], {
        enableMemoryPool: false
      });
      
      const result = noPoolEngine.validate({ value: 25 });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Fail Fast and Max Errors - Lines 287-292', () => {
    it('should stop validation early with failFast option', () => {
      const rules: Rule[] = [
        { field: 'name', op: 'isString' as const },
        { field: 'email', op: 'isEmail' as const },
        { field: 'age', op: 'isNumber' as const }
      ];
      
      const fastFailEngine = new ValidraEngine(rules);
      
      const invalidData = {
        name: 123, // Invalid
        email: 'invalid-email', // Invalid
        age: 'not-a-number' // Invalid
      };
      
      const result = fastFailEngine.validate(invalidData, undefined, { 
        failFast: true 
      });
      
      expect(result.isValid).toBe(false);
      // Should have stopped after first error
      const totalErrors = Object.values(result.errors || {})
        .reduce((sum, fieldErrors) => sum + (fieldErrors as any[]).length, 0);
      expect(totalErrors).toBe(1);
    });

    it('should respect maxErrors limit', () => {
      const rules: Rule[] = [
        { field: 'name', op: 'isString' as const },
        { field: 'email', op: 'isEmail' as const },
        { field: 'age', op: 'isNumber' as const },
        { field: 'score', op: 'isNumber' as const }
      ];
      
      const engine = new ValidraEngine(rules);
      
      const invalidData = {
        name: 123, // Invalid
        email: 'invalid-email', // Invalid  
        age: 'not-a-number', // Invalid
        score: 'not-a-number' // Invalid
      };
      
      const result = engine.validate(invalidData, undefined, { 
        maxErrors: 2 
      });
      
      expect(result.isValid).toBe(false);
      const totalErrors = Object.values(result.errors || {})
        .reduce((sum, fieldErrors) => sum + (fieldErrors as any[]).length, 0);
      expect(totalErrors).toBeLessThanOrEqual(2);
    });
  });

  describe('Async Callback and Logging - Lines 376-377, 508', () => {
    it('should execute async callback function', async () => {
      const callbackSpy = vi.fn();
      
      const result = await engine.validateAsync(
        { name: 'John', age: 25 },
        callbackSpy
      );
      
      expect(result.isValid).toBe(true);
      expect(callbackSpy).toHaveBeenCalledWith(result);
    });

    it('should execute named async callback', async () => {
      const namedCallback = vi.fn();
      const callbacks = [
        { name: 'testCallback', callback: namedCallback }
      ];
      
      const engineWithCallback = new ValidraEngine(
        [{ field: 'name', op: 'isString' as const }],
        callbacks
      );
      
      const result = await engineWithCallback.validateAsync(
        { name: 'John' },
        'testCallback'
      );
      
      expect(result.isValid).toBe(true);
      expect(namedCallback).toHaveBeenCalledWith(result);
    });

    it('should throw error for unknown named callback', async () => {
      await expect(
        engine.validateAsync(
          { name: 'John', age: 25 },
          'unknownCallback'
        )
      ).rejects.toThrow('Callback with name "unknownCallback" not found');
    });

    it('should throw error for invalid callback type', async () => {
      await expect(
        engine.validateAsync(
          { name: 'John', age: 25 },
          123 as any
        )
      ).rejects.toThrow('Callback must be a string or a function');
    });
  });

  describe('Unknown Helper Error - Line 527', () => {
    it('should throw error for unknown operation during rule compilation', () => {
      const invalidRules: Rule[] = [
        { field: 'name', op: 'unknownOperation' as any }
      ];
      
      expect(() => {
        new ValidraEngine(invalidRules);
      }).toThrow(/Helper with name "unknownOperation" not found/);
    });
  });

  describe('Apply Rule Errors - Lines 599, 624', () => {
    it('should handle resolver errors in applyRuleWithArgs', () => {
      // Create a mock rule that will cause an error in the resolver
      const problematicRules: Rule[] = [
        { field: 'value', op: 'gt', params: { value: 'invalid-number' } }
      ];
      
      const problematicEngine = new ValidraEngine(problematicRules);
      
      expect(() => {
        problematicEngine.validate({ value: 10 });
      }).toThrow(/Rule validation failed for field "value"/);
    });

    it('should handle resolver errors in applyRuleAsync', async () => {
      const problematicRules: Rule[] = [
        { field: 'value', op: 'gt', params: { value: 'invalid-number' } }
      ];
      
      const problematicEngine = new ValidraEngine(problematicRules);
      
      await expect(
        problematicEngine.validateAsync({ value: 10 })
      ).rejects.toThrow(/Error in async operation 'gt' on field 'value'/);
    });

    it('should handle null helper in compiled rule', () => {
      // This is a more complex scenario where we might have a null helper
      // We'll test by creating a scenario where the helper lookup fails
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      try {
        const rules: Rule[] = [
          { field: 'name', op: 'isString' as const }
        ];
        
        const engine = new ValidraEngine(rules);
        
        // Manually corrupt the compiled rules to test null helper scenario
        // This is an edge case that might happen in extreme circumstances
        (engine as any).compiledRules[0].helper = null;
        
        expect(() => {
          engine.validate({ name: 'John' });
        }).toThrow(/Rule validation failed for field "name"/);
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('Error Message Conversion', () => {
    it('should handle non-Error objects in catch blocks', () => {
      // Mock a scenario where something throws a non-Error object
      const compiledRules = (engine as any).compiledRules;
      const originalResolver = compiledRules[0]?.helper?.resolver;
      
      if (originalResolver && compiledRules[0]?.helper) {
        // Replace with a function that throws a non-Error
        compiledRules[0].helper.resolver = () => {
          throw 'String error message';
        };
        
        expect(() => {
          engine.validate({ name: 'John', age: 25 });
        }).toThrow(/Rule validation failed for field "name"/);
        
        // Restore original resolver
        compiledRules[0].helper.resolver = originalResolver;
      }
    });
  });

  describe('Partial Validation Mode', () => {
    it('should continue validation in partial mode when rules fail', () => {
      const rules: Rule[] = [
        { field: 'value', op: 'gt', params: { value: 'invalid-number' } },
        { field: 'name', op: 'isString' as const }
      ];
      
      const partialEngine = new ValidraEngine(rules, [], {
        allowPartialValidation: true
      });
      
      const result = partialEngine.validate({ 
        value: 10,
        name: 'John' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should continue async validation in partial mode when rules fail', async () => {
      const rules: Rule[] = [
        { field: 'value', op: 'gt', params: { value: 'invalid-number' } },
        { field: 'name', op: 'isString' as const }
      ];
      
      const partialEngine = new ValidraEngine(rules, [], {
        allowPartialValidation: true
      });
      
      const result = await partialEngine.validateAsync({ 
        value: 10,
        name: 'John' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Unknown Operation in Helper', () => {
    it('should handle unknown operation in getHelper method', () => {
      // Create engine with rules targeting missing fields to test graceful handling
      const testEngine = new ValidraEngine([
        { field: 'name', op: 'isString' as const },
        { field: 'age', op: 'gte', params: { value: 18 } }
      ]);
      
      // This should throw an error because required fields are missing and validation fails
      expect(() => {
        testEngine.validate({ unknownField: 'test' });
      }).toThrow(/Rule validation failed for field "age"/);
    });
  });

  describe('Unknown Field Validation', () => {
    it('should handle error for unknown field when throwOnUnknownField is enabled', () => {
      const strictEngine = new ValidraEngine(
        [{ field: 'unknownField', op: 'isString' as const }],
        [],
        { throwOnUnknownField: true }
      );
      
      expect(() => {
        strictEngine.validate({ name: 'John' }); // unknownField is missing
      }).toThrow(/Rule validation failed for field "unknownField"/);
    });
  });
});
