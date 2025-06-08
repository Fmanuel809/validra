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
 * Internal callback registration data
 */
interface CallbackRegistration<T extends Record<string, any>> {
  id: string;
  callbacks: ValidationCallbacks<T>;
  options: CallbackOptions;
  registeredAt: number;
  lastExecuted?: number;
}

/**
 * CallbackManager handles validation callback lifecycle and execution
 * Implements Single Responsibility Principle for callback management
 */
export class CallbackManager<T extends Record<string, any> = Record<string, any>> implements ICallbackManager<T> {
  private readonly registrations = new Map<string, CallbackRegistration<T>>();
  private readonly logger: ValidraLogger;
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Creates a new CallbackManager instance.
   * @param logger Optional logger for callback events.
   */
  constructor(logger?: ValidraLogger) {
    this.logger = logger || new ValidraLogger('error');
  }

  /**
   * Registers validation callbacks with options
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
   * Unregisters callbacks by ID
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
   * Triggers the onStart callback
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
   * Triggers the onRuleStart callback
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
   * Triggers the onRuleSuccess callback
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
   * Triggers the onRuleFailure callback
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
   * Triggers the onComplete callback
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
   * Triggers the onError callback
   */
  async triggerError(error: Error, context: ValidationContext): Promise<void> {
    await this.executeCallbacks('onError', [error, context], context);
  }

  /**
   * Triggers the onProgress callback
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
   * Clears all registered callbacks
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
   * Gets the count of active callbacks
   */
  getActiveCallbackCount(): number {
    return this.registrations.size;
  }

  /**
   * Executes callbacks for a specific event type
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
   * Executes a single callback with options handling
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
   * Executes callback directly with timeout handling
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
   * Generates a unique callback ID
   */
  private generateCallbackId(): string {
    return `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
