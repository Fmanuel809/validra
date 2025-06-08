import type { Rule } from '../rule';
import type { ValidraResult } from './validra-result';

/**
 * Callback types for different validation events
 */
export interface ValidationCallbacks<T extends Record<string, any> = Record<string, any>> {
  /** Called when validation starts. */
  onStart?: (data: T, rules: Rule[]) => void;
  /** Called when a rule starts validation. */
  onRuleStart?: (rule: Rule, value: unknown, path: string[]) => void;
  /** Called when a rule is successfully validated. */
  onRuleSuccess?: (rule: Rule, value: unknown, path: string[]) => void;
  /** Called when a rule fails validation. */
  onRuleFailure?: (rule: Rule, value: unknown, path: string[], error: string) => void;
  /** Called when validation completes. */
  onComplete?: (result: ValidraResult<T>) => void;
  /** Called when an error occurs during validation. */
  onError?: (error: Error, context: ValidationContext) => void;
  /** Called to report validation progress. */
  onProgress?: (progress: ValidationProgress) => void;
}

/**
 * Context information for validation callbacks
 */
export interface ValidationContext {
  /** The rule currently being validated. */
  currentRule?: Rule;
  /** The current path being validated. */
  currentPath?: string[];
  /** The current value being validated. */
  currentValue?: unknown;
  /** Total number of rules to process. */
  totalRules: number;
  /** Number of rules processed so far. */
  processedRules: number;
  /** Timestamp when validation started. */
  timestamp: number;
}

/**
 * Progress information for validation callbacks
 */
export interface ValidationProgress {
  /** Number of rules completed. */
  completed: number;
  /** Total number of rules. */
  total: number;
  /** Percentage of completion. */
  percentage: number;
  /** The rule currently being processed. */
  currentRule?: string;
  /** Elapsed time in milliseconds. */
  elapsedTime: number;
}

/**
 * Callback execution options
 */
export interface CallbackOptions {
  /** Whether callbacks should be executed asynchronously. */
  async?: boolean;
  /** Timeout in milliseconds for callback execution. */
  timeout?: number;
  /** Whether to suppress errors thrown by callbacks. */
  suppressErrors?: boolean;
  /** Debounce time in milliseconds for callback execution. */
  debounceMs?: number;
}

/**
 * Interface for managing validation callbacks
 *
 * Handles callback registration, execution, and lifecycle management
 * following Single Responsibility Principle.
 */
export interface ICallbackManager<T extends Record<string, any> = Record<string, any>> {
  /**
   * Registers validation callbacks
   */
  registerCallbacks(callbacks: ValidationCallbacks<T>, options?: CallbackOptions): string;

  /**
   * Unregisters callbacks by ID
   */
  unregisterCallbacks(callbackId: string): boolean;

  /**
   * Triggers the onStart callback
   */
  triggerStart(data: T, rules: Rule[]): Promise<void>;

  /**
   * Triggers the onRuleStart callback
   */
  triggerRuleStart(rule: Rule, value: unknown, path: string[]): Promise<void>;

  /**
   * Triggers the onRuleSuccess callback
   */
  triggerRuleSuccess(rule: Rule, value: unknown, path: string[]): Promise<void>;

  /**
   * Triggers the onRuleFailure callback
   */
  triggerRuleFailure(rule: Rule, value: unknown, path: string[], error: string): Promise<void>;

  /**
   * Triggers the onComplete callback
   */
  triggerComplete(result: ValidraResult<T>): Promise<void>;

  /**
   * Triggers the onError callback
   */
  triggerError(error: Error, context: ValidationContext): Promise<void>;

  /**
   * Triggers the onProgress callback
   */
  triggerProgress(progress: ValidationProgress): Promise<void>;

  /**
   * Clears all registered callbacks
   */
  clearCallbacks(): void;

  /**
   * Gets the count of active callbacks
   */
  getActiveCallbackCount(): number;
}
