import { ValidraLogger } from '@/utils/validra-logger';
import {
  StreamingValidationOptions,
  StreamingValidationResult,
  StreamingValidationSummary,
  ValidraCallback,
  ValidraEngineOptions,
  ValidraResult,
} from './interfaces';
import { Rule } from './rule';

// Import all our new components
import { ICacheManager } from './interfaces/cache-manager.interface';
import { ICallbackManager } from './interfaces/callback-manager.interface';
import { IDataExtractor } from './interfaces/data-extractor.interface';
import { IErrorHandler } from './interfaces/error-handler.interface';
import { IMemoryPoolManager } from './interfaces/memory-pool-manager.interface';
import { IRuleCompiler } from './interfaces/rule-compiler.interface';
import { IAsyncValidator, IStreamValidator, ISyncValidator } from './interfaces/validators.interface';

// Import component implementations
import { AsyncValidator } from './components/async-validator';
import { CacheManager } from './components/cache-manager';
import { CallbackManager } from './components/callback-manager';
import { DataExtractor } from './components/data-extractor';
import { ErrorHandler } from './components/error-handler';
import { MemoryPoolManager } from './components/memory-pool-manager';
import { RuleCompiler } from './components/rule-compiler';
import { StreamValidator } from './components/stream-validator';
import { SyncValidator } from './components/sync-validator';

/**
 * Main validation engine for Validra.
 *
 * Uses dependency injection and SOLID principles to compose validators,
 * memory managers, cache, callbacks, and error handling.
 *
 * @remarks
 * Supports synchronous, asynchronous, and streaming validation, as well as metrics and resource cleanup.
 *
 * @example
 * const engine = new ValidraEngine(rules);
 * const result = engine.validate({ foo: 'bar' });
 *
 * @category Engine
 */
export class ValidraEngine {
  private readonly rules: Rule[];
  private readonly callbacks: ValidraCallback[];
  private readonly options: Required<ValidraEngineOptions>;
  private readonly logger: ValidraLogger;

  private readonly ruleCompiler: IRuleCompiler;
  private readonly dataExtractor: IDataExtractor;
  private readonly memoryPoolManager: IMemoryPoolManager;
  private readonly syncValidator: ISyncValidator;
  private readonly asyncValidator: IAsyncValidator;
  private readonly streamValidator: IStreamValidator;
  private readonly callbackManager: ICallbackManager;
  private readonly errorHandler: IErrorHandler;
  private readonly cacheManager: ICacheManager;

  /**
   * Creates a new instance of the validation engine.
   *
   * @param rules - Validation rules to apply.
   * @param callbacks - Custom callbacks for validation events.
   * @param options - Engine configuration options.
   * @param dependencies - Injectable dependencies for testing or advanced customization.
   */
  constructor(
    rules: Rule[],
    callbacks: ValidraCallback[] = [],
    options: ValidraEngineOptions = {},
    dependencies?: {
      ruleCompiler?: IRuleCompiler;
      dataExtractor?: IDataExtractor;
      memoryPoolManager?: IMemoryPoolManager;
      syncValidator?: ISyncValidator;
      asyncValidator?: IAsyncValidator;
      streamValidator?: IStreamValidator;
      callbackManager?: ICallbackManager;
      errorHandler?: IErrorHandler;
      cacheManager?: ICacheManager;
    },
  ) {
    this.rules = rules;
    this.callbacks = callbacks;
    this.options = {
      debug: false,
      throwOnUnknownField: false,
      allowPartialValidation: false,
      enableMemoryPool: true,
      memoryPoolSize: 25,
      enableStreaming: false,
      streamingChunkSize: 100,
      ...options,
    };

    this.logger = new ValidraLogger('ValidraEngine');

    // Initialize components (dependency injection pattern)
    this.ruleCompiler = dependencies?.ruleCompiler ?? new RuleCompiler(this.logger);

    this.dataExtractor = dependencies?.dataExtractor ?? new DataExtractor();

    this.memoryPoolManager =
      dependencies?.memoryPoolManager ??
      new MemoryPoolManager(this.options.enableMemoryPool, this.options.memoryPoolSize);

    this.cacheManager =
      dependencies?.cacheManager ??
      new CacheManager({
        enablePathCache: true,
        enableHelperCache: true,
        maxPathCacheSize: 50,
        maxHelperCacheSize: 100,
      });

    this.syncValidator =
      dependencies?.syncValidator ??
      new SyncValidator({
        debug: this.options.debug,
        allowPartialValidation: this.options.allowPartialValidation,
        throwOnUnknownField: this.options.throwOnUnknownField,
      });

    this.asyncValidator =
      dependencies?.asyncValidator ?? new AsyncValidator(this.ruleCompiler, this.dataExtractor, this.memoryPoolManager);

    this.streamValidator =
      dependencies?.streamValidator ??
      new StreamValidator(this.ruleCompiler, this.dataExtractor, this.memoryPoolManager);

    this.callbackManager = dependencies?.callbackManager ?? new CallbackManager(this.logger);

    this.errorHandler =
      dependencies?.errorHandler ??
      new ErrorHandler(this.logger, {
        enableRecovery: this.options.allowPartialValidation,
        logErrors: this.options.debug,
      });

    // Initialize components with rules and callbacks
    this.initializeComponents();
  }

  /**
   * Synchronously validates data.
   *
   * @typeParam T - Type of the data to validate.
   * @param data - Data object to validate.
   * @param callback - Callback to execute after validation completes.
   * @param options - Validation options (failFast, maxErrors).
   * @returns Validation result.
   * @throws Error if the data is invalid or a validation error occurs.
   */
  public validate<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void),
    options?: { failFast?: boolean; maxErrors?: number },
  ): ValidraResult<T> {
    const startTime = performance.now();

    try {
      // Input validation
      this.validateInputData(data);

      // Trigger start callback
      this.callbackManager.triggerStart(data, this.rules);

      // Perform validation using specialized sync validator
      const result = this.syncValidator.validate(data, this.rules, {
        failFast: options?.failFast ?? false,
        maxErrors: options?.maxErrors ?? Infinity,
      });

      // Trigger completion callback
      this.callbackManager.triggerComplete(result);

      // Execute user callback if provided
      this.executeCallback(callback, result);

      const duration = performance.now() - startTime;
      this.logValidationComplete(duration, result, false);

      return result;
    } catch (error) {
      const handledError = this.errorHandler.handleError(error as Error, {
        metadata: { data, rules: this.rules },
      });

      throw handledError;
    }
  }

  /**
   * Asynchronously validates data.
   *
   * @typeParam T - Type of the data to validate.
   * @param data - Data object to validate.
   * @param callback - Callback to execute after validation completes.
   * @returns Promise with the validation result.
   * @throws Error if the data is invalid or a validation error occurs.
   */
  public async validateAsync<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void | Promise<void>),
  ): Promise<ValidraResult<T>> {
    const startTime = performance.now();

    try {
      // Input validation
      this.validateInputData(data);

      // Trigger start callback
      await this.callbackManager.triggerStart(data, this.rules);

      // Perform async validation using specialized async validator
      const result = await this.asyncValidator.validateAsync(data, this.rules);

      // Trigger completion callback
      await this.callbackManager.triggerComplete(result);

      // Execute user callback if provided
      await this.executeCallbackAsync(callback, result);

      const duration = performance.now() - startTime;
      this.logValidationComplete(duration, result, true);

      return result;
    } catch (error) {
      const handledError = this.errorHandler.handleError(error as Error, {
        metadata: { data, rules: this.rules },
      });

      throw handledError;
    }
  }

  /**
   * Asynchronously validates a data stream, useful for large volumes.
   *
   * @typeParam TData - Type of the data to validate in the stream.
   * @param dataStream - Iterable or AsyncIterable of data objects to validate.
   * @param options - Streaming validation options.
   * @yields Partial validation results for each chunk.
   * @returns A final summary of the validation after the stream ends.
   * @throws Error if an error occurs during validation.
   */
  public async *validateStream<TData extends Record<string, any>>(
    dataStream: Iterable<TData> | AsyncIterable<TData>,
    options?: StreamingValidationOptions,
  ): AsyncGenerator<StreamingValidationResult<TData>, StreamingValidationSummary, unknown> {
    if (!this.options.enableStreaming) {
      this.logger.warn('Streaming validation is not enabled', {
        message: 'Enable streaming in engine options for better performance',
      });
    }

    try {
      // Create validator function that uses our rules
      const validator = (item: TData) => this.validate(item);

      // Delegate to stream validator
      return yield* this.streamValidator.validateStream(dataStream, validator, options);
    } catch (error) {
      const handledError = this.errorHandler.handleError(error as Error, {
        metadata: { rules: this.rules },
      });

      throw handledError;
    }
  }

  /**
   * Returns usage and performance metrics from internal engine components.
   *
   * @returns An object with metrics for compiler, extractor, memory, cache, errors, and callbacks.
   */
  public getMetrics() {
    return {
      /** Rule compiler metrics. */
      ruleCompiler: this.ruleCompiler.getMetrics(),
      /** Data extractor metrics. */
      dataExtractor: this.dataExtractor.getMetrics(),
      /** Memory pool metrics. */
      memoryPool: this.memoryPoolManager.getMetrics(),
      /** Cache manager metrics. */
      cache: this.cacheManager.getMetrics(),
      /** Error handler metrics. */
      errorHandler: this.errorHandler.getStatistics(),
      /** Callback manager metrics. */
      callbackManager: {
        /** Number of active callbacks. */
        activeCallbacks: this.callbackManager.getActiveCallbackCount(),
      },
    };
  }

  /**
   * Clears all caches and memory pools for resource management.
   *
   * @remarks
   * Useful for freeing resources in long-running processes or tests.
   */
  public clearCaches(): void {
    this.cacheManager.clear();
    this.memoryPoolManager.clear();
    this.dataExtractor.clearCache();
    this.ruleCompiler.clearCache();
  }

  // Private helper methods

  /**
   * Initializes internal components, registers callbacks, and preloads helpers.
   * @internal
   */
  private initializeComponents(): void {
    // Register callbacks with callback manager
    for (const callback of this.callbacks) {
      this.callbackManager.registerCallbacks({
        onComplete: callback.callback as any,
      });
    }

    // Preload helpers for better performance
    const operations = this.rules.map(rule => rule.op);
    this.cacheManager.preloadHelpers(operations);

    this.logger.info(`Engine initialized with ${this.rules.length} rules`, {
      debug: this.options.debug,
      rulesCount: this.rules.length,
      callbacksCount: this.callbacks.length,
      memoryPoolEnabled: this.options.enableMemoryPool,
      streamingEnabled: this.options.enableStreaming,
    });
  }

  /**
   * Validates that the input data is a valid object.
   * @param data - The data to validate.
   * @throws Error if the data is not a valid object.
   * @internal
   */
  private validateInputData(data: any): void {
    if (!data || typeof data !== 'object') {
      const error = new Error('Data must be a valid object');
      this.errorHandler.handleError(error, {
        metadata: { data },
      });
      throw error;
    }
  }

  /**
   * Executes a callback after synchronous validation.
   * @typeParam T - Type of the validated data.
   * @param callback - Callback function or name.
   * @param result - Validation result.
   * @throws Error if the callback is not found or invalid.
   * @internal
   */
  private executeCallback<T extends Record<string, any>>(
    callback: string | ((result: ValidraResult<T>) => void) | undefined,
    result: ValidraResult<T>,
  ): void {
    if (!callback) {
      return;
    }

    if (typeof callback === 'string') {
      const cb = this.callbacks.find(cb => cb.name === callback);
      if (cb) {
        cb.callback(result as ValidraResult<Record<string, any>>);
      } else {
        throw new Error(`Callback with name "${callback}" not found.`);
      }
    } else if (typeof callback === 'function') {
      callback(result);
    } else {
      throw new Error('Callback must be a string or a function.');
    }
  }

  /**
   * Executes a callback after asynchronous validation.
   * @typeParam T - Type of the validated data.
   * @param callback - Callback function or name.
   * @param result - Validation result.
   * @throws Error if the callback is not found or invalid.
   * @internal
   */
  private async executeCallbackAsync<T extends Record<string, any>>(
    callback: string | ((result: ValidraResult<T>) => void | Promise<void>) | undefined,
    result: ValidraResult<T>,
  ): Promise<void> {
    if (!callback) {
      return;
    }

    if (typeof callback === 'string') {
      const cb = this.callbacks.find(cb => cb.name === callback);
      if (cb) {
        await cb.callback(result as ValidraResult<Record<string, any>>);
      } else {
        throw new Error(`Callback with name "${callback}" not found.`);
      }
    } else if (typeof callback === 'function') {
      await callback(result);
    } else {
      throw new Error('Callback must be a string or a function.');
    }
  }

  /**
   * Logs validation completion time and warnings for slow validations.
   * @param duration - Time taken for validation in milliseconds.
   * @param result - Validation result object.
   * @param isAsync - Whether the validation was asynchronous.
   * @internal
   */
  private logValidationComplete(duration: number, result: ValidraResult<any>, isAsync = false): void {
    const type = isAsync ? 'Async validation' : 'Validation';

    if (this.options.debug) {
      this.logger.debug(`${type} completed in ${duration.toFixed(2)}ms`, {
        isValid: result.isValid,
        duration: `${duration.toFixed(2)}ms`,
        errorsFound: result.errors ? Object.keys(result.errors) : [],
      });
    }

    // Log warning for slow validations
    if (duration > 100) {
      this.logger.warn(`Slow ${type.toLowerCase()} detected`, {
        duration: `${duration.toFixed(2)}ms`,
        rulesCount: this.rules.length,
      });
    }
  }
}
