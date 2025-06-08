import { helpersActions } from '@/dsl';
import { ValidraLogger } from '@/utils/validra-logger';
import {
  StreamingValidationOptions,
  StreamingValidationResult,
  StreamingValidationSummary,
  ValidraCallback,
  ValidraEngineOptions,
  ValidraResult,
} from './interfaces';
import { MemoryPoolFactories, ValidraMemoryPool } from './memory-pool';
import { Rule } from './rule';
import { ValidraStreamingValidator } from './streaming-validator';

/**
 * Interface for compiled rules with pre-computed data
 */
interface CompiledRule {
  original: Rule;
  helper: any;
  pathSegments: string[];
  hasParams: boolean;
}

export class ValidraEngine {
  private rules: Rule[];
  private callbacks: ValidraCallback[];
  private options: ValidraEngineOptions;
  private helperCache = new Map<string, any>();
  private pathCache = new Map<string, string[]>();
  private compiledRules: CompiledRule[] = [];
  private logger: ValidraLogger;
  private memoryPool: ValidraMemoryPool;
  private streamingValidator: ValidraStreamingValidator<any>;
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly MAX_PATH_CACHE_SIZE = 50;

  constructor(rules: Rule[], callbacks: ValidraCallback[] = [], options: ValidraEngineOptions = {}) {
    this.rules = rules;
    this.callbacks = callbacks;
    this.options = {
      debug: false,
      throwOnUnknownField: false,
      allowPartialValidation: false,
      enableMemoryPool: true,
      memoryPoolSize: 25, // Smaller default size to reduce overhead
      enableStreaming: false,
      streamingChunkSize: 100,
      ...options,
    };

    // Initialize logger
    this.logger = new ValidraLogger('ValidraEngine');

    // Initialize Memory Pool for high-frequency scenarios
    this.memoryPool = new ValidraMemoryPool(this.options.memoryPoolSize || 25);

    // Initialize Streaming Validator for large datasets
    this.streamingValidator = new ValidraStreamingValidator();

    // Compile rules for optimization
    this.compiledRules = this.compileRules(rules);

    // Preload helpers used by rules
    this.preloadHelpers();

    this.logger.info(`Engine initialized with ${rules.length} rules`, {
      debug: this.options.debug,
      rulesCount: rules.length,
      callbacksCount: callbacks.length,
      memoryPoolEnabled: this.options.enableMemoryPool,
      streamingEnabled: this.options.enableStreaming,
    });
  }

  /**
   * Calculate data size in bytes with protection against massive data
   */
  private getDataSize(data: any): number {
    try {
      const str = JSON.stringify(data);
      // Protect against extremely large data (>10MB)
      if (str.length > 10 * 1024 * 1024) {
        return -1; // Signal that data is too large
      }
      return str.length;
    } catch (error) {
      // Handle circular references or non-serializable data
      this.logger.warn('Failed to calculate data size', error);
      return -1;
    }
  }

  /**
   * Format data size for logging with consistent formatting
   */
  private formatDataSize(dataSize: number): string {
    return dataSize === -1 ? 'unknown (large/circular)' : `${dataSize} bytes`;
  }

  /**
   * Validate unknown field if throwOnUnknownField is enabled
   */
  private validateUnknownField(compiledRule: CompiledRule, value: unknown): void {
    if (this.options.throwOnUnknownField && value === undefined && compiledRule.pathSegments.length === 1) {
      const errorMsg = `Unknown field: ${compiledRule.original.field}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Build arguments array for rule execution with parameter validation
   * Uses memory pool only for larger arrays to avoid overhead
   */
  private buildRuleArguments(compiledRule: CompiledRule, value: unknown): unknown[] {
    const { helper, original } = compiledRule;

    if (!compiledRule.hasParams || helper.params.length === 0) {
      return [value];
    }

    const params = (original as any).params || {};
    const paramCount = helper.params.length;

    // Only use memory pool for larger argument arrays (> 1 parameter)
    // AND when validation frequency is expected to be high
    const shouldUsePool = this.options.enableMemoryPool && paramCount > 1;
    const args = shouldUsePool
      ? this.memoryPool.get('argumentsArray', MemoryPoolFactories.argumentsArray)
      : new Array(1 + paramCount);

    // Ensure proper size
    args.length = 1 + paramCount;
    args[0] = value;

    // Build arguments array based on helper.params with validation
    for (let i = 0; i < paramCount; i++) {
      const paramName = helper.params[i];
      const paramValue = params[paramName];

      if (paramValue === undefined) {
        throw new Error(`Required parameter '${paramName}' is missing for operation '${original.op}'`);
      }

      args[i + 1] = paramValue;
    }

    return args;
  }

  /**
   * Return arguments array to memory pool only if it was pooled
   */
  private returnArgumentsArray(args: unknown[]): void {
    // Only return to pool if it was large enough to be pooled (> 2 parameters)
    if (this.options.enableMemoryPool && args.length > 3) {
      this.memoryPool.return('argumentsArray', args, MemoryPoolFactories.resetArgumentsArray);
    }
  }

  /**
   * Validate input data with consistent error handling
   */
  private validateInputData(data: any): void {
    if (!data || typeof data !== 'object') {
      this.logger.error('Invalid data provided for validation', {
        dataType: typeof data,
        isNull: data === null,
      });
      throw new Error('Data must be a valid object');
    }
  }

  /**
   * Log validation completion with performance metrics
   */
  private logValidationComplete(duration: number, dataSize: number, result: ValidraResult<any>, isAsync = false): void {
    const type = isAsync ? 'Async validation' : 'Validation';

    this.debugLog(() => `${type} completed in ${duration.toFixed(2)}ms`, {
      isValid: result.isValid,
      duration: `${duration.toFixed(2)}ms`,
      dataSize: this.formatDataSize(dataSize),
      errorsFound: result.errors ? Object.keys(result.errors) : [],
    });

    // Log warning para validaciones lentas
    if (duration > 100) {
      this.logger.warn(`Slow ${type.toLowerCase()} detected`, {
        duration: `${duration.toFixed(2)}ms`,
        rulesCount: this.compiledRules.length,
        dataSize: this.formatDataSize(dataSize),
      });
    }
  }

  public validate<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void),
    options?: { failFast?: boolean; maxErrors?: number },
  ): ValidraResult<T> {
    const startTime = performance.now();

    // Validación de entrada
    this.validateInputData(data);

    // Check data size for performance monitoring
    const dataSize = this.getDataSize(data);
    if (dataSize === -1) {
      this.logger.warn('Large or circular data detected', {
        message: 'Data size could not be calculated - possible circular references or very large data',
      });
    }

    if (this.compiledRules.length === 0) {
      this.debugLog(() => 'No rules defined, validation passed');
      return { isValid: true, data };
    }

    const { failFast = false, maxErrors = Infinity } = options || {};

    // Use memory pool for result object only in high-frequency scenarios
    // For simple validations, regular object creation is faster
    let result: ValidraResult<T>;
    const shouldPoolResult = this.options.enableMemoryPool && this.compiledRules.length > 2;

    if (shouldPoolResult) {
      const pooledResult = this.memoryPool.get('validationResult', MemoryPoolFactories.validationResult);
      result = {
        isValid: true,
        data,
        errors: pooledResult.errors || {},
      };
    } else {
      result = { isValid: true, data, errors: {} };
    }

    let errorCount = 0;

    this.debugLog(() => `Starting validation with ${this.compiledRules.length} rules`, {
      failFast,
      maxErrors,
      dataKeys: Object.keys(data),
      memoryPoolEnabled: this.options.enableMemoryPool,
    });

    for (const compiledRule of this.compiledRules) {
      let args: unknown[] | null = null;
      try {
        const value = this.getValue(data, compiledRule.pathSegments);

        // Validar campo desconocido si está habilitado
        this.validateUnknownField(compiledRule, value);

        // Build arguments with memory pool optimization
        args = this.buildRuleArguments(compiledRule, value);
        const isValid = this.applyRuleWithArgs(compiledRule, args);

        this.debugLog(
          () =>
            `Rule ${compiledRule.original.op} on field ${compiledRule.original.field}: ${isValid ? 'PASS' : 'FAIL'}`,
          { value, hasValue: value !== undefined },
        );

        if (!isValid) {
          result.isValid = false;
          this.addError(result, compiledRule.original);
          errorCount++;

          if (failFast || errorCount >= maxErrors) {
            this.debugLog(() => 'Stopping validation early', {
              reason: failFast ? 'failFast' : 'maxErrors',
              errorCount,
            });
            break;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Error applying rule ${compiledRule.original.op} on field ${compiledRule.original.field}`, {
          error: errorMessage,
          rule: compiledRule.original,
        });

        if (!this.options.allowPartialValidation) {
          this.logger.error(`Rule validation failed for field "${compiledRule.original.field}"`, {
            error: errorMessage,
          });
        }

        result.isValid = false;
        this.addError(result, compiledRule.original, `Validation error: ${errorMessage}`);
        errorCount++;

        if (failFast || errorCount >= maxErrors) {
          break;
        }
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.logValidationComplete(duration, dataSize, result, false);

    // Ejecutar callback si se proporciona
    this.executeCallback(callback, result);

    // Create a clean result copy to return (avoiding memory pool reference issues)
    const finalResult: ValidraResult<T> = {
      isValid: result.isValid,
      data: result.data,
    };

    if (result.errors) {
      finalResult.errors = result.errors;
    }

    // Return result to memory pool if it was pooled
    if (shouldPoolResult) {
      this.memoryPool.return('validationResult', result, MemoryPoolFactories.resetValidationResult);
    }

    return finalResult;
  }

  public async validateAsync<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void | Promise<void>),
  ): Promise<ValidraResult<T>> {
    const startTime = performance.now();

    // Validación de entrada
    this.validateInputData(data);

    // Check data size for performance monitoring
    const dataSize = this.getDataSize(data);
    if (dataSize === -1) {
      this.logger.warn('Large or circular data detected in async validation', {
        message: 'Data size could not be calculated - possible circular references or very large data',
      });
    }

    if (this.compiledRules.length === 0) {
      this.debugLog(() => 'No rules defined, validation passed');
      return { isValid: true, data };
    }

    const result: ValidraResult<T> = {
      isValid: true,
      data,
      errors: {},
    };

    this.debugLog(() => `Starting async validation with ${this.compiledRules.length} rules`);

    for (const compiledRule of this.compiledRules) {
      try {
        const value = this.getValue(data, compiledRule.pathSegments);

        // Validar campo desconocido si está habilitado
        this.validateUnknownField(compiledRule, value);

        const isValid = await this.applyRuleAsync(compiledRule, value);

        this.debugLog(
          () =>
            `Rule ${compiledRule.original.op} on field ${compiledRule.original.field}: ${isValid ? 'PASS' : 'FAIL'}`,
        );

        if (!isValid) {
          result.isValid = false;
          this.addError(result, compiledRule.original);
        }
      } catch (error) {
        this.debugLog(
          () =>
            `Error applying rule ${compiledRule.original.op} on
            field ${compiledRule.original.field}: ${(error as Error).message}`,
        );

        if (!this.options.allowPartialValidation) {
          throw new Error(
            `Rule validation failed for field "${compiledRule.original.field}": ${(error as Error).message}`,
          );
        }

        // En modo parcial, tratar como error de validación
        result.isValid = false;
        this.addError(result, compiledRule.original, `Validation error: ${(error as Error).message}`);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.logValidationComplete(duration, dataSize, result, true);

    // Ejecutar callback si se proporciona
    await this.executeCallbackAsync(callback, result);

    return result;
  }

  /**
   * Optimized getValue with pre-computed path segments and array validation
   */
  private getValue(data: any, pathSegments: string[]): unknown {
    if (pathSegments.length === 1 && pathSegments[0]) {
      return data?.[pathSegments[0]];
    }

    let current = data;
    for (const segment of pathSegments) {
      if (current === null) {
        return undefined;
      }

      // Handle array index access with validation
      if (Array.isArray(current)) {
        const index = parseInt(segment, 10);
        if (isNaN(index) || index < 0 || index >= current.length) {
          return undefined;
        }
        current = current[index];
      } else {
        current = current[segment];
      }
    }
    return current;
  }

  /**
   * Optimized addError with reduced object access
   */
  private addError<T extends Record<string, any>>(result: ValidraResult<T>, rule: Rule, customMessage?: string): void {
    if (!result.errors) {
      result.errors = {} as any;
    }

    const errors = result.errors!;
    const field = rule.field as keyof T;
    const fieldErrors = errors[field] || (errors[field] = [] as any);

    (fieldErrors as any[]).push({
      message: customMessage || rule.message || `Validation [${rule.op}] failed for ${rule.field}`,
      code: rule.code || 'VALIDATION_ERROR',
    });
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

  /**
   * Compile rules for optimization during constructor
   */
  private compileRules(rules: Rule[]): CompiledRule[] {
    const startTime = performance.now();

    // Pre-allocate array for better performance
    const compiled: CompiledRule[] = new Array(rules.length);

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]!; // Safe because we're iterating within bounds
      const helper = helpersActions.getHelperResolverSchema(rule.op as any);
      if (!helper) {
        throw new Error(`Unknown operation: ${rule.op} at rule index ${i}`);
      }

      compiled[i] = {
        original: rule,
        helper,
        pathSegments: this.getPathSegments(rule.field), // Use cached path segments
        hasParams: 'params' in rule && rule.params !== undefined,
      };
    }

    const endTime = performance.now();
    if (this.options.debug) {
      this.logger.debug(`Compiled ${rules.length} rules in ${(endTime - startTime).toFixed(2)}ms`);
    }

    return compiled;
  }

  /**
   * Preload helpers used by rules for performance
   */
  private preloadHelpers(): void {
    const startTime = performance.now();
    const uniqueOps = new Set(this.rules.map(rule => rule.op));

    for (const op of uniqueOps) {
      try {
        const helper = helpersActions.getHelperResolverSchema(op as any);
        if (helper) {
          this.helperCache.set(op, helper);
        }
      } catch (error) {
        if (this.options.debug) {
          this.logger.warn(`Helper not found during preload: ${op}`, error);
        }
      }
    }

    const endTime = performance.now();
    if (this.options.debug) {
      this.logger.debug(`Preloaded ${this.helperCache.size} helpers in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  /**
   * Apply compiled rule with pre-built arguments for memory pool optimization
   */
  private applyRuleWithArgs(compiledRule: CompiledRule, args: unknown[]): boolean {
    try {
      const { helper, original } = compiledRule;
      if (!helper) {
        throw new Error(`Unknown operation: ${original.op}`);
      }

      const isValid = helper.resolver(...args);

      // Return arguments to pool if enabled
      this.returnArgumentsArray(args);

      return original.negative ? !isValid : isValid;
    } catch (error) {
      // Return arguments to pool even on error
      this.returnArgumentsArray(args);

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Error in operation '${compiledRule.original.op}' on field '${compiledRule.original.field}': ${errorMessage}`,
      );
    }
  }

  /**
   * Apply compiled rule for optimized async validation with enhanced error handling
   */
  private async applyRuleAsync(compiledRule: CompiledRule, value: unknown): Promise<boolean> {
    try {
      const { helper, original } = compiledRule;
      if (!helper) {
        throw new Error(`Unknown operation: ${original.op}`);
      }

      const args = this.buildRuleArguments(compiledRule, value);
      const isValid = await helper.resolver(...args);

      return original.negative ? !isValid : isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Error in async operation '${compiledRule.original.op}' on field '${compiledRule.original.field}': ${errorMessage}`,
      );
    }
  }

  /**
   * Optimized debug logging with lazy evaluation
   */
  private debugLog(messageFactory: () => string, data?: any): void {
    if (this.options.debug) {
      this.logger.debug(messageFactory(), data);
    }
  }

  /**
   * Get path segments with LRU cache for better performance
   */
  private getPathSegments(path: string): string[] {
    // LRU cache management
    if (this.pathCache.has(path)) {
      const segments = this.pathCache.get(path)!;
      // Move to end for LRU
      this.pathCache.delete(path);
      this.pathCache.set(path, segments);
      return segments;
    }

    // Split path into segments
    const segments = path.includes('.') ? path.split('.') : [path];

    // Cache size management
    if (this.pathCache.size >= ValidraEngine.MAX_PATH_CACHE_SIZE) {
      // Remove least recently used (first entry)
      const firstKey = this.pathCache.keys().next().value;
      if (firstKey !== undefined) {
        this.pathCache.delete(firstKey);
      }
    }

    this.pathCache.set(path, segments);
    return segments;
  }

  /**
   * Get memory pool metrics for monitoring
   */
  public getMemoryPoolMetrics() {
    return this.memoryPool.getMetrics();
  }

  /**
   * Clear memory pool (useful for testing or memory management)
   */
  public clearMemoryPool(): void {
    this.memoryPool.clear();
  }

  /**
   * Validate large datasets using streaming for constant memory usage
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

    const streamingOptions = {
      ...options,
    };

    const validator = new ValidraStreamingValidator<TData>(streamingOptions);

    // Create a validation function that uses this engine
    const validateItem = (item: TData): ValidraResult<TData> => {
      return this.validate(item);
    };

    // Convert array to iterable if needed
    const stream = Array.isArray(dataStream) ? ValidraStreamingValidator.createArrayStream(dataStream) : dataStream;

    // Delegate to streaming validator
    return yield* validator.validateStream(stream, validateItem);
  }

  /**
   * Validate an array of data with streaming optimization
   */
  public async validateArray<TData extends Record<string, any>>(
    dataArray: TData[],
    options?: StreamingValidationOptions & { returnSummaryOnly?: boolean },
  ): Promise<StreamingValidationSummary | StreamingValidationResult<TData>[]> {
    const results: StreamingValidationResult<TData>[] = [];
    let summary: StreamingValidationSummary | null = null;

    // Use streaming validation
    const stream = ValidraStreamingValidator.createArrayStream(dataArray);

    const streamGenerator = this.validateStream(stream, options);
    let streamResult = await streamGenerator.next();

    while (!streamResult.done) {
      const result = streamResult.value;
      if (!options?.returnSummaryOnly) {
        results.push(result);
      }
      streamResult = await streamGenerator.next();
    }

    // The final value is the summary
    summary = streamResult.value;

    return options?.returnSummaryOnly ? summary : results;
  }
}
