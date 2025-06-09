/**
 * @fileoverview Callback management component for validation lifecycle event handling and execution
 * @module CallbackManager
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { ValidraLogger } from '../../utils/validra-logger';
import type {
  CallbackOptions,
  ICallbackManager,
  ValidationCallbacks,
  ValidationContext,
  ValidationProgress,
} from '../interfaces/callback-manager.interface';
import type { ValidraResult } from '../interfaces/validra-result';
import type { Rule } from '../rule';

/**
 * Internal callback registration data structure for tracking callback lifecycle and metadata.
 *
 * @private
 * @interface CallbackRegistration
 * @template T - Data type being validated
 */
interface CallbackRegistration<T extends Record<string, any>> {
  /** Unique identifier for this callback registration */
  id: string;
  /** Collection of validation lifecycle callbacks */
  callbacks: ValidationCallbacks<T>;
  /** Configuration options for callback execution */
  options: CallbackOptions;
  /** Timestamp when callbacks were registered */
  registeredAt: number;
  /** Timestamp of last callback execution (optional) */
  lastExecuted?: number;
}

/**
 * Comprehensive callback manager for validation lifecycle event handling and execution.
 *
 * The CallbackManager provides sophisticated callback lifecycle management for validation
 * operations, supporting multiple registration patterns, execution strategies, and
 * advanced features like debouncing, timeout protection, and error handling. Implements
 * the Single Responsibility Principle specifically for callback orchestration.
 *
 * Key features:
 * - **Lifecycle Management**: Complete validation lifecycle callback support
 * - **Multiple Registrations**: Support for multiple callback sets with individual configurations
 * - **Execution Strategies**: Synchronous and asynchronous callback execution patterns
 * - **Debouncing**: Built-in debouncing for high-frequency validation scenarios
 * - **Timeout Protection**: Configurable timeouts to prevent hanging callbacks
 * - **Error Isolation**: Comprehensive error handling with optional suppression
 * - **Performance Monitoring**: Execution tracking and performance metrics
 *
 * Supported callback events:
 * - `onStart`: Validation process initiation
 * - `onRuleStart`: Individual rule execution start
 * - `onRuleSuccess`: Successful rule completion
 * - `onRuleFailure`: Rule failure with error details
 * - `onProgress`: Validation progress updates
 * - `onComplete`: Validation process completion
 * - `onError`: Critical error handling
 *
 * @public
 * @template T - Type of data being validated, must extend Record<string, any>
 * @implements {ICallbackManager<T>}
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic callback registration and usage
 * const callbackManager = new CallbackManager();
 *
 * const callbackId = callbackManager.registerCallbacks({
 *   onStart: (data, rules) => console.log('Validation started'),
 *   onComplete: (result) => console.log('Validation completed:', result.isValid),
 *   onError: (error) => console.error('Validation error:', error.message)
 * });
 *
 * // Trigger validation events
 * await callbackManager.triggerStart(userData, validationRules);
 * ```
 *
 * @example
 * ```typescript
 * // Advanced configuration with debouncing and timeout
 * const advancedCallbacks = callbackManager.registerCallbacks({
 *   onProgress: (progress) => updateProgressBar(progress.percentage),
 *   onRuleFailure: (rule, value, path, error) => logValidationError(error)
 * }, {
 *   async: true,
 *   timeout: 10000,
 *   debounceMs: 250,
 *   suppressErrors: false
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Multiple callback registrations for different concerns
 * const uiCallbacks = callbackManager.registerCallbacks({
 *   onProgress: updateProgressIndicator,
 *   onComplete: showValidationResults
 * });
 *
 * const loggingCallbacks = callbackManager.registerCallbacks({
 *   onStart: logValidationStart,
 *   onError: logValidationError,
 *   onComplete: logValidationComplete
 * }, { suppressErrors: true });
 * ```
 *
 * @see {@link ICallbackManager} for the interface definition
 * @see {@link ValidationCallbacks} for callback function signatures
 * @see {@link CallbackOptions} for configuration options
 */
export class CallbackManager<T extends Record<string, any> = Record<string, any>> implements ICallbackManager<T> {
  private readonly registrations = new Map<string, CallbackRegistration<T>>();
  private readonly logger: ValidraLogger;
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Creates a new CallbackManager instance with optional logging configuration.
   *
   * Initializes the callback management system with configurable logging for debugging
   * and monitoring callback execution. The manager maintains internal state for
   * callback registrations, debounce timers, and execution tracking.
   *
   * @public
   * @param {ValidraLogger} [logger] - Optional logger instance for callback event logging;
   *                                   defaults to error-level logging if not provided
   *
   * @example
   * ```typescript
   * // Basic callback manager with default logging
   * const callbackManager = new CallbackManager();
   * ```
   *
   * @example
   * ```typescript
   * // Callback manager with custom logger configuration
   * const logger = new ValidraLogger('debug');
   * const callbackManager = new CallbackManager(logger);
   * ```
   *
   * @example
   * ```typescript
   * // Integration with existing logging infrastructure
   * const customLogger = new ValidraLogger('info');
   * const callbackManager = new CallbackManager(customLogger);
   *
   * // Register callbacks for comprehensive validation monitoring
   * callbackManager.registerCallbacks({
   *   onStart: (data) => customLogger.info('Validation started', { dataKeys: Object.keys(data) }),
   *   onComplete: (result) => customLogger.info('Validation completed', { isValid: result.isValid })
   * });
   * ```
   *
   * @since 1.0.0
   */
  constructor(logger?: ValidraLogger) {
    this.logger = logger || new ValidraLogger('error');
  }

  /**
   * Registers a collection of validation callbacks with configurable execution options.
   *
   * Provides comprehensive callback registration with advanced configuration options
   * for execution behavior, error handling, and performance optimization. Each
   * registration receives a unique identifier for subsequent management operations.
   *
   * @public
   * @param {ValidationCallbacks<T>} callbacks - Collection of lifecycle callback functions
   * @param {CallbackOptions} [options={}] - Configuration options for callback execution behavior
   * @returns {string} Unique identifier for the registered callback collection
   *
   * @example
   * ```typescript
   * // Basic callback registration
   * const callbackId = callbackManager.registerCallbacks({
   *   onStart: (data, rules) => console.log(`Starting validation with ${rules.length} rules`),
   *   onComplete: (result) => console.log('Validation result:', result.isValid),
   *   onError: (error) => console.error('Validation failed:', error.message)
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Advanced registration with comprehensive options
   * const advancedId = callbackManager.registerCallbacks({
   *   onProgress: (progress) => updateProgressIndicator(progress.percentage),
   *   onRuleFailure: (rule, value, path, error) => logFieldError(path.join('.'), error)
   * }, {
   *   async: true,           // Enable asynchronous execution
   *   timeout: 5000,         // 5-second timeout protection
   *   debounceMs: 300,       // Debounce rapid calls by 300ms
   *   suppressErrors: false  // Log callback execution errors
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Real-time UI update callbacks with debouncing
   * const uiCallbackId = callbackManager.registerCallbacks({
   *   onProgress: (progress) => {
   *     document.getElementById('progress').style.width = `${progress.percentage}%`;
   *     document.getElementById('status').textContent = `${progress.completed}/${progress.total} rules`;
   *   },
   *   onRuleFailure: (rule, value, path) => {
   *     highlightInvalidField(path.join('.'));
   *   }
   * }, {
   *   debounceMs: 150, // Prevent excessive DOM updates
   *   suppressErrors: true // Don't break validation on UI errors
   * });
   * ```
   *
   * @since 1.0.0
   */
  registerCallbacks(callbacks: ValidationCallbacks<T>, options: CallbackOptions = {}): string {
    // Asegura que callbacks nunca sea undefined
    callbacks = callbacks || {};
    const id = this.generateCallbackId();
    const registration: CallbackRegistration<T> = {
      id,
      callbacks,
      options: {
        async: false,
        timeout: 5000,
        suppressErrors: false,
        debounceMs: 0,
        ...options,
      },
      registeredAt: Date.now(),
    };

    this.registrations.set(id, registration);
    this.logger.debug(`Registered callbacks with ID: ${id}`, { options });

    return id;
  }

  /**
   * Unregisters a callback collection by its unique identifier with cleanup.
   *
   * Removes the specified callback registration and performs comprehensive cleanup
   * including clearing any pending debounce timers. This ensures complete removal
   * of callback state and prevents memory leaks in long-running applications.
   *
   * @public
   * @param {string} callbackId - Unique identifier returned from registerCallbacks()
   * @returns {boolean} True if callbacks were successfully unregistered, false if ID not found
   *
   * @example
   * ```typescript
   * // Standard callback lifecycle management
   * const callbackId = callbackManager.registerCallbacks({
   *   onComplete: (result) => processValidationResult(result)
   * });
   *
   * // Later, when callbacks are no longer needed
   * const wasRemoved = callbackManager.unregisterCallbacks(callbackId);
   * if (wasRemoved) {
   *   console.log('Callbacks successfully removed');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Component cleanup in framework integrations
   * class ValidationComponent {
   *   private callbackId: string;
   *
   *   onMount() {
   *     this.callbackId = callbackManager.registerCallbacks({
   *       onProgress: this.updateProgress.bind(this)
   *     });
   *   }
   *
   *   onUnmount() {
   *     if (this.callbackId) {
   *       callbackManager.unregisterCallbacks(this.callbackId);
   *     }
   *   }
   * }
   * ```
   *
   * @since 1.0.0
   */
  unregisterCallbacks(callbackId: string): boolean {
    const existed = this.registrations.delete(callbackId);

    // Clear any pending debounce timers
    const timer = this.debounceTimers.get(callbackId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(callbackId);
    }

    if (existed) {
      this.logger.debug(`Unregistered callbacks with ID: ${callbackId}`);
    }

    return existed;
  }

  /**
   * Triggers validation start callbacks for all registered callback collections.
   *
   * Initiates the validation lifecycle by executing all registered `onStart` callbacks
   * with the validation data and rule set. Provides comprehensive context about the
   * validation operation including total rule count and timestamp information.
   *
   * @public
   * @param {T} data - Data object being validated
   * @param {Rule[]} rules - Array of validation rules to be executed
   * @returns {Promise<void>} Promise that resolves when all start callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger validation start with user data
   * await callbackManager.triggerStart(userData, validationRules);
   * ```
   *
   * @example
   * ```typescript
   * // Integration with validation engine startup
   * const validationEngine = new ValidraEngine();
   * await callbackManager.triggerStart(formData, validationEngine.getRules());
   * ```
   *
   * @since 1.0.0
   */
  async triggerStart(data: T, rules: Rule[]): Promise<void> {
    const context: ValidationContext = {
      totalRules: rules.length,
      processedRules: 0,
      timestamp: Date.now(),
    };

    await this.executeCallbacks('onStart', [data, rules], context);
  }

  /**
   * Triggers rule start callbacks when individual validation rule execution begins.
   *
   * Notifies all registered callbacks that a specific validation rule is about to
   * execute, providing detailed context including the rule instance, target value,
   * and property path being validated.
   *
   * @public
   * @param {Rule} rule - Validation rule about to be executed
   * @param {unknown} value - Value being validated by this rule
   * @param {string[]} path - Property path array indicating validation location
   * @returns {Promise<void>} Promise that resolves when all rule start callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger rule start for field validation
   * await callbackManager.triggerRuleStart(
   *   emailValidationRule,
   *   formData.email,
   *   ['user', 'email']
   * );
   * ```
   *
   * @example
   * ```typescript
   * // Integration with rule engine execution
   * for (const rule of validationRules) {
   *   await callbackManager.triggerRuleStart(rule, targetValue, fieldPath);
   *   const result = await rule.execute(targetValue);
   *   // ... handle result
   * }
   * ```
   *
   * @since 1.0.0
   */
  async triggerRuleStart(rule: Rule, value: unknown, path: string[]): Promise<void> {
    const context: ValidationContext = {
      currentRule: rule,
      currentPath: path,
      currentValue: value,
      totalRules: 1,
      processedRules: 0,
      timestamp: Date.now(),
    };

    await this.executeCallbacks('onRuleStart', [rule, value, path], context);
  }

  /**
   * Triggers rule success callbacks when individual validation rule passes successfully.
   *
   * Notifies all registered callbacks of successful rule validation, providing
   * complete context about the validated rule, value, and location. Useful for
   * progress tracking and success logging in validation operations.
   *
   * @public
   * @param {Rule} rule - Validation rule that executed successfully
   * @param {unknown} value - Value that passed validation
   * @param {string[]} path - Property path array indicating validation location
   * @returns {Promise<void>} Promise that resolves when all success callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger success callback for passed validation
   * await callbackManager.triggerRuleSuccess(
   *   requiredFieldRule,
   *   formData.username,
   *   ['user', 'username']
   * );
   * ```
   *
   * @example
   * ```typescript
   * // Progress tracking with success callbacks
   * callbackManager.registerCallbacks({
   *   onRuleSuccess: (rule, value, path) => {
   *     console.log(`✓ ${path.join('.')} passed ${rule.constructor.name}`);
   *     updateValidationProgress(path.join('.'), 'success');
   *   }
   * });
   * ```
   *
   * @since 1.0.0
   */
  async triggerRuleSuccess(rule: Rule, value: unknown, path: string[]): Promise<void> {
    const context: ValidationContext = {
      currentRule: rule,
      currentPath: path,
      currentValue: value,
      totalRules: 1,
      processedRules: 1,
      timestamp: Date.now(),
    };

    await this.executeCallbacks('onRuleSuccess', [rule, value, path], context);
  }

  /**
   * Triggers rule failure callbacks when individual validation rule fails.
   *
   * Notifies all registered callbacks of rule validation failure, providing
   * comprehensive failure context including the rule, invalid value, location,
   * and specific error message. Essential for error handling and user feedback.
   *
   * @public
   * @param {Rule} rule - Validation rule that failed
   * @param {unknown} value - Value that failed validation
   * @param {string[]} path - Property path array indicating validation location
   * @param {string} error - Specific error message describing the failure
   * @returns {Promise<void>} Promise that resolves when all failure callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger failure callback with error details
   * await callbackManager.triggerRuleFailure(
   *   emailFormatRule,
   *   'invalid-email',
   *   ['user', 'email'],
   *   'Email format is invalid'
   * );
   * ```
   *
   * @example
   * ```typescript
   * // Error handling and UI feedback integration
   * callbackManager.registerCallbacks({
   *   onRuleFailure: (rule, value, path, error) => {
   *     const fieldName = path.join('.');
   *     showFieldError(fieldName, error);
   *     logValidationFailure(fieldName, rule.constructor.name, error);
   *   }
   * });
   * ```
   *
   * @since 1.0.0
   */
  async triggerRuleFailure(rule: Rule, value: unknown, path: string[], error: string): Promise<void> {
    const context: ValidationContext = {
      currentRule: rule,
      currentPath: path,
      currentValue: value,
      totalRules: 1,
      processedRules: 1,
      timestamp: Date.now(),
    };

    await this.executeCallbacks('onRuleFailure', [rule, value, path, error], context);
  }

  /**
   * Triggers validation completion callbacks when entire validation process finishes.
   *
   * Notifies all registered callbacks of validation completion with the final
   * validation result. Provides comprehensive result information including
   * validation status, processed data, and any collected errors.
   *
   * @public
   * @param {ValidraResult<T>} result - Final validation result object
   * @returns {Promise<void>} Promise that resolves when all completion callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger completion with validation result
   * const validationResult = await validator.validate(userData);
   * await callbackManager.triggerComplete(validationResult);
   * ```
   *
   * @example
   * ```typescript
   * // Result processing and response handling
   * callbackManager.registerCallbacks({
   *   onComplete: (result) => {
   *     if (result.isValid) {
   *       submitForm(result.data);
   *     } else {
   *       displayValidationErrors(result.errors);
   *     }
   *   }
   * });
   * ```
   *
   * @since 1.0.0
   */
  async triggerComplete(result: ValidraResult<T>): Promise<void> {
    const context: ValidationContext = {
      totalRules: 0,
      processedRules: 0,
      timestamp: Date.now(),
    };

    await this.executeCallbacks('onComplete', [result], context);
  }

  /**
   * Triggers error callbacks when critical validation errors occur.
   *
   * Notifies all registered callbacks of critical validation system errors,
   * providing error details and validation context for comprehensive error
   * handling and recovery procedures.
   *
   * @public
   * @param {Error} error - Error object containing failure details
   * @param {ValidationContext} context - Validation context when error occurred
   * @returns {Promise<void>} Promise that resolves when all error callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger error callback for system failures
   * try {
   *   await validator.validate(data);
   * } catch (error) {
   *   await callbackManager.triggerError(error, validationContext);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Comprehensive error handling registration
   * callbackManager.registerCallbacks({
   *   onError: (error, context) => {
   *     console.error('Validation system error:', error.message);
   *     logErrorToService(error, context);
   *     showSystemErrorMessage();
   *   }
   * });
   * ```
   *
   * @since 1.0.0
   */
  async triggerError(error: Error, context: ValidationContext): Promise<void> {
    await this.executeCallbacks('onError', [error, context], context);
  }

  /**
   * Triggers progress callbacks during validation execution with debouncing support.
   *
   * Notifies all registered callbacks of validation progress updates, providing
   * real-time progress information with built-in debouncing to prevent excessive
   * callback execution during rapid validation operations.
   *
   * @public
   * @param {ValidationProgress} progress - Progress information including completion status
   * @returns {Promise<void>} Promise that resolves when all progress callbacks complete
   *
   * @example
   * ```typescript
   * // Trigger progress updates during validation
   * const progress = {
   *   completed: 15,
   *   total: 25,
   *   percentage: 60,
   *   currentField: 'user.email'
   * };
   * await callbackManager.triggerProgress(progress);
   * ```
   *
   * @example
   * ```typescript
   * // Real-time progress indicator integration
   * callbackManager.registerCallbacks({
   *   onProgress: (progress) => {
   *     updateProgressBar(progress.percentage);
   *     updateStatusText(`${progress.completed}/${progress.total} completed`);
   *   }
   * }, {
   *   debounceMs: 100 // Prevent excessive UI updates
   * });
   * ```
   *
   * @since 1.0.0
   */
  async triggerProgress(progress: ValidationProgress): Promise<void> {
    const context: ValidationContext = {
      totalRules: progress.total,
      processedRules: progress.completed,
      timestamp: Date.now(),
    };

    await this.executeCallbacks('onProgress', [progress], context, 'onProgress');
  }

  /**
   * Clears all registered callback collections and performs comprehensive cleanup.
   *
   * Removes all callback registrations and clears any pending debounce timers,
   * ensuring complete cleanup of callback system state. Useful for application
   * shutdown, testing scenarios, or resetting callback state.
   *
   * @public
   *
   * @example
   * ```typescript
   * // Complete callback system reset
   * callbackManager.clearCallbacks();
   * console.log('All callbacks cleared');
   * ```
   *
   * @example
   * ```typescript
   * // Testing scenario cleanup
   * afterEach(() => {
   *   callbackManager.clearCallbacks();
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Application shutdown cleanup
   * process.on('SIGTERM', () => {
   *   callbackManager.clearCallbacks();
   *   console.log('Callback system cleaned up');
   * });
   * ```
   *
   * @since 1.0.0
   */
  clearCallbacks(): void {
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    const count = this.registrations.size;
    this.registrations.clear();

    this.logger.debug(`Cleared ${count} callback registrations`);
  }

  /**
   * Retrieves the count of currently active callback registrations.
   *
   * Provides insight into the current number of active callback collections
   * registered with the manager. Useful for monitoring, debugging, and
   * performance analysis of callback system usage.
   *
   * @public
   * @returns {number} Number of active callback registrations
   *
   * @example
   * ```typescript
   * // Monitor callback registration count
   * const activeCallbacks = callbackManager.getActiveCallbackCount();
   * console.log(`Currently ${activeCallbacks} callback sets registered`);
   * ```
   *
   * @example
   * ```typescript
   * // Performance monitoring and optimization
   * if (callbackManager.getActiveCallbackCount() > 10) {
   *   console.warn('High number of callback registrations may impact performance');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Testing assertion for callback cleanup
   * expect(callbackManager.getActiveCallbackCount()).toBe(0);
   * ```
   *
   * @since 1.0.0
   */
  getActiveCallbackCount(): number {
    return this.registrations.size;
  }

  /**
   * Executes all registered callbacks for a specific validation event type.
   *
   * Internal method that orchestrates callback execution across all registered
   * callback collections for a given event type. Handles error isolation,
   * context propagation, and execution coordination with comprehensive logging.
   *
   * @private
   * @param {keyof ValidationCallbacks<T>} eventType - Type of validation event to execute
   * @param {unknown[]} args - Arguments to pass to callback functions
   * @param {ValidationContext} context - Validation context for this execution
   * @param {string} [debounceKey] - Optional debouncing key for rate limiting
   * @returns {Promise<void>} Promise that resolves when all callbacks complete
   *
   * @since 1.0.0
   */
  private async executeCallbacks(
    eventType: keyof ValidationCallbacks<T>,
    args: unknown[],
    context: ValidationContext,
    debounceKey?: string,
  ): Promise<void> {
    const registrations = Array.from(this.registrations.values());

    for (const registration of registrations) {
      // Verifica que callbacks sea un objeto
      if (!registration.callbacks || typeof registration.callbacks !== 'object') {
        continue;
      }
      const callback = registration.callbacks[eventType];
      if (!callback) {
        continue;
      }

      try {
        await this.executeCallback(registration, callback, args, debounceKey);
      } catch (error) {
        if (!registration.options.suppressErrors) {
          this.logger.error(`Callback execution failed for ${eventType}`, {
            callbackId: registration.id,
            error,
            context,
          });
        }
      }
    }
  }

  /**
   * Executes a single callback with comprehensive options handling and protection.
   *
   * Internal method that handles individual callback execution with advanced
   * features including debouncing, timeout protection, and error isolation.
   * Provides the core execution logic for callback invocation strategies.
   *
   * @private
   * @param {CallbackRegistration<T>} registration - Callback registration data
   * @param {Function} callback - Callback function to execute
   * @param {unknown[]} args - Arguments to pass to the callback
   * @param {string} [debounceKey] - Optional debouncing key for rate limiting
   * @returns {Promise<void>} Promise that resolves when callback execution completes
   *
   * @since 1.0.0
   */
  private async executeCallback(
    registration: CallbackRegistration<T>,
    callback: Function,
    args: unknown[],
    debounceKey?: string,
  ): Promise<void> {
    const { options } = registration;
    const key = debounceKey || registration.id;

    // Handle debouncing
    if (options.debounceMs && options.debounceMs > 0) {
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      return new Promise<void>(resolve => {
        const timer = setTimeout(async () => {
          this.debounceTimers.delete(key);
          // Only execute if the registration still exists
          if (this.registrations.has(registration.id)) {
            await this.executeCallbackDirect(registration, callback, args);
          }
          resolve();
        }, options.debounceMs);

        this.debounceTimers.set(key, timer);
      });
    }

    // Execute directly
    return this.executeCallbackDirect(registration, callback, args);
  }

  /**
   * Executes callback directly with timeout protection and execution tracking.
   *
   * Internal method that provides direct callback execution with configurable
   * timeout protection for both synchronous and asynchronous callbacks.
   * Updates execution tracking metrics for performance monitoring.
   *
   * @private
   * @param {CallbackRegistration<T>} registration - Callback registration data
   * @param {Function} callback - Callback function to execute directly
   * @param {unknown[]} args - Arguments to pass to the callback
   * @returns {Promise<void>} Promise that resolves when callback execution completes
   * @throws {Error} Throws timeout error if callback exceeds configured timeout
   *
   * @since 1.0.0
   */
  private async executeCallbackDirect(
    registration: CallbackRegistration<T>,
    callback: Function,
    args: unknown[],
  ): Promise<void> {
    const { options } = registration;
    registration.lastExecuted = Date.now();

    if (options.async) {
      // Execute asynchronously with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Callback timeout')), options.timeout);
      });

      const callbackPromise = Promise.resolve(callback.apply(null, args));
      await Promise.race([callbackPromise, timeoutPromise]);
    } else {
      // Execute synchronously
      callback.apply(null, args);
    }
  }

  /**
   * Generates a unique identifier for callback registration tracking.
   *
   * Internal utility method that creates unique callback identifiers combining
   * timestamp and random components for reliable callback registration tracking
   * and management operations.
   *
   * @private
   * @returns {string} Unique callback identifier string
   *
   * @since 1.0.0
   */
  private generateCallbackId(): string {
    return `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
