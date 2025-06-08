import type { Rule } from '../rule';
import type { ValidraResult } from './validra-result';

/**
 * Callback types for different validation events
 */
export interface ValidationCallbacks<T extends Record<string, any> = Record<string, any>> {
  onStart?: (data: T, rules: Rule[]) => void;
  onRuleStart?: (rule: Rule, value: unknown, path: string[]) => void;
  onRuleSuccess?: (rule: Rule, value: unknown, path: string[]) => void;
  onRuleFailure?: (rule: Rule, value: unknown, path: string[], error: string) => void;
  onComplete?: (result: ValidraResult<T>) => void;
  onError?: (error: Error, context: ValidationContext) => void;
  onProgress?: (progress: ValidationProgress) => void;
}

/**
 * Context information for validation callbacks
 */
export interface ValidationContext {
  currentRule?: Rule;
  currentPath?: string[];
  currentValue?: unknown;
  totalRules: number;
  processedRules: number;
  timestamp: number;
}

/**
 * Progress information for validation callbacks
 */
export interface ValidationProgress {
  completed: number;
  total: number;
  percentage: number;
  currentRule?: string;
  elapsedTime: number;
}

/**
 * Callback execution options
 */
export interface CallbackOptions {
  async?: boolean;
  timeout?: number;
  suppressErrors?: boolean;
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
