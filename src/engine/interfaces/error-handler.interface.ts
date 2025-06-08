import type { Rule } from '../rule';
import type { ValidraResult } from './validra-result';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | 'validation'
  | 'compilation'
  | 'system'
  | 'network'
  | 'timeout'
  | 'memory'
  | 'configuration';

/**
 * Enhanced error information
 */
export interface ValidationError {
  /** Error message describing the validation failure. */
  message: string;
  /** Optional error code for categorization. */
  code?: string;
  /** Field associated with the error, if any. */
  field?: string;
  /** The rule that caused the error, if available. */
  rule?: Rule;
  /** Severity level of the error. */
  severity: ErrorSeverity;
  /** Category of the error. */
  category: ErrorCategory;
  /** Timestamp when the error occurred. */
  timestamp: number;
  /** Additional context for the error. */
  context?: Record<string, unknown>;
  /** Stack trace, if available. */
  stack?: string;
  /** Whether the error is recoverable. */
  recoverable: boolean;
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /** Maximum number of errors allowed before aborting. */
  maxErrors?: number;
  /** Whether to stop on the first error. */
  failFast?: boolean;
  /** Whether to collect stack traces for errors. */
  collectStackTraces?: boolean;
  /** Whether to enable error recovery. */
  enableRecovery?: boolean;
  /** Whether to log errors. */
  logErrors?: boolean;
  /** Whether to transform errors before reporting. */
  transformErrors?: boolean;
}

/**
 * Error statistics
 */
export interface ErrorStatistics {
  /** Total number of errors encountered. */
  totalErrors: number;
  /** Number of errors by category. */
  errorsByCategory: Record<ErrorCategory, number>;
  /** Number of errors by severity. */
  errorsBySeverity: Record<ErrorSeverity, number>;
  /** Number of errors that were recovered. */
  recoveredErrors: number;
  /** Number of fatal errors. */
  fatalErrors: number;
  /** Average time taken to recover from errors (ms). */
  averageRecoveryTime: number;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  /**
   * Determines if the error can be recovered.
   * @param error The validation error to check.
   * @returns True if the error can be recovered, false otherwise.
   */
  canRecover(error: ValidationError): boolean;
  /**
   * Attempts to recover from the error.
   * @param error The validation error to recover from.
   * @returns True if recovery was successful, false otherwise.
   */
  recover(error: ValidationError): boolean;
  /**
   * Optional timeout in milliseconds for recovery attempts.
   */
  timeout?: number;
}

/**
 * Interface for error handling and management
 *
 * Handles error collection, categorization, recovery, and reporting
 * following Single Responsibility Principle.
 */
export interface IErrorHandler {
  /**
   * Handles a validation error
   */
  handleError(
    error: Error | string,
    context?: {
      field?: string;
      rule?: Rule;
      value?: unknown;
      metadata?: Record<string, unknown>;
    },
  ): ValidationError;

  /**
   * Adds an error to the collection
   */
  addError(error: ValidationError): void;

  /**
   * Gets all collected errors
   */
  getErrors(): ValidationError[];

  /**
   * Gets errors filtered by criteria
   */
  getErrorsByField(field: string): ValidationError[];
  /**
   * Gets errors by category.
   * @param category The error category.
   * @returns An array of validation errors for the given category.
   */
  getErrorsByCategory(category: ErrorCategory): ValidationError[];
  /**
   * Gets errors by severity.
   * @param severity The error severity.
   * @returns An array of validation errors for the given severity.
   */
  getErrorsBySeverity(severity: ErrorSeverity): ValidationError[];

  /**
   * Clears all collected errors
   */
  clearErrors(): void;

  /**
   * Checks if the error limit has been reached
   */
  hasReachedLimit(): boolean;

  /**
   * Gets error statistics
   */
  getStatistics(): ErrorStatistics;

  /**
   * Formats errors into a ValidraResult format
   */
  formatForResult<T extends Record<string, any>>(data: T): Partial<ValidraResult<T>>;

  /**
   * Registers an error recovery strategy
   */
  registerRecoveryStrategy(category: ErrorCategory, strategy: ErrorRecoveryStrategy): void;

  /**
   * Attempts to recover from errors
   */
  attemptRecovery(): Promise<number>;

  /**
   * Configures error handling options
   */
  configure(options: ErrorHandlingOptions): void;

  /**
   * Creates a formatted error message
   */
  formatErrorMessage(error: ValidationError): string;
}
