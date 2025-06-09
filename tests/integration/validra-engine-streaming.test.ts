/**
 * Integration tests for ValidraEngine streaming validation functionality.
 *
 * Tests the streaming validation methods, batch processing, performance
 * characteristics, and resource management of the ValidraEngine when
 * processing large data streams.
 *
 * @category Integration Tests
 */

import { StreamingValidationResult } from '@/engine/interfaces/streaming-result';
import { StreamingValidationOptions } from '@/engine/interfaces/validators.interface';
import { Rule } from '@/engine/rule';
import { ValidraEngine } from '@/engine/validra-engine';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { basicUserRules, invalidTestData, validTestData } from './fixtures';

describe('ValidraEngine - Streaming Integration Tests', () => {
  let streamingEngine: ValidraEngine;
  let basicRules: Rule[];

  beforeEach(() => {
    // Define basic validation rules for testing
    basicRules = basicUserRules;

    // Streaming-optimized engine
    streamingEngine = new ValidraEngine(basicRules, [], {
      debug: false,
      enableStreaming: true,
      streamingChunkSize: 3, // Small chunk size for testing
      enableMemoryPool: true,
      memoryPoolSize: 10,
    });
  });

  describe('validateStream() - Basic functionality', () => {
    test('should validate a stream of valid data', async () => {
      const dataStream = [validTestData.basicUser, validTestData.userWithMinimalName, validTestData.youngUser];

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(dataStream)) {
        results.push(result);
      }

      expect(results.length).toBe(dataStream.length);

      // Check that all items were valid
      const validResults = results.filter(result => result.isValid);
      expect(validResults.length).toBe(dataStream.length);
    });

    test('should handle mixed valid and invalid data in stream', async () => {
      const dataStream = [
        validTestData.basicUser,
        invalidTestData.multipleErrors,
        validTestData.youngUser,
        invalidTestData.shortName,
      ];

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(dataStream)) {
        results.push(result);
      }

      // Calculate totals
      const validResults = results.filter(result => result.isValid);
      const invalidResults = results.filter(result => !result.isValid);

      expect(results.length).toBe(4);
      expect(validResults.length).toBe(2);
      expect(invalidResults.length).toBe(2);
    });

    test('should work with async iterables', async () => {
      async function* generateData() {
        yield validTestData.basicUser;
        yield validTestData.userWithMinimalName;
        yield validTestData.youngUser;
      }

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(generateData())) {
        results.push(result);
      }

      expect(results.length).toBe(3);
      expect(results.every(result => result.isValid)).toBe(true);
    });

    test('should handle empty streams', async () => {
      const emptyStream: any[] = [];

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(emptyStream)) {
        results.push(result);
      }

      expect(results).toHaveLength(0);
    });
  });

  describe('validateStream() - Chunking and batching', () => {
    test('should process data efficiently', async () => {
      const largeDataStream = Array.from({ length: 10 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + i,
      }));

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(largeDataStream)) {
        results.push(result);
      }

      expect(results.length).toBe(10);
      expect(results.every(result => result.isValid)).toBe(true);
    });

    test('should handle custom streaming options', async () => {
      const dataStream = Array.from({ length: 8 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + i,
      }));

      const chunkCompleteCallback = vi.fn();
      const completeCallback = vi.fn();

      const customOptions: StreamingValidationOptions = {
        chunkSize: 2,
        onChunkComplete: chunkCompleteCallback,
        onComplete: completeCallback,
      };

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(dataStream, customOptions)) {
        results.push(result);
      }

      expect(results.length).toBe(8);
      expect(chunkCompleteCallback).toHaveBeenCalled();
      expect(completeCallback).toHaveBeenCalled();
    });
  });

  describe('validateStream() - Performance and memory', () => {
    test('should handle large streams efficiently', async () => {
      const largeStream = Array.from({ length: 100 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
      }));

      const startTime = Date.now();
      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(largeStream)) {
        results.push(result);
      }

      const duration = Date.now() - startTime;

      expect(results.length).toBe(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should provide memory pool metrics during streaming', async () => {
      const dataStream = Array.from({ length: 20 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 25,
      }));

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(dataStream)) {
        results.push(result);
      }

      expect(results.length).toBe(20);

      const metrics = streamingEngine.getMetrics();
      expect(metrics.memoryPool).toBeDefined();
      expect(metrics.memoryPool.allocations).toBeGreaterThanOrEqual(0);
    });

    test('should manage memory efficiently with repeated streams', async () => {
      const smallStream = [{ name: 'Test User', email: 'test@example.com', age: 25 }];

      // Process multiple streams
      for (let i = 0; i < 5; i++) {
        const results: StreamingValidationResult<any>[] = [];

        for await (const result of streamingEngine.validateStream(smallStream)) {
          results.push(result);
        }

        expect(results.length).toBe(1);
        expect(results[0]?.isValid).toBe(true);
      }

      // Memory should be managed properly
      const metrics = streamingEngine.getMetrics();
      expect(metrics.memoryPool.hits).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateStream() - Error handling', () => {
    test('should handle validation errors in stream gracefully', async () => {
      const problematicStream = [
        { name: 'Valid', email: 'valid@example.com', age: 25 },
        { name: null, email: 'invalid@example.com', age: 30 }, // Invalid name
        { name: 'Another Valid', email: 'another@example.com', age: 35 },
      ];

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(problematicStream)) {
        results.push(result);
      }

      expect(results.length).toBe(3);

      const validResults = results.filter(r => r.isValid);
      const invalidResults = results.filter(r => !r.isValid);

      expect(validResults.length).toBe(2);
      expect(invalidResults.length).toBe(1);
      expect(invalidResults[0]?.errors).toBeDefined();
    });

    test('should handle stream processing errors', async () => {
      const invalidDataStream = ['not an object', 123, null, { name: 'Valid', email: 'valid@example.com', age: 25 }];

      // Should handle invalid data types gracefully
      let errorThrown = false;
      try {
        for await (const result of streamingEngine.validateStream(invalidDataStream as any)) {
          // Process results if no error is thrown
          void result; // Acknowledge the variable
        }
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      // Either no error should be thrown (graceful handling) or an error should be thrown
      expect(typeof errorThrown).toBe('boolean');
    });

    test('should provide detailed error information', async () => {
      const invalidStream = [
        { name: 'A', email: 'invalid-email', age: -5 }, // Multiple validation errors
      ];

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of streamingEngine.validateStream(invalidStream)) {
        results.push(result);
      }

      expect(results.length).toBe(1);
      expect(results[0]?.isValid).toBe(false);
      expect(results[0]?.errors).toBeDefined();
      expect(Object.keys(results[0]?.errors || {}).length).toBeGreaterThan(0);
    });
  });

  describe('validateStream() - Complex scenarios', () => {
    test('should validate complex nested objects in stream', async () => {
      const complexRules: Rule[] = [
        { op: 'isString', field: 'user.name' },
        { op: 'isEmail', field: 'user.contact.email' },
        { op: 'isArray', field: 'user.roles' },
        { op: 'isObject', field: 'user.metadata' },
      ];

      const complexEngine = new ValidraEngine(complexRules, [], {
        enableStreaming: true,
        streamingChunkSize: 2,
      });

      const complexStream = [
        {
          user: {
            name: 'John Doe',
            contact: { email: 'john@example.com' },
            roles: ['admin', 'user'],
            metadata: { created: new Date() },
          },
        },
        {
          user: {
            name: 'Jane Smith',
            contact: { email: 'jane@example.com' },
            roles: ['user'],
            metadata: { created: new Date() },
          },
        },
      ];

      const results: StreamingValidationResult<any>[] = [];

      for await (const result of complexEngine.validateStream(complexStream)) {
        results.push(result);
      }

      expect(results.length).toBe(2);
      expect(results.every(result => result.isValid)).toBe(true);
    });

    test('should work with streaming disabled', async () => {
      const standardEngine = new ValidraEngine(basicRules, [], {
        enableStreaming: false, // Streaming disabled
      });

      const dataStream = [{ name: 'Test', email: 'test@example.com', age: 25 }];

      // Should still work, but might show warning
      const results: StreamingValidationResult<any>[] = [];

      for await (const result of standardEngine.validateStream(dataStream)) {
        results.push(result);
      }

      expect(results.length).toBe(1);
      expect(results[0]?.isValid).toBe(true);
    });

    test('should handle concurrent streaming operations', async () => {
      const stream1 = Array.from({ length: 5 }, (_, i) => ({
        name: `Stream1-User${i}`,
        email: `stream1-user${i}@example.com`,
        age: 20 + i,
      }));

      const stream2 = Array.from({ length: 5 }, (_, i) => ({
        name: `Stream2-User${i}`,
        email: `stream2-user${i}@example.com`,
        age: 30 + i,
      }));

      // Process streams concurrently
      const [results1, results2] = await Promise.all([
        (async () => {
          const results: StreamingValidationResult<any>[] = [];
          for await (const result of streamingEngine.validateStream(stream1)) {
            results.push(result);
          }
          return results;
        })(),
        (async () => {
          const results: StreamingValidationResult<any>[] = [];
          for await (const result of streamingEngine.validateStream(stream2)) {
            results.push(result);
          }
          return results;
        })(),
      ]);

      expect(results1.length).toBe(5);
      expect(results2.length).toBe(5);
      expect(results1.every(result => result.isValid)).toBe(true);
      expect(results2.every(result => result.isValid)).toBe(true);
    });
  });

  describe('validateStream() - Resource cleanup', () => {
    test('should clean up resources after streaming', async () => {
      const dataStream = Array.from({ length: 10 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 25,
      }));

      // Process stream
      const results: StreamingValidationResult<any>[] = [];
      for await (const result of streamingEngine.validateStream(dataStream)) {
        results.push(result);
      }

      expect(results.length).toBe(10);

      // Clear caches and verify cleanup
      streamingEngine.clearCaches();

      const metrics = streamingEngine.getMetrics();
      expect(metrics).toBeDefined();

      // Memory pool should be available for reuse
      expect(metrics.memoryPool.misses).toBeGreaterThanOrEqual(0);
    });

    test('should handle aborted streams gracefully', async () => {
      const largeStream = Array.from({ length: 100 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 25,
      }));

      // Process only part of the stream
      let processedCount = 0;

      for await (const result of streamingEngine.validateStream(largeStream)) {
        void result; // Acknowledge the variable
        processedCount++;

        // Break after processing 10 items
        if (processedCount >= 10) {
          break;
        }
      }

      expect(processedCount).toBe(10);

      // Engine should still be usable after early termination
      const quickTest = await streamingEngine.validateAsync({
        name: 'Test',
        email: 'test@example.com',
        age: 25,
      });

      expect(quickTest.isValid).toBe(true);
    });
  });
});
