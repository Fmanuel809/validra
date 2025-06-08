import type { IDataExtractor } from '../interfaces/data-extractor.interface';
import type { IMemoryPoolManager } from '../interfaces/memory-pool-manager.interface';
import type { IRuleCompiler } from '../interfaces/rule-compiler.interface';
import type { IStreamValidator, StreamingValidationOptions } from '../interfaces/validators.interface';
import type { ValidraResult } from '../interfaces/validra-result';

/**
 * StreamValidator handles streaming validation operations
 * Optimized for processing large datasets with memory efficiency
 */
export class StreamValidator implements IStreamValidator {
  constructor(
    private readonly ruleCompiler: IRuleCompiler,
    private readonly dataExtractor: IDataExtractor,
    private readonly memoryPoolManager: IMemoryPoolManager,
  ) {}

  /**
   * Validates a stream of data with generator pattern for memory efficiency
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
