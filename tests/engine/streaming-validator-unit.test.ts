import { describe, it, expect, beforeEach } from 'vitest';
import { ValidraStreamingValidator } from '@/engine/streaming-validator';
import { ValidraResult } from '@/engine/interfaces';

describe('ValidraStreamingValidator', () => {
  let validator: ValidraStreamingValidator<any>;
  let mockValidationFunction: (item: any) => ValidraResult<any>;

  beforeEach(() => {
    validator = new ValidraStreamingValidator();

    // Mock validation function
    mockValidationFunction = (item: any): ValidraResult<any> => {
      const isValid = item.valid !== false;
      return {
        isValid,
        data: item,
        errors: isValid ? {} : { validation: [{ message: 'Validation failed', code: 'INVALID' }] }
      };
    };
  });

  describe('Constructor', () => {
    it('should create validator with default options', () => {
      const defaultValidator = new ValidraStreamingValidator();
      expect(defaultValidator).toBeInstanceOf(ValidraStreamingValidator);
    });

    it('should create validator with custom options', () => {
      const customValidator = new ValidraStreamingValidator({
        onChunkComplete: () => {},
        onComplete: () => {}
      });
      expect(customValidator).toBeInstanceOf(ValidraStreamingValidator);
    });
  });

  describe('validateStream() method', () => {
    it('should validate array stream successfully', async () => {
      const testData = [
        { id: 1, name: 'Item 1', valid: true },
        { id: 2, name: 'Item 2', valid: true },
        { id: 3, name: 'Item 3', valid: true }
      ];

      const results: any[] = [];
      let summary: any = null;

      const generator = validator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      summary = result.value;

      expect(results).toHaveLength(3);
      expect(summary).toHaveProperty('totalProcessed', 3);
      expect(summary).toHaveProperty('totalValid', 3);
      expect(summary).toHaveProperty('totalInvalid', 0);
      expect(summary).toHaveProperty('processingTime');
      expect(summary.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle mixed valid/invalid data', async () => {
      const testData = [
        { id: 1, name: 'Valid Item', valid: true },
        { id: 2, name: 'Invalid Item', valid: false },
        { id: 3, name: 'Another Valid Item', valid: true },
        { id: 4, name: 'Another Invalid Item', valid: false }
      ];

      const results: any[] = [];
      let summary: any = null;

      const generator = validator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      summary = result.value;

      expect(results).toHaveLength(4);
      expect(summary.totalProcessed).toBe(4);
      expect(summary.totalValid).toBe(2);
      expect(summary.totalInvalid).toBe(2);
      expect(summary.totalErrors).toBe(2);

      // Check individual results
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
      expect(results[3].isValid).toBe(false);
    });

    it('should handle validation errors gracefully', async () => {
      const errorValidationFunction = (item: any): ValidraResult<any> => {
        if (item.throwError) {
          throw new Error('Validation error occurred');
        }
        return { isValid: true, data: item };
      };

      const testData = [
        { id: 1, name: 'Valid Item' },
        { id: 2, name: 'Error Item', throwError: true },
        { id: 3, name: 'Another Valid Item' }
      ];

      const results: any[] = [];
      let summary: any = null;

      const generator = validator.validateStream(testData, errorValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      summary = result.value;

      expect(results).toHaveLength(3);
      expect(results[1].isValid).toBe(false);
      expect(results[1].errors.validation).toContain('Validation error: Validation error occurred');
      expect(summary.totalInvalid).toBe(1);
      expect(summary.totalErrors).toBe(1);
    });

    it('should provide correct index and metadata', async () => {
      const testData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];

      const results: any[] = [];
      const generator = validator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      results.forEach((streamResult, index) => {
        expect(streamResult.index).toBe(index);
        expect(streamResult.chunk).toEqual(testData[index]);
        expect(streamResult.isComplete).toBe(false);
        expect(streamResult.totalProcessed).toBe(index + 1);
      });
    });

    it('should handle empty stream', async () => {
      const testData: any[] = [];

      const results: any[] = [];
      let summary: any = null;

      const generator = validator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      summary = result.value;

      expect(results).toHaveLength(0);
      expect(summary.totalProcessed).toBe(0);
      expect(summary.totalValid).toBe(0);
      expect(summary.totalInvalid).toBe(0);
    });

    it('should handle async validation function', async () => {
      const asyncValidationFunction = async (item: any): Promise<ValidraResult<any>> => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1));
        return mockValidationFunction(item);
      };

      const testData = [
        { id: 1, name: 'Item 1', valid: true },
        { id: 2, name: 'Item 2', valid: false }
      ];

      const results: any[] = [];
      let summary: any = null;

      const generator = validator.validateStream(testData, asyncValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      summary = result.value;

      expect(results).toHaveLength(2);
      expect(summary.totalProcessed).toBe(2);
      expect(summary.totalValid).toBe(1);
      expect(summary.totalInvalid).toBe(1);
    });
  });

  describe('createArrayStream() static method', () => {
    it('should create a generator from array', () => {
      const testArray = [1, 2, 3, 4, 5];
      const stream = ValidraStreamingValidator.createArrayStream(testArray);

      const collected: any[] = [];
      for (const item of stream) {
        collected.push(item);
      }

      expect(collected).toEqual(testArray);
    });

    it('should create generator for empty array', () => {
      const emptyArray: any[] = [];
      const stream = ValidraStreamingValidator.createArrayStream(emptyArray);

      const collected: any[] = [];
      for (const item of stream) {
        collected.push(item);
      }

      expect(collected).toEqual([]);
    });

    it('should create generator for complex objects', () => {
      const complexArray = [
        { id: 1, data: { nested: 'value1' } },
        { id: 2, data: { nested: 'value2' } },
        { id: 3, data: { nested: 'value3' } }
      ];
      const stream = ValidraStreamingValidator.createArrayStream(complexArray);

      const collected: any[] = [];
      for (const item of stream) {
        collected.push(item);
      }

      expect(collected).toEqual(complexArray);
      expect(collected[0]).toBe(complexArray[0]); // Same reference
    });
  });

  describe('Error conversion', () => {
    it('should convert ValidraResult errors to streaming format', async () => {
      const complexErrorValidation = (item: any): ValidraResult<any> => {
        return {
          isValid: false,
          data: item,
          errors: {
            field1: [
              { message: 'Error 1', code: 'ERR1' },
              { message: 'Error 2', code: 'ERR2' }
            ],
            field2: [
              { message: 'Error 3' }
            ]
          }
        };
      };

      const testData = [{ id: 1, name: 'Test Item' }];

      const results: any[] = [];
      const generator = validator.validateStream(testData, complexErrorValidation);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      const streamResult = results[0];
      expect(streamResult.errors.field1).toEqual(['Error 1', 'Error 2']);
      expect(streamResult.errors.field2).toEqual(['Error 3']);
    });

    it('should handle non-array errors', async () => {
      const stringErrorValidation = (item: any): ValidraResult<any> => {
        return {
          isValid: false,
          data: item,
          errors: {
            field1: [{ message: 'Simple string error' }],
            field2: [{ message: 'Object error' }]
          }
        };
      };

      const testData = [{ id: 1, name: 'Test Item' }];

      const results: any[] = [];
      const generator = validator.validateStream(testData, stringErrorValidation);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      const streamResult = results[0];
      expect(streamResult.errors.field1).toEqual(['Simple string error']);
      expect(streamResult.errors.field2).toEqual(['Object error']);
    });
  });

  describe('Callback integration', () => {
    it('should call onChunkComplete callback', async () => {
      const onChunkCompleteCalls: any[] = [];
      const callbackValidator = new ValidraStreamingValidator({
        onChunkComplete: (result) => {
          onChunkCompleteCalls.push(result);
        }
      });

      const testData = [
        { id: 1, valid: true },
        { id: 2, valid: true }
      ];

      const generator = callbackValidator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        result = await generator.next();
      }

      expect(onChunkCompleteCalls).toHaveLength(2);
      expect(onChunkCompleteCalls[0].chunk).toEqual(testData[0]);
      expect(onChunkCompleteCalls[1].chunk).toEqual(testData[1]);
    });

    it('should call onComplete callback', async () => {
      let completionSummary: any = null;
      const callbackValidator = new ValidraStreamingValidator({
        onComplete: (summary) => {
          completionSummary = summary;
        }
      });

      const testData = [{ id: 1, valid: true }];

      const generator = callbackValidator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        result = await generator.next();
      }

      expect(completionSummary).not.toBeNull();
      expect(completionSummary.totalProcessed).toBe(1);
      expect(completionSummary.totalValid).toBe(1);
    });
  });

  describe('Performance metrics', () => {
    it('should calculate average time per item', async () => {
      const testData = Array.from({ length: 10 }, (_, i) => ({ id: i, valid: true }));

      const results: any[] = [];
      let summary: any = null;

      const generator = validator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        results.push(result.value);
        result = await generator.next();
      }

      summary = result.value;

      expect(summary.averageTimePerItem).toBeGreaterThanOrEqual(0);
      expect(summary.averageTimePerItem).toBe(summary.processingTime / summary.totalProcessed);
    });

    it('should handle zero items for average calculation', async () => {
      const testData: any[] = [];

      const generator = validator.validateStream(testData, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        result = await generator.next();
      }

      const summary = result.value;
      expect(summary.averageTimePerItem).toBe(0);
    });
  });

  describe('Large dataset handling', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        valid: i % 10 !== 0 // 10% invalid
      }));

      let processedCount = 0;
      let validCount = 0;
      let invalidCount = 0;

      const generator = validator.validateStream(largeDataset, mockValidationFunction);
      let result = await generator.next();

      while (!result.done) {
        const streamResult = result.value;
        processedCount++;
        if (streamResult.isValid) {
          validCount++;
        } else {
          invalidCount++;
        }
        result = await generator.next();
      }

      const summary = result.value;

      expect(processedCount).toBe(1000);
      expect(validCount).toBe(900); // 90% valid
      expect(invalidCount).toBe(100); // 10% invalid
      expect(summary.totalProcessed).toBe(1000);
      expect(summary.totalValid).toBe(900);
      expect(summary.totalInvalid).toBe(100);
    });
  });
});
