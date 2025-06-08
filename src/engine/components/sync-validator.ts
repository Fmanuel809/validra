import { helpersActions } from '@/dsl';
import { ValidraLogger } from '@/utils/validra-logger';
import { IDataExtractor } from '../interfaces/data-extractor.interface';
import { ISyncValidator } from '../interfaces/validators.interface';
import { ValidraResult } from '../interfaces/validra-result';
import { Rule } from '../rule';

/**
 * Synchronous validator component for Validra Engine
 *
 * Handles synchronous validation operations with optimized performance
 * for high-frequency validation scenarios.
 *
 * Follows Single Responsibility Principle by focusing solely on sync validation logic.
 */
export class SyncValidator implements ISyncValidator {
  private readonly logger: ValidraLogger;
  private readonly options: {
    debug?: boolean;
    allowPartialValidation?: boolean;
    throwOnUnknownField?: boolean;
  };
  private readonly dataExtractor: IDataExtractor;

  /**
   * Creates a new SyncValidator instance.
   * @param options Optional configuration for debugging, partial validation, and error handling.
   */
  constructor(
    options: { debug?: boolean; allowPartialValidation?: boolean; throwOnUnknownField?: boolean } = {},
    dataExtractor: IDataExtractor,
  ) {
    this.logger = new ValidraLogger('SyncValidator');
    this.options = options;
    this.dataExtractor = dataExtractor;
  }

  /**
   * Applies a single rule synchronously to a value
   *
   * Optimized for performance with proper error handling and
   * support for negative validation logic.
   *
   * @param rule - The validation rule to apply
   * @param value - The value to validate
   * @param args - Pre-built arguments array for the rule
   * @returns True if validation passes, false otherwise
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

    const result: ValidraResult<T> = {
      isValid: true,
      data,
      errors: {},
    };

    let errorCount = 0;

    if (this.options.debug) {
      this.logger.debug(`Starting sync validation with ${rules.length} rules`, {
        failFast,
        maxErrors,
        dataKeys: Object.keys(data),
      });
    }

    for (const rule of rules) {
      try {
        // Extract field value and parameters
        const pathSegments = this.dataExtractor.getPathSegments(rule.field);
        const value = this.dataExtractor.getValue(data, pathSegments);
        let args: unknown[] = [];
        if ('params' in rule && (rule as any).params !== undefined) {
          args = Object.values((rule as any).params);
        }
        const isValid = this.applyRule(rule, value, args);

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
