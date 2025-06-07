import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidraStreamingValidator } from '@/engine/streaming-validator';
import { ValidraResult } from '@/engine/interfaces';

describe('ValidraStreamingValidator - Coverage Tests', () => {
  describe('Constructor callback coverage', () => {
    it('should call onChunkComplete callback when provided', async () => {
      const onChunkComplete = vi.fn();
      const onComplete = vi.fn();
      
      const validator = new ValidraStreamingValidator({
        onChunkComplete,
        onComplete
      });

      const testData = [
        { id: 1, valid: true },
        { id: 2, valid: true }
      ];

      const mockValidator = (item: any): ValidraResult<any> => ({
        isValid: true,
        data: item,
        errors: {}
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, mockValidator);

      for await (const result of stream) {
        results.push(result);
      }

      // Verify callbacks were called
      expect(onChunkComplete).toHaveBeenCalledTimes(2);
      expect(onComplete).toHaveBeenCalledTimes(1);
      
      // Verify callback arguments
      expect(onChunkComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          chunk: { id: 1, valid: true },
          index: 0,
          isValid: true,
          errors: {},
          isComplete: false,
          totalProcessed: 1
        })
      );

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          totalProcessed: 2,
          totalValid: 2,
          totalInvalid: 0,
          totalErrors: 0,
          processingTime: expect.any(Number),
          averageTimePerItem: expect.any(Number)
        })
      );
    });

    it('should handle constructor without callbacks', () => {
      const validator = new ValidraStreamingValidator();
      
      expect(validator).toBeInstanceOf(ValidraStreamingValidator);
    });
  });

  describe('Error handling in validateStream', () => {
    it('should handle validation errors gracefully', async () => {
      const validator = new ValidraStreamingValidator();

      const testData = [
        { id: 1, valid: true },
        { id: 2, valid: false }, // This will cause an error
        { id: 3, valid: true }
      ];

      // Mock validator that throws an error for invalid items
      const errorValidator = (item: any): ValidraResult<any> => {
        if (!item.valid) {
          throw new Error('Validation failed for invalid item');
        }
        return {
          isValid: true,
          data: item,
          errors: {}
        };
      };

      const results: any[] = [];
      const stream = validator.validateStream(testData, errorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      expect(results).toHaveLength(3);
      
      // First item should be valid
      expect(results[0].isValid).toBe(true);
      expect(results[0].chunk).toEqual({ id: 1, valid: true });
      
      // Second item should be invalid due to error
      expect(results[1].isValid).toBe(false);
      expect(results[1].chunk).toEqual({ id: 2, valid: false });
      expect(results[1].errors).toEqual({
        validation: ['Validation error: Validation failed for invalid item']
      });
      
      // Third item should be valid
      expect(results[2].isValid).toBe(true);
      expect(results[2].chunk).toEqual({ id: 3, valid: true });
    });

    it('should handle non-Error exceptions in validation', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [{ id: 1, valid: false }];
      
      // Mock validator that throws a string instead of Error
      const stringErrorValidator = (item: any): ValidraResult<any> => {
        throw 'String error message';
      };

      const results: any[] = [];
      const stream = validator.validateStream(testData, stringErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errors).toEqual({
        validation: ['Validation error: String error message']
      });
    });
  });

  describe('convertErrors method coverage', () => {
    it('should handle different error formats', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [
        { id: 1, errorType: 'array' },
        { id: 2, errorType: 'string' },
        { id: 3, errorType: 'object' }
      ];

      const complexErrorValidator = (item: any): ValidraResult<any> => {
        let errors: any = {};
        
        switch (item.errorType) {
          case 'array':
            errors = {
              field1: ['Error 1', 'Error 2'],
              field2: [{ message: 'Object error', code: 'ERR' }]
            };
            break;
          case 'string':
            errors = {
              field1: 'Simple string error'
            };
            break;
          case 'object':
            errors = {
              field1: { message: 'Object error without array' }
            };
            break;
        }
        
        return {
          isValid: false,
          data: item,
          errors
        };
      };

      const results: any[] = [];
      const stream = validator.validateStream(testData, complexErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      // Check array error conversion
      expect(results[0].errors.field1).toEqual(['Error 1', 'Error 2']);
      expect(results[0].errors.field2).toEqual(['Object error']);
      
      // Check string error conversion
      expect(results[1].errors.field1).toEqual(['Simple string error']);
      
      // Check object error conversion
      expect(results[2].errors.field1).toEqual(['[object Object]']);
    });

    it('should handle null/undefined errors', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [{ id: 1 }];
      
      const nullErrorValidator = (item: any): ValidraResult<any> => ({
        isValid: false,
        data: item
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, nullErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      expect(results[0].errors).toEqual({});
    });
  });

  describe('convertErrors method - additional coverage', () => {
    it('should handle null/undefined errors (line 111)', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [
        { id: 1, errorType: 'null' },
        { id: 2, errorType: 'undefined' }
      ];

      const nullErrorValidator = (item: any): ValidraResult<any> => {
        let errors: any;
        if (item.errorType === 'null') {
          errors = null;
        } else {
          errors = undefined;
        }
        
        return {
          isValid: false,
          data: item,
          errors
        };
      };

      const results: any[] = [];
      const stream = validator.validateStream(testData, nullErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      // Both should result in empty errors object when errors is null/undefined
      expect(results[0].errors).toEqual({});
      expect(results[1].errors).toEqual({});
    });

    it('should handle non-string error objects without message property (line 117)', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [{ id: 1 }];
      
      const complexErrorValidator = (item: any): ValidraResult<any> => ({
        isValid: false,
        data: item,
        errors: {
          field1: [
            { code: 'ERR001', details: 'Some error without message' } as any, // Object without message
            { message: 'Error with message', code: 'ERR002' }, // Object with message
            'String error' as any, // String error
            123 as any, // Number error
            true as any, // Boolean error
            { someProperty: 'value' } as any // Object without message - covers line 117
          ]
        }
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, complexErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      // Verify that errors exist and are converted properly
      expect(results[0].errors).toBeDefined();
      expect(results[0].errors.field1).toBeDefined();
      expect(Array.isArray(results[0].errors.field1)).toBe(true);
      
      // Verify the conversion behavior for the specific cases we want to test
      expect(results[0].errors.field1[0]).toBe('[object Object]'); // Object without message -> String(err)
      expect(results[0].errors.field1[1]).toBe('Error with message'); // Object with message
      expect(results[0].errors.field1[2]).toBe('String error'); // String error
      expect(results[0].errors.field1[3]).toBe('123'); // Number error
      expect(results[0].errors.field1[4]).toBe('true'); // Boolean error
      expect(results[0].errors.field1[5]).toBe('[object Object]'); // Object without message
    });

    it('should handle mixed error types including objects without message', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [{ id: 1 }];
      
      const mixedErrorValidator = (item: any): ValidraResult<any> => ({
        isValid: false,
        data: item,
        errors: {
          field1: [
            { customProperty: 'value' } as any, // Object without message property
            { message: 'Valid message' }, // Object with valid message
            { message: '' }, // Object with empty message
            { otherProp: 123 } as any // Another object without message
          ]
        }
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, mixedErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }
      
      // Verify the conversion behavior
      expect(results[0].errors).toBeDefined();
      expect(results[0].errors.field1).toBeDefined();
      expect(Array.isArray(results[0].errors.field1)).toBe(true);
      
      // Test specific conversions that cover the lines we need
      expect(results[0].errors.field1[0]).toBe('[object Object]'); // No message property -> String(err)
      expect(results[0].errors.field1[1]).toBe('Valid message'); // valid message -> err.message
      // For an object with empty message, err.message || String(err) should return String(err) since '' is falsy
      expect(results[0].errors.field1[2]).toBe('[object Object]'); // empty message -> err.message || String(err) = String(err)
      expect(results[0].errors.field1[3]).toBe('[object Object]'); // Another object without message
    });

    it('should handle null errors to cover line 111', async () => {
      const validator = new ValidraStreamingValidator();
      
      const testData = [{ id: 1 }];
      
      // This validator explicitly returns null errors to test line 111
      const nullErrorValidator = (item: any): ValidraResult<any> => ({
        isValid: false,
        data: item,
        errors: null as any // This should trigger the line 111: if (!errors) return {}
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, nullErrorValidator);

      for await (const result of stream) {
        results.push(result);
      }

      // Should result in empty errors object due to line 111
      expect(results[0].errors).toEqual({});
    });
  });

  describe('Summary statistics with edge cases', () => {
    it('should handle division by zero in averageTimePerItem', async () => {
      const onComplete = vi.fn();
      const validator = new ValidraStreamingValidator({
        onComplete
      });
      
      // Empty data set
      const testData: any[] = [];
      
      const mockValidator = (item: any): ValidraResult<any> => ({
        isValid: true,
        data: item,
        errors: {}
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, mockValidator);

      for await (const result of stream) {
        results.push(result);
      }
      
      // Verify onComplete was called with correct statistics
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          totalProcessed: 0,
          averageTimePerItem: 0
        })
      );
    });

    it('should calculate correct statistics with mixed validation results', async () => {
      const onComplete = vi.fn();
      const validator = new ValidraStreamingValidator({
        onComplete
      });
      
      const testData = [
        { id: 1, valid: true },
        { id: 2, valid: false, errors: { field1: 'error1', field2: 'error2' } },
        { id: 3, valid: false, errors: { field1: 'error1' } },
        { id: 4, valid: true }
      ];
      
      const mockValidator = (item: any): ValidraResult<any> => ({
        isValid: item.valid,
        data: item,
        errors: item.errors || {}
      });

      const results: any[] = [];
      const stream = validator.validateStream(testData, mockValidator);

      for await (const result of stream) {
        results.push(result);
      }

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          totalProcessed: 4,
          totalValid: 2,
          totalInvalid: 2,
          totalErrors: 3, // field1, field2, field1 from the invalid items
          processingTime: expect.any(Number),
          averageTimePerItem: expect.any(Number)
        })
      );
    });
  });

  describe('createArrayStream static method', () => {
    it('should create a generator from array', () => {
      const testArray = [1, 2, 3, 4, 5];
      const stream = ValidraStreamingValidator.createArrayStream(testArray);
      
      const results: number[] = [];
      for (const item of stream) {
        results.push(item);
      }
      
      expect(results).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      const emptyArray: any[] = [];
      const stream = ValidraStreamingValidator.createArrayStream(emptyArray);
      
      const results: any[] = [];
      for (const item of stream) {
        results.push(item);
      }
      
      expect(results).toEqual([]);
    });
  });

  describe('Async iterable support', () => {
    it('should handle async iterables', async () => {
      const validator = new ValidraStreamingValidator();
      
      // Create an async iterable
      async function* asyncGenerator() {
        yield { id: 1, valid: true };
        yield { id: 2, valid: true };
        yield { id: 3, valid: false };
      }
      
      const mockValidator = (item: any): ValidraResult<any> => ({
        isValid: item.valid,
        data: item,
        errors: item.valid ? {} : { field: [{ message: 'Invalid' }] }
      });

      const results: any[] = [];
      const stream = validator.validateStream(asyncGenerator(), mockValidator);

      for await (const result of stream) {
        results.push(result);
      }

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });
});
