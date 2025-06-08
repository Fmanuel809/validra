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
  message: string;
  code?: string;
  field?: string;
  rule?: Rule;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  context?: Record<string, unknown>;
  stack?: string;
  recoverable: boolean;
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  maxErrors?: number;
  failFast?: boolean;
  collectStackTraces?: boolean;
  enableRecovery?: boolean;
  logErrors?: boolean;
  transformErrors?: boolean;
}

/**
 * Error statistics
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recoveredErrors: number;
  fatalErrors: number;
  averageRecoveryTime: number;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  canRecover(error: ValidationError): boolean;
  recover(error: ValidationError, context: unknown): Promise<boolean>;
  timeout: number;
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
  getErrorsByCategory(category: ErrorCategory): ValidationError[];
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
