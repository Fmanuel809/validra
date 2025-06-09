/**
 * @fileoverview Synchronous validator component for the Validra validation engine
 * @module SyncValidator
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { helpersActions } from '@/dsl';
import { ValidraLogger } from '@/utils/validra-logger';
import { IDataExtractor } from '../interfaces/data-extractor.interface';
import { IMemoryPoolManager } from '../interfaces/memory-pool-manager.interface';
import { ISyncValidator } from '../interfaces/validators.interface';
import { ValidraResult } from '../interfaces/validra-result';
import { Rule } from '../rule';

/**
 * Synchronous validator component for the Validra validation engine.
 *
 * Handles synchronous validation operations with optimized performance characteristics
 * for high-frequency validation scenarios. Designed to process validation rules efficiently
 * while maintaining memory efficiency through object pooling and proper resource management.
 *
 * This validator is particularly suitable for:
 * - Real-time form validation
 * - API request validation where latency is critical
 * - Batch processing of data where async overhead is unnecessary
 * - Simple data validation that doesn't require external resources
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Initialize with dependencies
 * const dataExtractor = new DataExtractor();
 * const memoryPoolManager = new MemoryPoolManager();
 *
 * const validator = new SyncValidator(
 *   { debug: true, allowPartialValidation: false },
 *   dataExtractor,
 *   memoryPoolManager
 * );
 *
 * // Validate single rule
 * const rule = new Rule('isString', 'name', [], false);
 * const result = validator.applyRule(rule, 'John Doe', []);
 * console.log(result); // true
 *
 * // Bulk validation
 * const rules = [
 *   new Rule('isString', 'name', [], false),
 *   new Rule('minLength', 'name', [2], false)
 * ];
 * const data = { name: 'John' };
 * const validationResult = validator.validate(data, rules);
 * ```
 *
 * @see {@link ISyncValidator} Interface definition
 * @see {@link ValidraEngine} Main validation engine
 */
export class SyncValidator implements ISyncValidator {
  private readonly logger: ValidraLogger;
  private readonly options: {
    debug?: boolean;
    allowPartialValidation?: boolean;
    throwOnUnknownField?: boolean;
  };
  private readonly dataExtractor: IDataExtractor;
  private readonly memoryPoolManager: IMemoryPoolManager;

  /**
   * Creates a new SyncValidator instance with configurable options and dependencies.
   *
   * Initializes the validator with necessary components for data extraction,
   * memory management, and logging. The validator is designed to be reusable
   * across multiple validation operations.
   *
   * @public
   * @param {Object} options - Configuration options for the validator behavior
   * @param {boolean} [options.debug=false] - Enable debug logging for validation operations
   * @param {boolean} [options.allowPartialValidation=false] - Allow validation to continue even if some rules fail
   * @param {boolean} [options.throwOnUnknownField=false] - Throw error when encountering unknown fields
   * @param {IDataExtractor} dataExtractor - Data extraction component for accessing nested values
   * @param {IMemoryPoolManager} memoryPoolManager - Memory pool manager for efficient object reuse
   *
   * @example
   * ```typescript
   * const dataExtractor = new DataExtractor();
   * const memoryPoolManager = new MemoryPoolManager();
   *
   * // Basic configuration
   * const validator = new SyncValidator({}, dataExtractor, memoryPoolManager);
   *
   * // Debug configuration
   * const debugValidator = new SyncValidator(
   *   {
   *     debug: true,
   *     allowPartialValidation: true,
   *     throwOnUnknownField: false
   *   },
   *   dataExtractor,
   *   memoryPoolManager
   * );
   * ```
   *
   * @since 1.0.0
   */
  constructor(
    options: { debug?: boolean; allowPartialValidation?: boolean; throwOnUnknownField?: boolean } = {},
    dataExtractor: IDataExtractor,
    memoryPoolManager: IMemoryPoolManager,
  ) {
    this.logger = new ValidraLogger('SyncValidator');
    this.options = options;
    this.dataExtractor = dataExtractor;
    this.memoryPoolManager = memoryPoolManager;
  }

  /**
   * Applies a single validation rule synchronously to a value.
   *
   * Executes a validation rule against the provided value with optimized performance
   * characteristics. Supports both positive and negative validation logic through
   * the rule's negation flag. Includes proper error handling and logging for
   * debugging validation failures.
   *
   * @public
   * @param {Rule} rule - The validation rule to apply, containing operation, field, and parameters
   * @param {unknown} value - The value to validate against the rule
   * @param {unknown[]} args - Pre-built arguments array for the rule execution
   * @returns {boolean} True if validation passes (or fails if rule is negated), false otherwise
   * @throws {Error} Throws if the rule operation is unknown or if validation execution fails
   *
   * @example
   * ```typescript
   * const validator = new SyncValidator({}, dataExtractor, memoryPoolManager);
   *
   * // String validation rule
   * const stringRule = new Rule('isString', 'name', [], false);
   * const isValid = validator.applyRule(stringRule, 'John Doe', []);
   * console.log(isValid); // true
   *
   * // Negated rule (value should NOT be string)
   * const notStringRule = new Rule('isString', 'age', [], true);
   * const isNotString = validator.applyRule(notStringRule, 25, []);
   * console.log(isNotString); // true (25 is not a string, and rule is negated)
   *
   * // Length validation with arguments
   * const lengthRule = new Rule('minLength', 'password', [8], false);
   * const hasMinLength = validator.applyRule(lengthRule, 'password123', [8]);
   * console.log(hasMinLength); // true
   * ```
   *
   * @since 1.0.0
   * @see {@link Rule} Validation rule structure
   */
  public applyRule(rule: Rule, value: unknown, args: unknown[]): boolean {
    try {
      const helper = helpersActions.getHelperResolverSchema(rule.op as any);
      if (!helper) {
        throw new Error(`Unknown operation: ${rule.op}`);
      }

      // Pass the extracted value as the first argument to the helper
      const isValid = helper.resolver(value, ...args);

      // Apply negative logic if specified
      return rule.negative ? !isValid : isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const detailedMessage = `Error in operation '${rule.op}' on field '${rule.field}': ${errorMessage}`;

      if (this.options.debug) {
        this.logger.debug(`Rule application failed: ${detailedMessage}`);
      }

      throw new Error(detailedMessage);
    }
  }

  /**
   * Validates data against multiple rules synchronously
   *
   * Implements fail-fast and max errors logic with proper error aggregation.
   * Optimized for performance with early termination strategies.
   *
   * @param data - The data object to validate
   * @param rules - Array of validation rules
   * @param options - Validation options (failFast, maxErrors)
   * @returns Validation result with success/failure and errors
   */
  public validate<T extends Record<string, any>>(
    data: T,
    rules: Rule[],
    options?: { failFast?: boolean; maxErrors?: number },
  ): ValidraResult<T> {
    const startTime = performance.now();
    const { failFast = false, maxErrors = Infinity } = options || {};

    // Get validation result from pool if conditions are met
    let result: ValidraResult<T>;
    const usePoolForResult = this.memoryPoolManager.shouldPoolValidationResult(rules.length);

    if (usePoolForResult) {
      result = this.memoryPoolManager.getValidationResult() as ValidraResult<T>;
      // Reset result for reuse
      result.isValid = true;
      result.data = data;
      result.errors = {};
      delete result.message;
    } else {
      result = {
        isValid: true,
        data,
        errors: {},
      };
    }

    let errorCount = 0;

    if (this.options.debug) {
      this.logger.debug(`Starting sync validation with ${rules.length} rules`, {
        failFast,
        maxErrors,
        dataKeys: Object.keys(data),
        usePoolForResult,
      });
    }

    for (const rule of rules) {
      try {
        // Extract field value and parameters
        const pathSegments = this.dataExtractor.getPathSegments(rule.field);
        const value = this.dataExtractor.getValue(data, pathSegments);

        // Get arguments array from pool if conditions are met
        let args: unknown[];
        let usePoolForArgs = false;

        if ('params' in rule && (rule as any).params !== undefined) {
          const paramValues = Object.values((rule as any).params);
          usePoolForArgs = this.memoryPoolManager.shouldPoolArguments(paramValues.length);

          if (usePoolForArgs) {
            args = this.memoryPoolManager.getArgumentsArray();
            args.length = 0; // Clear array
            args.push(...paramValues);
          } else {
            args = paramValues;
          }
        } else {
          args = [];
        }

        const isValid = this.applyRule(rule, value, args);

        // Return args to pool if we got them from pool
        if (usePoolForArgs) {
          this.memoryPoolManager.returnArgumentsArray(args);
        }

        if (!isValid) {
          result.isValid = false;
          this.addError(result, rule);
          errorCount++;

          if (failFast || errorCount >= maxErrors) {
            if (this.options.debug) {
              this.logger.debug('Stopping validation early', {
                reason: failFast ? 'failFast' : 'maxErrors',
                errorCount,
              });
            }
            break;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (this.options.debug) {
          this.logger.warn(`Error applying rule ${rule.op} on field ${rule.field}`, {
            error: errorMessage,
            rule,
          });
        }

        if (!this.options.allowPartialValidation) {
          if (this.options.throwOnUnknownField) {
            throw new Error(`Rule validation failed for field "${rule.field}": ${errorMessage}`);
          }
        }

        result.isValid = false;
        this.addError(result, rule, `Validation error: ${errorMessage}`);
        errorCount++;

        if (failFast || errorCount >= maxErrors) {
          break;
        }
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (this.options.debug) {
      this.logger.debug(`Sync validation completed in ${duration.toFixed(2)}ms`, {
        isValid: result.isValid,
        errorsFound: result.errors ? Object.keys(result.errors).length : 0,
        usePoolForResult,
      });
    }

    return result;
  }

  /**
   * Adds validation error to result with proper typing
   *
   * @param result - Validation result to add error to
   * @param rule - Rule that failed validation
   * @param customMessage - Optional custom error message
   */
  private addError<T extends Record<string, any>>(result: ValidraResult<T>, rule: Rule, customMessage?: string): void {
    if (!result.errors) {
      result.errors = {} as any;
    }

    const errors = result.errors!;
    const field = rule.field as keyof T;
    const fieldErrors = errors[field] || (errors[field] = [] as any);

    (fieldErrors as any[]).push({
      message: customMessage || rule.message || `Validation [${rule.op}] failed for ${rule.field}`,
      code: rule.code || 'VALIDATION_ERROR',
    });
  }
}
