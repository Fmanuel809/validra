import { Rule } from '../rule';
import { ValidraResult } from './validra-result';

/**
 * Synchronous validator interface for Validra.
 *
 * Provides methods for applying rules and validating data synchronously, optimized for high-frequency scenarios.
 *
 * @example
 * const isValid = syncValidator.applyRule(rule, value, args);
 * const result = syncValidator.validate(data, rules, { failFast: true });
 */
export interface ISyncValidator {
  /**
   * Apply a single rule synchronously to a value.
   *
   * @param rule - The validation rule to apply.
   * @param value - The value to validate.
   * @param args - Arguments for the rule.
   * @returns True if validation passes, false otherwise.
   */
  applyRule(rule: Rule, value: unknown, args: unknown[]): boolean;

  /**
   * Validate data against multiple rules synchronously.
   *
   * @param data - The data object to validate.
   * @param rules - Array of validation rules.
   * @param options - Validation options (failFast, maxErrors).
   * @returns Validation result with success/failure and errors.
   */
  validate<T extends Record<string, any>>(
    data: T,
    rules: Rule[],
    options?: { failFast?: boolean; maxErrors?: number },
  ): ValidraResult<T>;
}

/**
 * Asynchronous validator interface for Validra.
 *
 * Provides methods for applying rules and validating data asynchronously, supporting async workflows.
 *
 * @example
 * const isValid = await asyncValidator.applyRuleAsync(rule, value, args);
 * const result = await asyncValidator.validateAsync(data, rules);
 */
export interface IAsyncValidator {
  /**
   * Apply a single rule asynchronously to a value.
   *
   * @param rule - The validation rule to apply.
   * @param value - The value to validate.
   * @param args - Arguments for the rule.
   * @returns Promise resolving to true if validation passes.
   */
  applyRuleAsync(rule: Rule, value: unknown, args: unknown[]): Promise<boolean>;

  /**
   * Validate data against multiple rules asynchronously.
   *
   * @param data - The data object to validate.
   * @param rules - Array of validation rules.
   * @returns Promise resolving to validation result.
   */
  validateAsync<T extends Record<string, any>>(data: T, rules: Rule[]): Promise<ValidraResult<T>>;
}

/**
 * Options for streaming validation in Validra.
 *
 * @property chunkSize - Number of items per chunk.
 * @property onChunkComplete - Callback for each chunk result.
 * @property onComplete - Callback for final summary.
 */
export interface StreamingValidationOptions {
  chunkSize?: number;
  onChunkComplete?: (result: any) => void;
  onComplete?: (summary: any) => void;
}

/**
 * Streaming validator interface for Validra.
 *
 * Provides methods for validating large datasets with constant memory usage using generator patterns.
 *
 * @example
 * for await (const result of streamValidator.validateStream(dataStream, validator)) {
 *   // handle result
 * }
 */
export interface IStreamValidator {
  /**
   * Validate a stream of data with generator pattern for memory efficiency.
   *
   * @param dataStream - Iterable or AsyncIterable of data items.
   * @param validator - Function to validate individual items.
   * @param options - Streaming options.
   * @returns AsyncGenerator yielding validation results and summary.
   */
  validateStream<T extends Record<string, any>>(
    dataStream: Iterable<T> | AsyncIterable<T>,
    validator: (item: T) => ValidraResult<T> | Promise<ValidraResult<T>>,
    options?: StreamingValidationOptions,
  ): AsyncGenerator<any, any, unknown>;

  /**
   * Validate an array using streaming with memory efficiency.
   *
   * @param dataArray - Array of data items to validate.
   * @param validator - Function to validate individual items.
   * @param options - Streaming options.
   * @returns Promise resolving to validation summary or results array.
   */
  validateArray<T extends Record<string, any>>(
    dataArray: T[],
    validator: (item: T) => ValidraResult<T> | Promise<ValidraResult<T>>,
    options?: StreamingValidationOptions,
  ): Promise<any>;
}
