import { ValidraResult } from './interfaces';
import {
  StreamingValidationResult,
  StreamingValidationOptions,
  StreamingValidationSummary,
} from './interfaces/streaming-result';

/**
 * Streaming validation for large datasets with constant memory usage
 */
export class ValidraStreamingValidator<T extends Record<string, any>> {
  private readonly onChunkComplete?: (result: StreamingValidationResult<any>) => void;
  private readonly onComplete?: (summary: StreamingValidationSummary) => void;

  constructor(options: StreamingValidationOptions = {}) {
    if (options.onChunkComplete) {
      this.onChunkComplete = options.onChunkComplete;
    }
    if (options.onComplete) {
      this.onComplete = options.onComplete;
    }
  }

  /**
   * Validate a stream of data with generator pattern for memory efficiency
   */
  async *validateStream<TData extends Record<string, any>>(
    dataStream: Iterable<TData> | AsyncIterable<TData>,
    validator: (chunk: TData) => ValidraResult<TData> | Promise<ValidraResult<TData>>,
  ): AsyncGenerator<StreamingValidationResult<TData>, StreamingValidationSummary, unknown> {
    const startTime = performance.now();
    let totalProcessed = 0;
    let totalValid = 0;
    let totalInvalid = 0;
    let totalErrors = 0;

    // For small chunk size or when processing individual items
    let processedCount = 0;

    for await (const item of dataStream) {
      try {
        const validationResult = await validator(item);

        const streamResult: StreamingValidationResult<TData> = {
          chunk: item,
          index: processedCount,
          isValid: validationResult.isValid,
          errors: validationResult.errors ? this.convertErrors(validationResult.errors) : {},
          isComplete: false,
          totalProcessed: processedCount + 1,
        };

        totalProcessed++;
        if (validationResult.isValid) {
          totalValid++;
        } else {
          totalInvalid++;
          if (validationResult.errors) {
            totalErrors += Object.keys(validationResult.errors).length;
          }
        }

        yield streamResult;

        // Call chunk completion callback
        if (this.onChunkComplete) {
          this.onChunkComplete(streamResult);
        }

        processedCount++;
      } catch (error) {
        // Handle validation errors gracefully
        const streamResult: StreamingValidationResult<TData> = {
          chunk: item,
          index: processedCount,
          isValid: false,
          errors: {
            validation: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
          },
          isComplete: false,
          totalProcessed: processedCount + 1,
        };

        totalProcessed++;
        totalInvalid++;
        totalErrors++;

        yield streamResult;
        processedCount++;
      }
    }

    // Create summary
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    const summary: StreamingValidationSummary = {
      totalProcessed,
      totalValid,
      totalInvalid,
      totalErrors,
      processingTime,
      averageTimePerItem: totalProcessed > 0 ? processingTime / totalProcessed : 0,
    };

    // Call completion callback
    if (this.onComplete) {
      this.onComplete(summary);
    }

    return summary;
  }

  /**
   * Convert ValidraResult errors to streaming format
   */
  private convertErrors(errors: any): Record<string, string[]> {
    if (Object.keys(errors).length === 0) {
      return {};
    }

    const converted: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(errors)) {
      if (Array.isArray(value)) {
        converted[key] = value.map((err: any) => (typeof err === 'string' ? err : err.message || String(err)));
      } else {
        converted[key] = [String(value)];
      }
    }
    return converted;
  }

  /**
   * Create an array stream from large arrays with memory-efficient iteration
   */
  static createArrayStream<T>(array: T[]): Generator<T, void, unknown> {
    return (function* () {
      for (const item of array) {
        yield item;
      }
    })();
  }
}
