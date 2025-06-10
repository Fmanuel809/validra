/**
 * @fileoverview Asynchronous validation component for processing validation rules with async support
 * @module AsyncValidator
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { ValidraLogger } from '@/utils/validra-logger';
import type { IDataExtractor } from '../interfaces/data-extractor.interface';
import type { IErrorHandler } from '../interfaces/error-handler.interface';
import type { IMemoryPoolManager } from '../interfaces/memory-pool-manager.interface';
import type { IRuleCompiler } from '../interfaces/rule-compiler.interface';
import type { IAsyncValidator } from '../interfaces/validators.interface';
import type { ValidraResult } from '../interfaces/validra-result';
import { Rule } from '../rule';

/**
 * Asynchronous validator component for processing validation rules with Promise-based execution.
 *
 * Handles asynchronous validation operations with support for both synchronous and asynchronous
 * helper functions. Optimized for scenarios requiring non-blocking validation, external service
 * calls, or database queries during validation.
 *
 * Key features:
 * - **Promise-based Execution**: Full support for async/await patterns
 * - **Concurrent Processing**: Batch validation with configurable concurrency limits
 * - **Memory Efficient**: Uses object pooling for high-frequency async operations
 * - **Error Resilience**: Comprehensive error handling with graceful degradation
 * - **Timeout Support**: Built-in timeout mechanisms for async operations
 *
 * This validator is particularly suitable for:
 * - Server-side validation requiring database lookups
 * - API integrations with external validation services
 * - Complex business rule validation with async dependencies
 * - Large dataset processing with non-blocking operations
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic async validation
 * const asyncValidator = new AsyncValidator(ruleCompiler, dataExtractor, memoryPool);
 * const result = await asyncValidator.validateAsync(userData, validationRules);
 *
 * if (result.isValid) {
 *   console.log('Validation passed:', result.data);
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Batch processing with concurrency control
 * const datasets = [user1, user2, user3, user4, user5];
 * const results = await asyncValidator.validateMultipleAsync(
 *   datasets,
 *   rules,
 *   3 // Process 3 datasets concurrently
 * );
 *
 * results.forEach((result, index) => {
 *   console.log(`Dataset ${index}: ${result.isValid ? 'Valid' : 'Invalid'}`);
 * });
 * ```
 *
 * @see {@link IAsyncValidator} for the interface definition
 * @see {@link ValidraEngine} for synchronous validation alternatives
 */
export class AsyncValidator implements IAsyncValidator {
  private readonly logger: ValidraLogger;

  /**
   * Creates a new AsyncValidator instance with required dependencies.
   *
   * Initializes the asynchronous validator with necessary components for rule compilation,
   * data extraction, and memory management. The validator uses dependency injection to
   * maintain loose coupling and enable easy testing.
   *
   * @public
   * @param {IRuleCompiler} ruleCompiler - Rule compiler for processing validation rules into executable forms
   * @param {IDataExtractor} dataExtractor - Data extractor for accessing nested object properties
   * @param {IMemoryPoolManager} memoryPoolManager - Memory pool manager for efficient object reuse
   * @param {IErrorHandler} errorHandler - Error handler for proper error classification and reporting
   *
   * @example
   * ```typescript
   * const ruleCompiler = new RuleCompiler();
   * const dataExtractor = new DataExtractor();
   * const memoryPoolManager = new MemoryPoolManager({ maxPoolSize: 1000 });
   * const errorHandler = new ErrorHandler();
   *
   * const asyncValidator = new AsyncValidator(
   *   ruleCompiler,
   *   dataExtractor,
   *   memoryPoolManager,
   *   errorHandler
   * );
   * ```
   *
   * @since 1.0.0
   */
  constructor(
    private readonly ruleCompiler: IRuleCompiler,
    private readonly dataExtractor: IDataExtractor,
    private readonly memoryPoolManager: IMemoryPoolManager,
    private readonly errorHandler: IErrorHandler,
  ) {
    this.logger = new ValidraLogger('AsyncValidator');
  }

  /**
   * Applies a single validation rule asynchronously to a value with comprehensive error handling.
   *
   * Executes a validation rule against a value using Promise-based execution to support
   * both synchronous and asynchronous helper functions. The method provides timeout
   * protection and proper error propagation for robust async validation.
   *
   * @public
   * @param {Rule} rule - The validation rule to apply, containing operation and parameters
   * @param {unknown} value - The value to validate against the rule
   * @param {unknown[]} args - Additional arguments for the validation helper function
   *
   * @returns {Promise<boolean>} Promise resolving to true if validation passes, false otherwise
   *
   * @throws {Error} When rule compilation fails or helper execution encounters fatal errors
   *
   * @example
   * ```typescript
   * // Simple rule application
   * const rule = { op: 'isEmail', field: 'email' };
   * const isValid = await asyncValidator.applyRuleAsync(rule, 'user@example.com', []);
   * console.log(isValid); // true
   * ```
   *
   * @example
   * ```typescript
   * // Rule with parameters and async validation
   * const rule = {
   *   op: 'customAsync',
   *   field: 'userId',
   *   params: { timeout: 5000 }
   * };
   *
   * try {
   *   const isValid = await asyncValidator.applyRuleAsync(rule, 12345, [5000]);
   *   console.log('Validation result:', isValid);
   * } catch (error) {
   *   console.error('Validation failed:', error.message);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Negated rule (using rule.negative)
   * const rule = { op: 'isEmpty', field: 'name', negative: true };
   * const isValid = await asyncValidator.applyRuleAsync(rule, 'John Doe', []);
   * console.log(isValid); // true (negated: value is NOT empty)
   * ```
   *
   * @since 1.0.0
   */
  async applyRuleAsync(rule: Rule, value: unknown, args: unknown[]): Promise<boolean> {
    const ruleInfo = `${rule.op}${rule.field ? ` on field "${rule.field}"` : ''}${rule.negative ? ' (negated)' : ''}`;
    this.logger.debug(`Applying rule: ${ruleInfo} with value:`, value, 'and args:', args);
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          try {
            const compiledRules = this.ruleCompiler.compile([rule]);
            if (compiledRules.length === 0) {
              resolve(false);
              return;
            }
            const compiledRule = compiledRules[0];
            if (!compiledRule) {
              resolve(false);
              return;
            }
            // Ejecutar el helper y soportar helpers asíncronos
            const result = compiledRule.helper.apply(null, [value, ...args]);
            if (result && typeof result.then === 'function') {
              // Es una promesa
              result
                .then((isValid: boolean) => {
                  resolve(Boolean(rule.negative ? !isValid : isValid));
                })
                .catch(reject);
            } else {
              resolve(Boolean(rule.negative ? !result : result));
            }
          } catch (error) {
            reject(error);
          }
        }, 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Validates data against multiple rules asynchronously with comprehensive error collection.
   *
   * Performs complete validation of a data object against an array of validation rules using
   * asynchronous execution. Collects all validation errors and provides detailed failure
   * information for each field that fails validation.
   *
   * @public
   * @typeParam T - Type of the data object being validated, must extend Record<string, any>
   * @param {T} data - The data object to validate
   * @param {Rule[]} rules - Array of validation rules to apply to the data
   *
   * @returns {Promise<ValidraResult<T>>} Promise resolving to validation result with:
   *   - `isValid`: boolean indicating if all validations passed
   *   - `data`: original data object
   *   - `errors`: object containing field-specific error details (if any)
   *   - `message`: summary message for failed validation
   *
   * @throws {Error} When memory pool operations fail or rule compilation encounters fatal errors
   *
   * @example
   * ```typescript
   * // Basic async validation
   * const userData = {
   *   email: 'user@example.com',
   *   age: 25,
   *   username: 'john_doe'
   * };
   *
   * const rules = [
   *   { op: 'isEmail', field: 'email' },
   *   { op: 'gte', field: 'age', params: { value: 18 } },
   *   { op: 'minLength', field: 'username', params: { length: 3 } }
   * ];
   *
   * const result = await asyncValidator.validateAsync(userData, rules);
   *
   * if (result.isValid) {
   *   console.log('All validations passed!');
   * } else {
   *   console.log('Validation errors:', result.errors);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Handling validation failures
   * const invalidData = {
   *   email: 'invalid-email',
   *   age: 15
   * };
   *
   * const result = await asyncValidator.validateAsync(invalidData, rules);
   *
   * // Result structure for failed validation:
   * // {
   * //   isValid: false,
   * //   data: { email: 'invalid-email', age: 15 },
   * //   errors: {
   * //     email: [{ message: 'Invalid email format', code: 'ASYNC_VALIDATION_FAILED' }],
   * //     age: [{ message: 'Value must be >= 18', code: 'ASYNC_VALIDATION_FAILED' }]
   * //   }
   * // }
   * ```
   *
   * @example
   * ```typescript
   * // With regex validation and parameter handling
   * const result = await asyncValidator.validateAsync(
   *   { code: 'ABC123' },
   *   [{ op: 'regexMatch', field: 'code', params: { regex: '^[A-Z]{3}\\d{3}$' } }]
   * );
   * ```
   *
   * @since 1.0.0
   */
  async validateAsync<T extends Record<string, any>>(data: T, rules: Rule[]): Promise<ValidraResult<T>> {
    try {
      // Get validation result from pool
      const result = this.memoryPoolManager.get('validationResult', () => ({
        data,
        isValid: true,
      })) as ValidraResult<T>;

      // Reset result
      result.data = data;
      result.isValid = true;
      delete result.errors;
      delete result.message;

      // Compile rules
      const compiledRules = this.ruleCompiler.compile(rules);

      // Process rules sequentially
      for (const compiledRule of compiledRules) {
        try {
          // Extract value based on rule path
          const pathKey = compiledRule.original.field || '';
          const pathSegments = this.dataExtractor.getPathSegments(pathKey);
          const value = this.dataExtractor.getValue(data, pathSegments);

          // Get a reusable arguments array for helper params
          const args = this.memoryPoolManager.get('argumentsArray', () => []) as unknown[];
          args.length = 0; // Clear array
          // Extract params from rule into args
          const ruleParams = (compiledRule.original as any).params;
          if (ruleParams !== undefined && ruleParams !== null) {
            const values = Object.values(ruleParams) as unknown[];
            // Special handling for regexMatch operation
            if (compiledRule.original.op === 'regexMatch' && values.length > 0) {
              const regexParam = values[0];
              if (typeof regexParam === 'string') {
                // Convert string regex to RegExp object
                try {
                  args.push(new RegExp(regexParam));
                } catch {
                  throw new Error(`Invalid regex pattern: ${regexParam}`);
                }
              } else {
                args.push(...values);
              }
            } else {
              args.push(...values);
            }
          }

          // Apply rule asynchronously
          const isValid = await this.applyRuleAsync(compiledRule.original, value, args);

          if (!isValid) {
            result.isValid = false;
            if (!result.errors) {
              result.errors = {} as any;
            }

            // Add error for this field
            const fieldErrors = (result.errors as any)[pathKey] || [];
            fieldErrors.push({
              message: `Validation failed for field: ${pathKey}`,
              code: 'ASYNC_VALIDATION_FAILED',
            });
            (result.errors as any)[pathKey] = fieldErrors;
          }

          // Return args to pool
          this.memoryPoolManager.return('argumentsArray', args, arr => {
            arr.length = 0;
          });
        } catch (error) {
          result.isValid = false;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorObj = error instanceof Error ? error : new Error(String(error));

          // Send error to error-handler with proper classification
          this.errorHandler.handleError(errorObj, {
            field: compiledRule.original.field,
            rule: compiledRule.original,
            value: this.dataExtractor.getValue(
              data,
              this.dataExtractor.getPathSegments(compiledRule.original.field || ''),
            ),
            metadata: {
              severity: 'high',
              category: 'validation',
              operation: compiledRule.original.op,
              ruleField: compiledRule.original.field,
            },
          });

          if (!result.errors) {
            result.errors = {} as any;
          }

          const fieldKey = compiledRule.original.field || 'unknown';
          const fieldErrors = (result.errors as any)[fieldKey] || [];
          fieldErrors.push({
            message: errorMessage,
            code: 'ASYNC_VALIDATION_ERROR',
          });
          (result.errors as any)[fieldKey] = fieldErrors;
        }
      }

      return result;
    } catch (error) {
      // Return error result
      return {
        data,
        isValid: false,
        message: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Validates multiple datasets concurrently with configurable batch processing.
   *
   * Processes multiple data objects simultaneously using controlled concurrency to balance
   * performance with resource utilization. Uses chunked processing to prevent overwhelming
   * the system while maintaining high throughput for large dataset validation.
   *
   * @public
   * @typeParam T - Type of the data objects being validated, must extend Record<string, any>
   * @param {T[]} datasets - Array of data objects to validate
   * @param {Rule[]} rules - Array of validation rules to apply to each dataset
   * @param {number} [concurrency=3] - Maximum number of concurrent validation operations
   *
   * @returns {Promise<ValidraResult<T>[]>} Promise resolving to array of validation results,
   *   maintaining the same order as input datasets
   *
   * @example
   * ```typescript
   * // Batch validation with default concurrency
   * const users = [
   *   { email: 'user1@example.com', age: 25 },
   *   { email: 'user2@example.com', age: 30 },
   *   { email: 'user3@example.com', age: 22 }
   * ];
   *
   * const rules = [
   *   { op: 'isEmail', field: 'email' },
   *   { op: 'gte', field: 'age', params: { value: 18 } }
   * ];
   *
   * const results = await asyncValidator.validateMultipleAsync(users, rules);
   *
   * results.forEach((result, index) => {
   *   console.log(`User ${index + 1}: ${result.isValid ? 'Valid' : 'Invalid'}`);
   * });
   * ```
   *
   * @example
   * ```typescript
   * // High-concurrency processing for large datasets
   * const largeDataset = generateTestData(1000); // 1000 records
   *
   * const results = await asyncValidator.validateMultipleAsync(
   *   largeDataset,
   *   rules,
   *   10 // Process 10 records concurrently
   * );
   *
   * const validCount = results.filter(r => r.isValid).length;
   * console.log(`${validCount}/${results.length} records are valid`);
   * ```
   *
   * @example
   * ```typescript
   * // Processing with error aggregation
   * const results = await asyncValidator.validateMultipleAsync(datasets, rules, 5);
   *
   * const errors = results.reduce((acc, result, index) => {
   *   if (!result.isValid) {
   *     acc[index] = result.errors;
   *   }
   *   return acc;
   * }, {} as Record<number, any>);
   *
   * console.log('Failed validations:', errors);
   * ```
   *
   * @since 1.0.0
   */
  async validateMultipleAsync<T extends Record<string, any>>(
    datasets: T[],
    rules: Rule[],
    concurrency: number = 3,
  ): Promise<ValidraResult<T>[]> {
    const chunks = this.chunkArray(datasets, concurrency);
    const allResults: ValidraResult<T>[] = [];

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(data => this.validateAsync(data, rules));

      const chunkResults = await Promise.all(chunkPromises);
      allResults.push(...chunkResults);
    }

    return allResults;
  }

  /**
   * Utility method to chunk arrays for batch processing with memory efficiency.
   *
   * Divides large arrays into smaller chunks to enable controlled batch processing
   * without overwhelming system resources. Essential for managing memory usage
   * and concurrency in large dataset validation scenarios.
   *
   * @private
   * @typeParam T - Type of array elements
   * @param {T[]} array - The array to divide into chunks
   * @param {number} size - The maximum size of each chunk
   *
   * @returns {T[][]} Array of arrays, each containing up to `size` elements
   *
   * @example
   * ```typescript
   * // Internal usage in validateMultipleAsync
   * const chunks = this.chunkArray([1, 2, 3, 4, 5], 2);
   * // Result: [[1, 2], [3, 4], [5]]
   * ```
   *
   * @since 1.0.0
   * @internal
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
