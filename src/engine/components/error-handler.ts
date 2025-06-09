/**
 * @fileoverview Comprehensive error handling and recovery system for the Validra validation engine
 * @module ErrorHandler
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { ValidraLogger } from '../../utils/validra-logger';
import type {
  ErrorCategory,
  ErrorHandlingOptions,
  ErrorRecoveryStrategy,
  ErrorSeverity,
  ErrorStatistics,
  IErrorHandler,
  ValidationError,
} from '../interfaces/error-handler.interface';
import type { ValidraResult } from '../interfaces/validra-result';
import type { Rule } from '../rule';

/**
 * Advanced error handler for validation operations with categorization and recovery strategies.
 *
 * Manages validation errors with sophisticated categorization, recovery mechanisms,
 * and comprehensive error tracking. Implements configurable error handling policies
 * including fail-fast behavior, error limits, and automatic recovery strategies.
 *
 * Key features:
 * - Error categorization (validation, system, configuration, etc.)
 * - Configurable severity levels (low, medium, high, critical)
 * - Recovery strategies for different error types
 * - Error statistics and metrics tracking
 * - Stack trace collection for debugging
 * - Fail-fast or accumulate error modes
 * - Error transformation and formatting
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic error handler
 * const errorHandler = new ErrorHandler();
 *
 * // Advanced configuration
 * const advancedHandler = new ErrorHandler(
 *   new ValidraLogger('validation'),
 *   {
 *     maxErrors: 50,
 *     failFast: false,
 *     collectStackTraces: true,
 *     enableRecovery: true,
 *     logErrors: true
 *   }
 * );
 *
 * // Handle validation error
 * const error = errorHandler.handleError(
 *   'Invalid email format',
 *   {
 *     field: 'email',
 *     rule: emailRule,
 *     value: 'invalid-email'
 *   }
 * );
 *
 * // Error recovery strategies
 * errorHandler.setRecoveryStrategy('validation', {
 *   strategy: 'skip',
 *   retryCount: 0,
 *   fallbackValue: null
 * });
 *
 * // Get error statistics
 * const stats = errorHandler.getStatistics();
 * console.log(`Total errors: ${stats.totalErrors}`);
 * console.log(`Critical errors: ${stats.severityBreakdown.critical}`);
 * ```
 *
 * @see {@link IErrorHandler} Interface definition
 * @see {@link ValidationError} Error structure
 * @see {@link ErrorHandlingOptions} Configuration options
 */
export class ErrorHandler implements IErrorHandler {
  private readonly errors: ValidationError[] = [];
  private readonly recoveryStrategies = new Map<ErrorCategory, ErrorRecoveryStrategy>();
  private readonly logger: ValidraLogger;

  private options: ErrorHandlingOptions = {
    maxErrors: 100,
    failFast: false,
    collectStackTraces: true,
    enableRecovery: false,
    logErrors: true,
    transformErrors: true,
  };

  /**
   * Creates a new ErrorHandler instance with configurable error management policies.
   *
   * Initializes the error handler with optional logger and configuration settings
   * for managing validation errors according to specific application requirements.
   * Supports various error handling strategies from fail-fast to error accumulation.
   *
   * @public
   * @param {ValidraLogger} [logger] - Optional logger instance for error events
   * @param {ErrorHandlingOptions} [options] - Optional error handling configuration
   * @param {number} [options.maxErrors=100] - Maximum number of errors to collect
   * @param {boolean} [options.failFast=false] - Stop validation on first error
   * @param {boolean} [options.collectStackTraces=true] - Include stack traces in errors
   * @param {boolean} [options.enableRecovery=false] - Enable automatic error recovery
   * @param {boolean} [options.logErrors=true] - Log errors to the configured logger
   * @param {boolean} [options.transformErrors=true] - Apply error transformations
   *
   * @example
   * ```typescript
   * // Basic error handler with default settings
   * const basicHandler = new ErrorHandler();
   *
   * // Custom logger with default options
   * const loggedHandler = new ErrorHandler(
   *   new ValidraLogger('custom-validation')
   * );
   *
   * // Full configuration for production environment
   * const productionHandler = new ErrorHandler(
   *   new ValidraLogger('production'),
   *   {
   *     maxErrors: 10,
   *     failFast: true,
   *     collectStackTraces: false,
   *     enableRecovery: true,
   *     logErrors: true,
   *     transformErrors: true
   *   }
   * );
   *
   * // Development configuration with detailed error tracking
   * const devHandler = new ErrorHandler(
   *   new ValidraLogger('development'),
   *   {
   *     maxErrors: 1000,
   *     failFast: false,
   *     collectStackTraces: true,
   *     enableRecovery: false,
   *     logErrors: true
   *   }
   * );
   * ```
   *
   * @since 1.0.0
   */
  constructor(logger?: ValidraLogger, options?: ErrorHandlingOptions) {
    this.logger = logger || new ValidraLogger('error');
    if (options) {
      this.configure(options);
    }
  }

  /**
   * Handles a validation error with comprehensive context and categorization.
   *
   * Processes validation errors by creating structured error objects, applying
   * categorization and severity classification, and executing appropriate
   * recovery strategies. Supports both Error objects and string messages
   * with rich contextual information.
   *
   * @public
   * @param {Error | string} error - The error to handle (Error object or message string)
   * @param {Object} [context={}] - Contextual information about the error
   * @param {string} [context.field] - The field name where the error occurred
   * @param {Rule} [context.rule] - The validation rule that failed
   * @param {unknown} [context.value] - The value that caused the validation failure
   * @param {Record<string, unknown>} [context.metadata] - Additional metadata about the error
   * @returns {ValidationError} The structured validation error object
   * @throws {Error} Throws if failFast is enabled and max errors exceeded
   *
   * @example
   * ```typescript
   * const errorHandler = new ErrorHandler();
   *
   * // Handle string error with context
   * const error1 = errorHandler.handleError(
   *   'Email format is invalid',
   *   {
   *     field: 'user.email',
   *     rule: emailValidationRule,
   *     value: 'invalid-email@',
   *     metadata: { attempted: 'email-validation' }
   *   }
   * );
   *
   * // Handle Error object
   * const error2 = errorHandler.handleError(
   *   new TypeError('Expected string but got number'),
   *   {
   *     field: 'user.age',
   *     value: 'twenty-five'
   *   }
   * );
   *
   * // Minimal error handling
   * const error3 = errorHandler.handleError('Validation failed');
   *
   * console.log(error1.category); // 'validation'
   * console.log(error1.severity); // 'medium'
   * console.log(error1.timestamp); // Date object
   * ```
   *
   * @since 1.0.0
   * @see {@link ValidationError} Structure of returned error objects
   */
  handleError(
    error: Error | string,
    context: {
      field?: string;
      rule?: Rule;
      value?: unknown;
      metadata?: Record<string, unknown>;
    } = {},
  ): ValidationError {
    const validationError = this.createValidationError(error, context);

    this.addError(validationError);

    if (this.options.logErrors) {
      this.logger.error('Validation error occurred', {
        error: validationError,
        context,
      });
    }

    return validationError;
  }

  /**
   * Adds an error to the collection
   */
  addError(error: ValidationError): void {
    // Check if we've reached the error limit
    if (this.options.maxErrors && this.errors.length >= this.options.maxErrors) {
      const limitError: ValidationError = {
        message: `Maximum error limit reached (${this.options.maxErrors})`,
        code: 'ERROR_LIMIT_EXCEEDED',
        severity: 'critical',
        category: 'system',
        timestamp: Date.now(),
        recoverable: false,
      };

      if (this.errors[this.errors.length - 1]?.code !== 'ERROR_LIMIT_EXCEEDED') {
        this.errors.push(limitError);
      }
      return;
    }

    this.errors.push(error);

    // If fail-fast is enabled and this is a critical error, stop processing
    if (this.options.failFast && error.severity === 'critical') {
      throw new Error(`Critical error encountered (fail-fast enabled): ${error.message}`);
    }
  }

  /**
   * Gets all collected errors
   */
  getErrors(): ValidationError[] {
    return [...this.errors];
  }

  /**
   * Gets errors filtered by field
   */
  getErrorsByField(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Gets errors filtered by category
   */
  getErrorsByCategory(category: ErrorCategory): ValidationError[] {
    return this.errors.filter(error => error.category === category);
  }

  /**
   * Gets errors filtered by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ValidationError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Clears all collected errors
   */
  clearErrors(): void {
    this.errors.length = 0;
    this.logger.debug('Cleared all validation errors');
  }

  /**
   * Checks if the error limit has been reached
   */
  hasReachedLimit(): boolean {
    return this.options.maxErrors ? this.errors.length >= this.options.maxErrors : false;
  }

  /**
   * Gets error statistics
   */
  getStatistics(): ErrorStatistics {
    const stats: ErrorStatistics = {
      totalErrors: this.errors.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      recoveredErrors: 0,
      fatalErrors: 0,
      averageRecoveryTime: 0,
    };

    // Initialize counters
    const categories: ErrorCategory[] = [
      'validation',
      'compilation',
      'system',
      'network',
      'timeout',
      'memory',
      'configuration',
    ];
    const severities: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];

    categories.forEach(cat => (stats.errorsByCategory[cat] = 0));
    severities.forEach(sev => (stats.errorsBySeverity[sev] = 0));

    // Count errors
    this.errors.forEach(error => {
      stats.errorsByCategory[error.category]++;
      stats.errorsBySeverity[error.severity]++;

      if (error.recoverable && error.context?.recovered) {
        stats.recoveredErrors++;
      }

      if (error.severity === 'critical') {
        stats.fatalErrors++;
      }
    });

    return stats;
  }

  /**
   * Formats errors into a ValidraResult format
   */
  formatForResult<T extends Record<string, any>>(data: T): Partial<ValidraResult<T>> {
    if (this.errors.length === 0) {
      return {
        isValid: true,
        data,
      };
    }

    const errorsByField: Record<string, Array<{ message: string; code?: string }>> = {};
    let hasFieldErrors = false;

    // Group errors by field
    this.errors.forEach(error => {
      if (error.field) {
        hasFieldErrors = true;
        if (!errorsByField[error.field]) {
          errorsByField[error.field] = [];
        }
        errorsByField[error.field]!.push({
          message: this.formatErrorMessage(error),
          code: error.code || 'UNKNOWN_ERROR',
        });
      }
    });

    const result: Partial<ValidraResult<T>> = {
      isValid: false,
      data,
    };

    // Add field-specific errors
    if (hasFieldErrors) {
      result.errors = errorsByField as any;
    }

    // Add general message for non-field errors
    const generalErrors = this.errors.filter(error => !error.field);
    if (generalErrors.length > 0 && generalErrors[0]) {
      result.message = this.formatErrorMessage(generalErrors[0]);
    }

    return result;
  }

  /**
   * Registers an error recovery strategy
   */
  registerRecoveryStrategy(category: ErrorCategory, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(category, strategy);
    this.logger.debug(`Registered recovery strategy for category: ${category}`);
  }

  /**
   * Attempts to recover from errors
   */
  async attemptRecovery(): Promise<number> {
    if (!this.options.enableRecovery) {
      return 0;
    }

    let recoveredCount = 0;
    const startTime = Date.now();

    for (const error of this.errors) {
      if (!error.recoverable || error.context?.recovered) {
        continue;
      }

      const strategy = this.recoveryStrategies.get(error.category);
      if (!strategy) {
        continue;
      }

      try {
        if (strategy.canRecover(error)) {
          const recovered = await Promise.race([
            strategy.recover(error),
            new Promise<boolean>((_, reject) =>
              setTimeout(() => reject(new Error('Recovery timeout')), strategy.timeout),
            ),
          ]);

          if (recovered) {
            error.context = { ...error.context, recovered: true, recoveryTime: Date.now() - startTime };
            recoveredCount++;
            this.logger.info(`Recovered from error: ${error.message}`, { error });
          }
        }
      } catch (recoveryError) {
        this.logger.warn(`Failed to recover from error: ${error.message}`, {
          originalError: error,
          recoveryError,
        });
      }
    }

    this.logger.info('Recovery attempt completed', {
      recoveredCount,
      totalErrors: this.errors.length,
      recoveryTime: Date.now() - startTime,
    });

    return recoveredCount;
  }

  /**
   * Configures error handling options
   */
  configure(options: ErrorHandlingOptions): void {
    this.options = { ...this.options, ...options };
    this.logger.debug('Error handler configured', { options: this.options });
  }

  /**
   * Creates a formatted error message
   */
  formatErrorMessage(error: ValidationError): string {
    let message = error.message;

    if (error.field) {
      message = `Field '${error.field}': ${message}`;
    }

    if (error.code) {
      message = `[${error.code}] ${message}`;
    }

    if (error.severity !== 'medium') {
      message = `${error.severity.toUpperCase()}: ${message}`;
    }

    return message;
  }

  /**
   * Creates a ValidationError from an Error or string
   */
  private createValidationError(
    error: Error | string,
    context: {
      field?: string;
      rule?: Rule;
      value?: unknown;
      metadata?: Record<string, unknown>;
    },
  ): ValidationError {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' && this.options.collectStackTraces ? error.stack : undefined;

    // Determine severity and category based on context and error content
    const severity = this.determineSeverity(message);
    const category = this.determineCategory(message, context);
    const recoverable = this.determineRecoverability(severity, category);

    const result: ValidationError = {
      message,
      code: this.generateErrorCode(category, context.rule),
      severity,
      category,
      timestamp: Date.now(),
      recoverable,
    };

    // Add optional properties only if they exist
    if (context.field) {
      result.field = context.field;
    }
    if (context.rule) {
      result.rule = context.rule;
    }
    if (context.metadata) {
      result.context = context.metadata;
    }
    if (stack) {
      result.stack = stack;
    }

    return result;
  }

  /**
   * Determines error severity based on message and context
   */
  private determineSeverity(message: string): ErrorSeverity {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal') || lowerMessage.includes('crash')) {
      return 'critical';
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('failed') || lowerMessage.includes('invalid')) {
      return 'high';
    }

    if (lowerMessage.includes('warning') || lowerMessage.includes('deprecated')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determines error category based on message and context
   */
  private determineCategory(message: string, context: any): ErrorCategory {
    const lowerMessage = message.toLowerCase();

    if (context.rule || lowerMessage.includes('validation') || lowerMessage.includes('rule')) {
      return 'validation';
    }

    if (lowerMessage.includes('compile') || lowerMessage.includes('parse')) {
      return 'compilation';
    }

    if (lowerMessage.includes('timeout')) {
      return 'timeout';
    }

    if (lowerMessage.includes('memory') || lowerMessage.includes('pool')) {
      return 'memory';
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return 'network';
    }

    if (lowerMessage.includes('config') || lowerMessage.includes('setting')) {
      return 'configuration';
    }

    return 'system';
  }

  /**
   * Determines if an error is recoverable
   */
  private determineRecoverability(severity: ErrorSeverity, category: ErrorCategory): boolean {
    // Critical errors are generally not recoverable
    if (severity === 'critical') {
      return false;
    }

    // Some categories are more likely to be recoverable
    if (category === 'validation' || category === 'timeout' || category === 'network') {
      return true;
    }

    // System and memory errors are usually not recoverable
    if (category === 'system' || category === 'memory') {
      return false;
    }

    return severity === 'low' || severity === 'medium';
  }

  /**
   * Generates an error code based on category and rule
   */
  private generateErrorCode(category: ErrorCategory, rule?: Rule): string {
    const categoryCode = category.toUpperCase().substring(0, 3);
    const ruleCode = rule?.op ? rule.op.toUpperCase().substring(0, 3) : 'GEN';
    const timestamp = Date.now().toString().slice(-4);

    return `${categoryCode}_${ruleCode}_${timestamp}`;
  }
}
