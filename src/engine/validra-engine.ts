import { ValidraLogger } from '@/utils/validra-logger';
import {
  StreamingValidationOptions,
  StreamingValidationResult,
  StreamingValidationSummary,
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
 * Main validation engine for Validra business rules processing.
 *
 * A comprehensive, high-performance validation engine that supports multiple validation
 * modes (synchronous, asynchronous, and streaming) with advanced features like memory
 * pooling, caching, error handling, and custom callbacks.
 *
 * Uses dependency injection and SOLID principles to compose validators, memory managers,
 * cache systems, callbacks, and error handling components.
 *
 * ## Features
 * - **Multiple Validation Modes**: Sync, async, and streaming validation
 * - **Memory Pool Management**: Optimized object reuse for high-frequency validations
 * - **Advanced Caching**: Path and helper function caching for improved performance
 * - **Error Handling**: Comprehensive error handling with recovery strategies
 * - **Custom Callbacks**: Extensible callback system for validation events
 * - **Metrics & Monitoring**: Built-in performance metrics and resource monitoring
 *
 * @example Basic Usage
 * ```typescript
 * // Simple validation
 * const rules = [
 *   { op: 'isEmail', field: 'email' },
 *   { op: 'gte', field: 'age', params: { value: 18 } }
 * ];
 * const engine = new ValidraEngine(rules);
 * const result = engine.validate({ email: 'user@example.com', age: 25 });
 * console.log(result.isValid); // true
 * ```
 *
 * @example Advanced Configuration
 * ```typescript
 * // Advanced options with callbacks
 * const options = {
 *   debug: true,
 *   enableMemoryPool: true,
 *   memoryPoolSize: 100,
 *   allowPartialValidation: true
 * };
 * const callbacks = [{
 *   name: 'validation-logger',
 *   onStart: (data) => console.log('Validation started'),
 *   onComplete: (result) => console.log('Validation completed', result)
 * }];
 * const engine = new ValidraEngine(rules, callbacks, options);
 * ```
 *
 * @example Async Validation
 * ```typescript
 * // Asynchronous validation
 * const result = await engine.validateAsync(data);
 * if (result.isValid) {
 *   console.log('Data is valid');
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 *
 * @see {@link ValidraEngineOptions} for configuration options
 * @see {@link ValidationCallbacks} for advanced callback system details
 * @see {@link ValidraResult} for result structure
 *
 * @public
 * @since 1.0.0
 * @category Engine
 */
export class ValidraEngine {
  private readonly rules: Rule[];
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
   * Creates a new instance of the Validra validation engine.
   *
   * Initializes all internal components using dependency injection pattern,
   * allowing for custom implementations and easy testing. Components include
   * validators, memory pool manager, cache manager, error handler, and callback manager.
   *
   * @param rules - Array of validation rules to apply to data objects
   * @param callbacks - Optional array of custom callbacks for validation events
   * @param options - Optional engine configuration options with sensible defaults
   * @param dependencies - Optional injectable dependencies for testing or advanced customization
   *
   * @example Basic Constructor
   * ```typescript
   * const rules = [
   *   { op: 'required', field: 'name' },
   *   { op: 'isEmail', field: 'email' }
   * ];
   * const engine = new ValidraEngine(rules);
   * ```
   *
   * @example With Options and Callbacks
   * ```typescript
   * const options = {
   *   debug: true,
   *   enableMemoryPool: true,
   *   memoryPoolSize: 50
   * };
   * const callbacks = [{
   *   name: 'logger',
   *   onComplete: (result) => console.log(result)
   * }];
   * const engine = new ValidraEngine(rules, callbacks, options);
   * ```
   *
   * @example With Custom Dependencies (for testing)
   * ```typescript
   * const mockDataExtractor = new MockDataExtractor();
   * const engine = new ValidraEngine(rules, [], {}, {
   *   dataExtractor: mockDataExtractor
   * });
   * ```
   *
   * @throws {Error} When rules array is empty or contains invalid rule definitions
   *
   * @public
   * @since 1.0.0
   */
  constructor(
    rules: Rule[],
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
      new SyncValidator(
        {
          debug: this.options.debug,
          allowPartialValidation: this.options.allowPartialValidation,
          throwOnUnknownField: this.options.throwOnUnknownField,
        },
        this.dataExtractor,
        this.memoryPoolManager,
      );

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
   * Performs synchronous validation of data against configured rules.
   *
   * This is the primary validation method for most use cases. It validates
   * the provided data object against all configured rules and returns a
   * comprehensive result object containing validation status, processed data,
   * and any validation errors.
   *
   * @template T - The type of the data object being validated
   * @param data - The data object to validate against the configured rules
   * @param callback - Optional callback function or callback name to execute after validation
   * @param options - Optional validation configuration options
   * @param options.failFast - If true, stops validation on first error (default: false)
   * @param options.maxErrors - Maximum number of errors to collect before stopping (default: Infinity)
   *
   * @returns A complete validation result object containing:
   *   - `isValid`: Boolean indicating if all validations passed
   *   - `data`: The original data object (potentially transformed)
   *   - `errors`: Object containing field-specific validation errors (if any)
   *   - `metadata`: Additional information about the validation process
   *
   * @throws {Error} When input data is invalid, null, or undefined
   * @throws {Error} When a critical validation error occurs that cannot be recovered
   *
   * @example Basic Validation
   * ```typescript
   * const data = { email: 'user@example.com', age: 25 };
   * const result = engine.validate(data);
   *
   * if (result.isValid) {
   *   console.log('Validation passed!');
   * } else {
   *   console.log('Validation errors:', result.errors);
   * }
   * ```
   *
   * @example With Options
   * ```typescript
   * // Stop on first error
   * const result = engine.validate(data, { failFast: true });
   *
   * // Limit error collection
   * const result = engine.validate(data, { maxErrors: 5 });
   * ```
   *
   * @see {@link ValidraResult} for detailed result structure
   * @see {@link validateAsync} for asynchronous validation
   * @see {@link validateStream} for streaming validation
   *
   * @public
   * @since 1.0.0
   */
  public validate<T extends Record<string, any>>(
    data: T,
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

      const duration = performance.now() - startTime;
      this.logValidationComplete(duration, result, false);
      if (result.errors && Object.keys(result.errors).length === 0) {
        delete result.errors; // Clean up errors to avoid memory leaks
      }

      return result;
    } catch (error) {
      const handledError = this.errorHandler.handleError(error as Error, {
        metadata: { data, rules: this.rules },
      });

      throw handledError;
    }
  }

  /**
   * Performs asynchronous validation of data against configured rules.
   *
   * This method provides asynchronous validation support for scenarios where
   * validation operations may involve async operations like database lookups,
   * API calls, or file system operations. It supports the same rule set as
   * synchronous validation but processes them asynchronously.
   *
   * @template T - The type of the data object being validated
   * @param data - The data object to validate against the configured rules
   * @param callback - Optional callback function or callback name to execute after validation
   *
   * @returns A Promise that resolves to a complete validation result object containing:
   *   - `isValid`: Boolean indicating if all validations passed
   *   - `data`: The original data object (potentially transformed)
   *   - `errors`: Object containing field-specific validation errors (if any)
   *   - `metadata`: Additional information about the validation process
   *
   * @throws {Error} When input data is invalid, null, or undefined
   * @throws {Error} When a critical validation error occurs that cannot be recovered
   *
   * @example Basic Async Validation
   * ```typescript
   * const data = { email: 'user@example.com', age: 25 };
   * const result = await engine.validateAsync(data);
   *
   * if (result.isValid) {
   *   console.log('Async validation passed!');
   * } else {
   *   console.log('Validation errors:', result.errors);
   * }
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   const result = await engine.validateAsync(data);
   *   // Handle result
   * } catch (error) {
   *   console.error('Validation failed:', error.message);
   * }
   * ```
   *
   * @see {@link validate} for synchronous validation
   * @see {@link validateStream} for streaming validation
   * @see {@link ValidraResult} for detailed result structure
   *
   * @public
   * @since 1.0.0
   */
  public async validateAsync<T extends Record<string, any>>(data: T): Promise<ValidraResult<T>> {
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

      const duration = performance.now() - startTime;
      this.logValidationComplete(duration, result, true);

      if (result.errors && Object.keys(result.errors).length === 0) {
        delete result.errors; // Clean up errors to avoid memory leaks
      }

      return result;
    } catch (error) {
      const handledError = this.errorHandler.handleError(error as Error, {
        metadata: { data, rules: this.rules },
      });

      throw handledError;
    }
  }

  /**
   * Performs streaming validation for large datasets or real-time data processing.
   *
   * This method provides efficient validation of large datasets by processing them
   * in configurable chunks, yielding intermediate results and providing a final
   * summary. Ideal for scenarios involving big data, real-time streams, or memory-
   * constrained environments.
   *
   * The method uses an async generator pattern, allowing for efficient memory usage
   * and progressive result processing without loading entire datasets into memory.
   *
   * @template TData - The type of individual data objects in the stream
   * @param dataStream - An iterable or async iterable containing data objects to validate
   * @param options - Optional streaming configuration options (see {@link StreamingValidationOptions} for details)
   *
   * @yields {StreamingValidationResult<TData>} Intermediate validation results for each processed chunk
   * @returns {Promise<StreamingValidationSummary>} Final summary containing overall statistics
   *
   * @throws {Error} When the data stream is invalid or cannot be processed
   * @throws {Error} When a critical validation error occurs during stream processing
   *
   * @example Basic Streaming Validation
   * ```typescript
   * const dataStream = [
   *   { email: 'user1@example.com', age: 25 },
   *   { email: 'user2@example.com', age: 30 },
   *   // ... thousands more items
   * ];
   *
   * for await (const result of engine.validateStream(dataStream)) {
   *   console.log(`Processed chunk: ${result.processedCount} items`);
   *   console.log(`Valid items: ${result.validCount}`);
   *   console.log(`Invalid items: ${result.invalidCount}`);
   * }
   * ```
   *
   * @example With Chunk Completion Monitoring
   * ```typescript
   * const options = {
   *   chunkSize: 50,
   *   onChunkComplete: (result) => {
   *     console.log(`Chunk completed: ${result.processedCount} items processed`);
   *   }
   * };
   *
   * const generator = engine.validateStream(dataStream, options);
   * const summary = await generator.return(); // Get final summary
   * console.log(`Total processed: ${summary.totalProcessed}`);
   * console.log(`Overall success rate: ${summary.successRate}%`);
   * ```
   *
   * @example Error Handling in Streams
   * ```typescript
   * try {
   *   for await (const result of engine.validateStream(dataStream)) {
   *     if (result.hasErrors) {
   *       console.warn('Errors in current chunk:', result.errors);
   *     }
   *   }
   * } catch (error) {
   *   console.error('Stream validation failed:', error.message);
   * }
   * ```
   *
   * @see {@link validate} for synchronous validation
   * @see {@link validateAsync} for asynchronous validation
   * @see {@link StreamingValidationOptions} for detailed options
   * @see {@link StreamingValidationResult} for chunk result structure
   * @see {@link StreamingValidationSummary} for final summary structure
   *
   * @public
   * @since 1.0.0
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
   * Retrieves comprehensive performance and usage metrics from all engine components.
   *
   * This method provides detailed insights into the engine's performance characteristics,
   * resource utilization, and operational statistics. Useful for monitoring, debugging,
   * performance optimization, and capacity planning.
   *
   * The metrics include information from all major engine components including rule
   * compilation, data extraction, memory pool usage, caching effectiveness, error
   * handling statistics, and callback execution metrics.
   *
   * @returns A comprehensive metrics object containing:
   *   - `ruleCompiler`: Rule compilation and caching statistics
   *   - `dataExtractor`: Data extraction and path resolution metrics
   *   - `memoryPool`: Memory pool utilization and performance data
   *   - `cache`: Cache hit rates and memory usage for all cache types
   *   - `errorHandler`: Error occurrence, recovery, and handling statistics
   *   - `callbackManager`: Callback registration and execution metrics
   *
   * @example Basic Metrics Retrieval
   * ```typescript
   * const metrics = engine.getMetrics();
   * console.log('Cache hit rate:', metrics.cache.pathCache.hitRate);
   * console.log('Memory pool efficiency:', metrics.memoryPool.hitRate);
   * console.log('Total validations:', metrics.ruleCompiler.totalCompilations);
   * ```
   *
   * @example Performance Monitoring
   * ```typescript
   * // Monitor performance over time
   * setInterval(() => {
   *   const metrics = engine.getMetrics();
   *
   *   if (metrics.cache.pathCache.hitRate < 0.8) {
   *     console.warn('Low cache hit rate detected');
   *   }
   *
   *   if (metrics.memoryPool.hitRate < 0.9) {
   *     console.warn('Memory pool may need tuning');
   *   }
   *
   *   if (metrics.errorHandler.fatalErrors > 0) {
   *     console.error('Fatal errors detected!');
   *   }
   * }, 10000);
   * ```
   *
   * @example Resource Usage Analysis
   * ```typescript
   * const metrics = engine.getMetrics();
   * const totalMemoryUsage = metrics.cache.totalMemoryUsage +
   *                         (metrics.memoryPool.poolSizes.validationResult * 1000);
   *
   * console.log(`Total estimated memory usage: ${totalMemoryUsage} bytes`);
   * console.log(`Active callbacks: ${metrics.callbackManager.activeCallbacks}`);
   * ```
   *
   * @see {@link clearCaches} for resource cleanup
   * @see {@link CacheMetrics} for cache-specific metrics
   * @see {@link MemoryPoolMetrics} for memory pool metrics
   * @see {@link ErrorStatistics} for error handling metrics
   *
   * @public
   * @since 1.0.0
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
    // Preload helpers for better performance
    const operations = this.rules.map(rule => rule.op);
    this.cacheManager.preloadHelpers(operations);

    this.logger.info(`Engine initialized with ${this.rules.length} rules`, {
      debug: this.options.debug,
      rulesCount: this.rules.length,
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
    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data) ||
      data instanceof Date ||
      typeof data === 'function'
    ) {
      const error = new Error('Data must be a valid object');
      this.errorHandler.handleError(error, {
        metadata: { data },
      });
      throw error;
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
