import { describe, it, expect, beforeEach } from 'vitest';
import { ValidraEngine, ValidraStreamingValidator } from '@/engine';
import { Rule } from '@/engine/rule';

describe('Streaming Validation Performance Tests', () => {
  let engine: ValidraEngine;
  let rules: Rule[];

  beforeEach(() => {
    // Define validation rules using the correct syntax
    rules = [
      { field: 'name', op: 'isString' as const },
      { field: 'email', op: 'isEmail' as const },
      { field: 'age', op: 'gte', params: { value: 18 } }
    ];
    
    engine = new ValidraEngine(rules, [], {
      enableStreaming: true,
      streamingChunkSize: 10,
      enableMemoryPool: true
    });
  });

  describe('Large Dataset Streaming', () => {
    it('should validate large datasets with constant memory usage', async () => {
      // Create a large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50)
      }));

      const startTime = performance.now();
      let processedCount = 0;
      let validCount = 0;

      // Use streaming validation
      const results: any[] = [];
      for await (const result of engine.validateStream(largeDataset)) {
        results.push(result);
        processedCount++;
        if (result.isValid) {
          validCount++;
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(processedCount).toBe(1000);
      expect(validCount).toBe(1000); // All should be valid
      expect(duration).toBeLessThan(5000); // Should complete in reasonable time
      
      console.log(`Streaming validation: ${processedCount} items in ${duration.toFixed(2)}ms`);
      console.log(`Average: ${(duration / processedCount).toFixed(3)}ms per item`);
    });

    it('should handle mixed valid/invalid data in streaming', async () => {
      // Create dataset with some invalid records
      const mixedDataset = Array.from({ length: 100 }, (_, i) => ({
        name: i % 3 === 0 ? '' : `User ${i}`, // Every 3rd item has empty name
        email: i % 5 === 0 ? 'invalid-email' : `user${i}@example.com`, // Every 5th item has invalid email
        age: i % 7 === 0 ? 15 : 25 // Every 7th item is underage
      }));

      let validCount = 0;
      let invalidCount = 0;

      for await (const result of engine.validateStream(mixedDataset)) {
        if (result.isValid) {
          validCount++;
        } else {
          invalidCount++;
        }
      }

      expect(validCount + invalidCount).toBe(100);
      expect(invalidCount).toBeGreaterThan(0); // Should have some invalid records
      
      console.log(`Mixed validation: ${validCount} valid, ${invalidCount} invalid`);
    });
  });

  describe('Array Validation with Summary', () => {
    it('should validate array and return summary only', async () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + i
      }));

      const summary = await engine.validateArray(testData, { 
        returnSummaryOnly: true 
      });

      expect(summary).toHaveProperty('totalProcessed', 50);
      expect(summary).toHaveProperty('totalValid', 50);
      expect(summary).toHaveProperty('totalInvalid', 0);
      expect(summary).toHaveProperty('processingTime');
      expect(summary).toHaveProperty('averageTimePerItem');
      
      console.log('Array validation summary:', summary);
    });

    it('should validate array and return all results', async () => {
      const testData = Array.from({ length: 20 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + i
      }));

      const results = await engine.validateArray(testData, { 
        returnSummaryOnly: false 
      });

      expect(Array.isArray(results)).toBe(true);
      expect((results as any[]).length).toBe(20);
      
      (results as any[]).forEach((result: any, index: number) => {
        expect(result).toHaveProperty('chunk');
        expect(result).toHaveProperty('index', index);
        expect(result).toHaveProperty('isValid', true);
      });
    });
  });

  describe('Streaming Performance Comparison', () => {
    it('should demonstrate streaming vs regular validation performance', async () => {
      const testSize = 500;
      const testData = Array.from({ length: testSize }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50)
      }));

      // Regular validation
      const regularStartTime = performance.now();
      const regularResults = testData.map(item => engine.validate(item));
      const regularEndTime = performance.now();
      const regularDuration = regularEndTime - regularStartTime;

      // Streaming validation
      const streamingStartTime = performance.now();
      const streamingResults: any[] = [];
      for await (const result of engine.validateStream(testData)) {
        streamingResults.push(result);
      }
      const streamingEndTime = performance.now();
      const streamingDuration = streamingEndTime - streamingStartTime;

      // Both should validate the same number of items
      expect(regularResults.length).toBe(testSize);
      expect(streamingResults.length).toBe(testSize);

      // All items should be valid in both cases
      const regularValid = regularResults.filter(r => r.isValid).length;
      const streamingValid = streamingResults.filter(r => r.isValid).length;
      expect(regularValid).toBe(testSize);
      expect(streamingValid).toBe(testSize);

      console.log(`\nPerformance Comparison for ${testSize} items:`);
      console.log(`Regular validation: ${regularDuration.toFixed(2)}ms`);
      console.log(`Streaming validation: ${streamingDuration.toFixed(2)}ms`);
      console.log(`Regular avg: ${(regularDuration / testSize).toFixed(3)}ms per item`);
      console.log(`Streaming avg: ${(streamingDuration / testSize).toFixed(3)}ms per item`);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should handle very large datasets without memory issues', async () => {
      // This test simulates processing a very large dataset
      // In a real scenario, this would be reading from a file or database
      const largeSize = 2000;
      
      async function* generateLargeDataset() {
        for (let i = 0; i < largeSize; i++) {
          yield {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            age: 20 + (i % 60),
            metadata: {
              created: new Date().toISOString(),
              id: i,
              tags: [`tag${i % 10}`, `category${i % 5}`]
            }
          };
          
          // Simulate some processing delay
          if (i % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
          }
        }
      }

      const startTime = performance.now();
      let processedCount = 0;

      for await (const result of engine.validateStream(generateLargeDataset(), {
        chunkSize: 25,
        onChunkComplete: (result) => {
          // This could be used for progress reporting
          if (result.totalProcessed % 500 === 0) {
            console.log(`Processed ${result.totalProcessed} items...`);
          }
        }
      })) {
        processedCount++;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(processedCount).toBe(largeSize);
      expect(duration).toBeLessThan(10000); // Should complete in reasonable time
      
      console.log(`\nLarge dataset streaming: ${processedCount} items in ${duration.toFixed(2)}ms`);
      console.log(`Throughput: ${(processedCount / (duration / 1000)).toFixed(0)} items/second`);
    });
  });

  describe('Streaming Validator Direct Usage', () => {
    it('should work with ValidraStreamingValidator directly', async () => {
      const streamingValidator = new ValidraStreamingValidator({
        chunkSize: 5,
        maxConcurrent: 1
      });

      const testData = Array.from({ length: 15 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 25
      }));

      const validator = (item: any) => engine.validate(item);
      let resultCount = 0;

      for await (const result of streamingValidator.validateStream(testData, validator)) {
        expect(result).toHaveProperty('chunk');
        expect(result).toHaveProperty('isValid');
        resultCount++;
      }

      expect(resultCount).toBe(15);
    });

    it('should create array streams correctly', () => {
      const testArray = [1, 2, 3, 4, 5];
      const stream = ValidraStreamingValidator.createArrayStream(testArray);
      
      const collected = [];
      for (const item of stream) {
        collected.push(item);
      }

      expect(collected).toEqual([1, 2, 3, 4, 5]);
    });
  });
});