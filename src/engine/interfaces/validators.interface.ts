import { Rule } from '../rule';
import { ValidraResult } from './validra-result';

/**
 * Interface for synchronous validation operations
 *
 * Handles synchronous rule application with performance optimizations
 * for high-frequency validation scenarios.
 */
export interface ISyncValidator {
  /**
   * Applies a single rule synchronously to a value
   *
   * @param rule - The validation rule to apply
   * @param value - The value to validate
   * @param args - Pre-built arguments array for the rule
   * @returns True if validation passes, false otherwise
   */
  applyRule(rule: Rule, value: unknown, args: unknown[]): boolean;

  /**
   * Validates data against multiple rules synchronously
   *
   * @param data - The data object to validate
   * @param rules - Array of validation rules
   * @param options - Validation options (failFast, maxErrors)
   * @returns Validation result with success/failure and errors
   */
  validate<T extends Record<string, any>>(
    data: T,
    rules: Rule[],
    options?: { failFast?: boolean; maxErrors?: number },
  ): ValidraResult<T>;
}

/**
 * Interface for asynchronous validation operations
 *
 * Handles async rule application for operations that may require
 * external resources or async processing.
 */
export interface IAsyncValidator {
  /**
   * Applies a single rule asynchronously to a value
   *
   * @param rule - The validation rule to apply
   * @param value - The value to validate
   * @param args - Pre-built arguments array for the rule
   * @returns Promise that resolves to true if validation passes
   */
  applyRuleAsync(rule: Rule, value: unknown, args: unknown[]): Promise<boolean>;

  /**
   * Validates data against multiple rules asynchronously
   *
   * @param data - The data object to validate
   * @param rules - Array of validation rules
   * @returns Promise that resolves to validation result
   */
  validateAsync<T extends Record<string, any>>(data: T, rules: Rule[]): Promise<ValidraResult<T>>;
}

/**
 * Options for streaming validation
 */
export interface StreamingValidationOptions {
  chunkSize?: number;
  onChunkComplete?: (result: any) => void;
  onComplete?: (summary: any) => void;
}

/**
 * Interface for streaming validation operations
 *
 * Handles validation of large datasets with constant memory usage
 * using generator patterns and streaming processing.
 */
export interface IStreamValidator {
  /**
   * Validates a stream of data with generator pattern for memory efficiency
   *
   * @param dataStream - Iterable or AsyncIterable of data items
   * @param validator - Function to validate individual items
   * @param options - Streaming options
   * @returns AsyncGenerator yielding validation results and summary
   */
  validateStream<T extends Record<string, any>>(
    dataStream: Iterable<T> | AsyncIterable<T>,
    validator: (item: T) => ValidraResult<T> | Promise<ValidraResult<T>>,
    options?: StreamingValidationOptions,
  ): AsyncGenerator<any, any, unknown>;

  /**
   * Validates an array using streaming with memory efficiency
   *
   * @param dataArray - Array of data items to validate
   * @param validator - Function to validate individual items
   * @param options - Streaming options
   * @returns Promise resolving to validation summary or results array
   */
  validateArray<T extends Record<string, any>>(
    dataArray: T[],
    validator: (item: T) => ValidraResult<T>,
    options?: StreamingValidationOptions & { returnSummaryOnly?: boolean },
  ): Promise<any>;
}
