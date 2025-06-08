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
 * ValidraEngine using Dependency Injection and SOLID Principles
 *
 * This version uses a composition of specialized components, each following
 * Single Responsibility Principle, replacing the original monolithic implementation.
 */
export class ValidraEngine {
  private readonly rules: Rule[];
  private readonly callbacks: ValidraCallback[];
  private readonly options: Required<ValidraEngineOptions>;
  private readonly logger: ValidraLogger;

  // Injected components following Dependency Inversion Principle
  private readonly ruleCompiler: IRuleCompiler;
  private readonly dataExtractor: IDataExtractor;
  private readonly memoryPoolManager: IMemoryPoolManager;
  private readonly syncValidator: ISyncValidator;
  private readonly asyncValidator: IAsyncValidator;
  private readonly streamValidator: IStreamValidator;
  private readonly callbackManager: ICallbackManager;
  private readonly errorHandler: IErrorHandler;
  private readonly cacheManager: ICacheManager;

  constructor(
    rules: Rule[],
    callbacks: ValidraCallback[] = [],
    options: ValidraEngineOptions = {},
    // Optional dependency injection for testing
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
   * Synchronous validation using composition pattern
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
   * Asynchronous validation using composition pattern
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
   * Streaming validation for large datasets
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
   * Get comprehensive metrics from all components
   */
  public getMetrics() {
    return {
      ruleCompiler: this.ruleCompiler.getMetrics(),
      dataExtractor: this.dataExtractor.getMetrics(),
      memoryPool: this.memoryPoolManager.getMetrics(),
      cache: this.cacheManager.getMetrics(),
      errorHandler: this.errorHandler.getStatistics(),
      callbackManager: {
        activeCallbacks: this.callbackManager.getActiveCallbackCount(),
      },
    };
  }

  /**
   * Clear all caches and pools for memory management
   */
  public clearCaches(): void {
    this.cacheManager.clear();
    this.memoryPoolManager.clear();
    this.dataExtractor.clearCache();
    this.ruleCompiler.clearCache();
  }

  /**
   * Get memory pool metrics (backward compatibility)
   */
  public getMemoryPoolMetrics() {
    return this.memoryPoolManager.getMetrics();
  }

  /**
   * Clear memory pool (backward compatibility)
   */
  public clearMemoryPool(): void {
    this.memoryPoolManager.clear();
  }

  // Private helper methods

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

  private validateInputData(data: any): void {
    if (!data || typeof data !== 'object') {
      const error = new Error('Data must be a valid object');
      this.errorHandler.handleError(error, {
        metadata: { data },
      });
      throw error;
    }
  }

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
