/**
 * @fileoverview Streaming validation component for processing large datasets with memory efficiency
 * @module StreamValidator
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import type { IDataExtractor } from '../interfaces/data-extractor.interface';
import type { IMemoryPoolManager } from '../interfaces/memory-pool-manager.interface';
import type { IRuleCompiler } from '../interfaces/rule-compiler.interface';
import type { IStreamValidator, StreamingValidationOptions } from '../interfaces/validators.interface';
import type { ValidraResult } from '../interfaces/validra-result';

/**
 * Streaming validator component optimized for processing large datasets with memory efficiency.
 *
 * Handles validation of large data streams using generator patterns and chunked processing
 * to minimize memory usage while maintaining high performance. Supports both synchronous
 * and asynchronous data sources with configurable chunk sizes and progress callbacks.
 *
 * Key features:
 * - **Memory Efficient**: Uses generator patterns to process data in chunks
 * - **Flexible Input**: Supports both Iterable and AsyncIterable data sources
 * - **Progress Tracking**: Provides real-time progress callbacks and statistics
 * - **Error Resilience**: Continues processing even when individual items fail
 * - **Configurable Chunking**: Adjustable chunk sizes for optimal performance
 * - **Resource Management**: Integrates with memory pool for object reuse
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const ruleCompiler = new RuleCompiler();
 * const dataExtractor = new DataExtractor();
 * const memoryPoolManager = new MemoryPoolManager();
 *
 * const streamValidator = new StreamValidator(
 *   ruleCompiler,
 *   dataExtractor,
 *   memoryPoolManager
 * );
 *
 * // Stream validation with progress tracking
 * const dataStream = generateLargeDataset(); // Returns AsyncIterable<User>
 * const validator = (user: User) => validateUser(user);
 *
 * const options: StreamingValidationOptions = {
 *   chunkSize: 500,
 *   onChunkComplete: ({ processed, errors }) => {
 *     console.log(`Processed: ${processed}, Errors: ${errors}`);
 *   },
 *   onComplete: ({ totalProcessed, successRate }) => {
 *     console.log(`Total: ${totalProcessed}, Success: ${successRate}%`);
 *   }
 * };
 *
 * // Process stream
 * for await (const result of streamValidator.validateStream(dataStream, validator, options)) {
 *   if (!result.isValid) {
 *     console.log('Validation failed:', result.errors);
 *   }
 * }
 *
 * // Array validation (converts to stream internally)
 * const users = [...Array(10000)].map(createUser);
 * const arrayResult = await streamValidator.validateArray(users, validator, options);
 * console.log(`Processed ${arrayResult.summary.totalProcessed} users`);
 * ```
 *
 * @see {@link IStreamValidator} Interface definition
 * @see {@link StreamingValidationOptions} Configuration options
 * @see {@link ValidraResult} Validation result structure
 */
export class StreamValidator implements IStreamValidator {
  /**
   * Creates a new StreamValidator instance with required dependencies.
   *
   * Initializes the streaming validator with necessary components for rule compilation,
   * data extraction, and memory management. The validator is designed for high-throughput
   * processing of large datasets with minimal memory footprint.
   *
   * @public
   * @param {IRuleCompiler} ruleCompiler - The rule compiler for processing validation rules
   * @param {IDataExtractor} dataExtractor - The data extractor for accessing nested values
   * @param {IMemoryPoolManager} memoryPoolManager - The memory pool manager for object reuse
   *
   * @example
   * ```typescript
   * const ruleCompiler = new RuleCompiler();
   * const dataExtractor = new DataExtractor();
   * const memoryPoolManager = new MemoryPoolManager({ maxPoolSize: 1000 });
   *
   * const streamValidator = new StreamValidator(
   *   ruleCompiler,
   *   dataExtractor,
   *   memoryPoolManager
   * );
   * ```
   *
   * @since 1.0.0
   */
  constructor(
    private readonly ruleCompiler: IRuleCompiler,
    private readonly dataExtractor: IDataExtractor,
    private readonly memoryPoolManager: IMemoryPoolManager,
  ) {}

  /**
   * Validates a stream of data using generator pattern for optimal memory efficiency.
   *
   * Processes data streams in configurable chunks, yielding validation results
   * incrementally to minimize memory usage. Supports both synchronous and
   * asynchronous data sources with comprehensive progress tracking and error handling.
   *
   * @public
   * @template T - The type of data items being validated
   * @param {Iterable<T> | AsyncIterable<T>} dataStream - The data stream to validate
   * @param {Function} validator - Function to validate individual items
   * @param {StreamingValidationOptions} [options={}] - Streaming configuration options
   * @param {number} [options.chunkSize=100] - Number of items to process per chunk
   * @param {Function} [options.onChunkComplete] - Callback for chunk completion events
   * @param {Function} [options.onComplete] - Callback for stream completion
   * @returns {AsyncGenerator<ValidraResult<T>, any, unknown>} Generator yielding validation results
   *
   * @example
   * ```typescript
   * const streamValidator = new StreamValidator(ruleCompiler, dataExtractor, memoryPool);
   *
   * // Large dataset validation
   * const bigDataset = generateLargeDataset(); // AsyncIterable<User>
   * const userValidator = (user: User) => validateUserRules(user);
   *
   * const options = {
   *   chunkSize: 250,
   *   onChunkComplete: ({ processed, errors, chunkSize }) => {
   *     console.log(`Chunk completed: ${chunkSize} items, ${processed} total, ${errors} errors`);
   *   },
   *   onComplete: ({ totalProcessed, totalErrors, successRate }) => {
   *     console.log(`Stream complete: ${totalProcessed} processed, ${successRate}% success rate`);
   *   }
   * };
   *
   * // Process stream with progress tracking
   * for await (const result of streamValidator.validateStream(bigDataset, userValidator, options)) {
   *   if (result.isValid) {
   *     await processValidUser(result.data);
   *   } else {
   *     await handleValidationErrors(result.errors);
   *   }
   * }
   *
   * // File processing example
   * async function processCSVFile(filePath: string) {
   *   const csvStream = createCSVStream(filePath);
   *   const validator = (row: CSVRow) => validateCSVRow(row);
   *
   *   let validCount = 0;
   *   for await (const result of streamValidator.validateStream(csvStream, validator)) {
   *     if (result.isValid) validCount++;
   *   }
   *
   *   return validCount;
   * }
   * ```
   *
   * @since 1.0.0
   * @see {@link StreamingValidationOptions} Configuration options
   */
  async *validateStream<T extends Record<string, any>>(
    dataStream: Iterable<T> | AsyncIterable<T>,
    validator: (item: T) => ValidraResult<T> | Promise<ValidraResult<T>>,
    options: StreamingValidationOptions = {},
  ): AsyncGenerator<any, any, unknown> {
    const { chunkSize = 100, onChunkComplete, onComplete } = options;

    let processedCount = 0;
    let errorCount = 0;
    const results: any[] = [];

    // Handle both sync and async iterables
    const asyncIterable = this.ensureAsyncIterable(dataStream);

    let chunk: T[] = [];

    for await (const item of asyncIterable) {
      chunk.push(item);

      // Process chunk when it reaches the specified size
      if (chunk.length >= chunkSize) {
        const chunkResults = await this.processChunk(chunk, validator);

        for (const result of chunkResults) {
          processedCount++;
          if (!result.isValid) {
            errorCount++;
          }
          results.push(result);
          yield result;
        }

        // Notify chunk completion
        onChunkComplete?.({
          processed: processedCount,
          errors: errorCount,
          chunkSize: chunk.length,
        });

        // Reset chunk
        chunk = [];
      }
    }

    // Process remaining items in the last chunk
    if (chunk.length > 0) {
      const chunkResults = await this.processChunk(chunk, validator);

      for (const result of chunkResults) {
        processedCount++;
        if (!result.isValid) {
          errorCount++;
        }
        results.push(result);
        yield result;
      }

      // Notify chunk completion
      onChunkComplete?.({
        processed: processedCount,
        errors: errorCount,
        chunkSize: chunk.length,
      });
    }

    // Final completion notification
    onComplete?.({
      totalProcessed: processedCount,
      totalErrors: errorCount,
      successRate: processedCount > 0 ? ((processedCount - errorCount) / processedCount) * 100 : 0,
    });

    return {
      totalProcessed: processedCount,
      totalErrors: errorCount,
      results,
    };
  }

  /**
   * Validates an array using streaming with memory efficiency
   */
  async validateArray<T extends Record<string, any>>(
    dataArray: T[],
    validator: (item: T) => ValidraResult<T> | Promise<ValidraResult<T>>,
    options: StreamingValidationOptions = {},
  ): Promise<any> {
    const results: ValidraResult<T>[] = [];

    // Use the streaming generator to process the array
    for await (const result of this.validateStream(dataArray, validator, options)) {
      if (result.totalProcessed !== undefined) {
        // This is the final summary
        return {
          summary: result,
          results,
        };
      } else {
        // This is an individual result
        results.push(result);
      }
    }

    return {
      summary: {
        totalProcessed: results.length,
        totalErrors: results.filter(r => !r.isValid).length,
        successRate: results.length > 0 ? (results.filter(r => r.isValid).length / results.length) * 100 : 0,
      },
      results,
    };
  }

  /**
   * Processes a chunk of data items
   */
  private async processChunk<T extends Record<string, any>>(
    chunk: T[],
    validator: (item: T) => ValidraResult<T> | Promise<ValidraResult<T>>,
  ): Promise<ValidraResult<T>[]> {
    const results: ValidraResult<T>[] = [];

    for (const item of chunk) {
      try {
        const result = await Promise.resolve(validator(item));
        results.push(result);
      } catch (error) {
        // Create error result
        results.push({
          data: item,
          isValid: false,
          message: error instanceof Error ? error.message : 'Validation error',
        });
      }
    }

    return results;
  }

  /**
   * Ensures the data stream is async iterable
   */
  private async *ensureAsyncIterable<T>(iterable: Iterable<T> | AsyncIterable<T>): AsyncIterable<T> {
    if (Symbol.asyncIterator in iterable) {
      // Already async iterable
      yield* iterable as AsyncIterable<T>;
    } else {
      // Convert sync iterable to async
      for (const item of iterable as Iterable<T>) {
        yield item;
      }
    }
  }
}
