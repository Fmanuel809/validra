/**
 * @fileoverview Memory pool management component for optimized object reuse in high-frequency validation scenarios
 * @module MemoryPoolManager
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { IMemoryPoolManager, MemoryPoolMetrics, PoolFactories } from '../interfaces/memory-pool-manager.interface';
import { ValidraResult } from '../interfaces/validra-result';
import { MemoryPoolFactories, ValidraMemoryPool } from '../memory-pool';

/**
 * Memory pool manager component for optimized object lifecycle management in validation operations.
 *
 * Provides sophisticated memory management through object pooling patterns to minimize garbage
 * collection overhead and improve performance in high-frequency validation scenarios. Manages
 * pools for validation results, error arrays, and argument arrays with intelligent pooling
 * decisions based on operation complexity.
 *
 * Key features:
 * - **Object Pooling**: Reuses frequently allocated objects to reduce GC pressure
 * - **Smart Pooling**: Intelligent decisions on when to use pooling vs. direct allocation
 * - **Memory Metrics**: Comprehensive tracking of pool performance and hit rates
 * - **Configurable Pools**: Adjustable pool sizes and factory functions for different object types
 * - **Lifecycle Management**: Proper object reset and cleanup before reuse
 *
 * Performance benefits:
 * - Reduced garbage collection frequency in high-throughput scenarios
 * - Lower memory allocation overhead for repeated validation operations
 * - Improved CPU cache locality through object reuse
 * - Configurable thresholds to balance memory vs. performance trade-offs
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic setup with default configuration
 * const memoryPool = new MemoryPoolManager(true, 50);
 *
 * // Get a validation result from pool
 * const result = memoryPool.getValidationResult();
 * result.isValid = false;
 * result.data = userData;
 *
 * // Return to pool for reuse
 * memoryPool.returnValidationResult(result);
 * ```
 *
 * @example
 * ```typescript
 * // Advanced configuration for high-throughput scenarios
 * const highPerformancePool = new MemoryPoolManager(true, 200);
 *
 * // Use conditional pooling based on complexity
 * if (memoryPool.shouldPoolValidationResult(rules.length)) {
 *   const result = memoryPool.getValidationResult();
 *   // ... use result
 *   memoryPool.returnValidationResult(result);
 * } else {
 *   const result = { isValid: true, data: null };
 *   // Direct allocation for simple cases
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Performance monitoring
 * const metrics = memoryPool.getMetrics();
 * console.log(`Pool hit rate: ${metrics.hitRate}%`);
 * console.log(`Memory saved: ${metrics.hits} allocations avoided`);
 *
 * if (metrics.hitRate < 80) {
 *   console.warn('Consider increasing pool size or reviewing usage patterns');
 * }
 * ```
 *
 * @see {@link IMemoryPoolManager} for the interface definition
 * @see {@link ValidraMemoryPool} for the underlying pool implementation
 */
export class MemoryPoolManager implements IMemoryPoolManager {
  private readonly memoryPool: ValidraMemoryPool;
  private readonly enabled: boolean;

  /**
   * Factory functions for different object types
   */
  private readonly factories: PoolFactories = {
    validationResult: MemoryPoolFactories.validationResult,
    resetValidationResult: MemoryPoolFactories.resetValidationResult,
    errorArray: MemoryPoolFactories.errorArray,
    resetErrorArray: MemoryPoolFactories.resetErrorArray,
    argumentsArray: MemoryPoolFactories.argumentsArray,
    resetArgumentsArray: MemoryPoolFactories.resetArgumentsArray,
  };

  /**
   * Creates a new MemoryPoolManager instance with configurable pool settings.
   *
   * Initializes the memory pool manager with specified configuration for object pooling
   * behavior. The manager can be disabled for debugging or low-frequency scenarios where
   * pooling overhead might exceed benefits.
   *
   * @public
   * @param {boolean} [enabled=true] - Whether memory pooling is enabled; when false, all operations bypass pooling
   * @param {number} [poolSize=25] - Initial and maximum size for each object pool type
   *
   * @example
   * ```typescript
   * // Standard configuration for most applications
   * const memoryPool = new MemoryPoolManager(true, 50);
   * ```
   *
   * @example
   * ```typescript
   * // High-performance configuration for heavy validation workloads
   * const highPerformancePool = new MemoryPoolManager(true, 200);
   * ```
   *
   * @example
   * ```typescript
   * // Disabled pooling for debugging or low-frequency use
   * const debugPool = new MemoryPoolManager(false, 0);
   * ```
   *
   * @since 1.0.0
   */
  constructor(enabled: boolean = true, poolSize: number = 25) {
    this.enabled = enabled;
    this.memoryPool = new ValidraMemoryPool(poolSize);
  }

  /**
   * Retrieves an object from the memory pool or creates a new instance using the provided factory.
   *
   * Attempts to reuse an existing object from the pool for the specified type. If no pooled
   * object is available or pooling is disabled, creates a new instance using the factory function.
   * This method provides the core pooling functionality with fallback to direct allocation.
   *
   * @public
   * @typeParam T - Type of the object to retrieve or create
   * @param {string} type - Type identifier for the pool (e.g., 'validationResult', 'argumentsArray')
   * @param {() => T} factory - Factory function to create new instances when pool is empty
   *
   * @returns {T} Object from pool or newly created instance
   *
   * @example
   * ```typescript
   * // Get validation result with fallback factory
   * const result = memoryPool.get('validationResult', () => ({
   *   isValid: true,
   *   data: null,
   *   errors: {}
   * }));
   * ```
   *
   * @example
   * ```typescript
   * // Get arguments array for parameter handling
   * const args = memoryPool.get('argumentsArray', () => []);
   * args.length = 0; // Clear for reuse
   * args.push(param1, param2, param3);
   * ```
   *
   * @since 1.0.0
   */
  public get<T>(type: string, factory: () => T): T {
    if (!this.enabled) {
      return factory();
    }
    return this.memoryPool.get(type, factory);
  }

  /**
   * Returns an object to the memory pool with optional state reset for reuse.
   *
   * Stores an object back in the pool for future reuse, optionally applying a reset function
   * to clean up the object's state. The reset ensures objects are returned to a clean state
   * before being reused, preventing data leakage between validation operations.
   *
   * @public
   * @typeParam T - Type of the object being returned to the pool
   * @param {string} type - Type identifier for the pool matching the one used in get()
   * @param {T} obj - Object to return to the pool for reuse
   * @param {(obj: T) => void} [resetFn] - Optional function to reset object state before pooling
   *
   * @example
   * ```typescript
   * // Return validation result with automatic reset
   * memoryPool.return('validationResult', result, (r) => {
   *   r.isValid = true;
   *   r.data = null;
   *   delete r.errors;
   *   delete r.message;
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Return arguments array with length reset
   * memoryPool.return('argumentsArray', args, (arr) => {
   *   arr.length = 0; // Clear array contents
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Simple return without reset (object should be pre-cleaned)
   * memoryPool.return('errorArray', errors);
   * ```
   *
   * @since 1.0.0
   */
  public return<T>(type: string, obj: T, resetFn?: (obj: T) => void): void {
    if (!this.enabled || !obj) {
      return;
    }
    this.memoryPool.return(type, obj, resetFn);
  }

  /**
   * Retrieves a validation result object from the memory pool using optimized factory patterns.
   *
   * Provides the most frequently used pool operation in validation scenarios with proper
   * type safety and automatic factory configuration. This method is specifically optimized
   * for validation result lifecycle management with pre-configured reset behavior.
   *
   * @public
   * @returns {ValidraResult<any>} Clean validation result object from pool or newly created
   *
   * @example
   * ```typescript
   * // Standard validation result retrieval
   * const result = memoryPool.getValidationResult();
   * result.isValid = false;
   * result.data = userData;
   * result.errors = { field: ['Validation failed'] };
   *
   * // Use result in validation logic
   * return result;
   * ```
   *
   * @example
   * ```typescript
   * // Conditional pooling for performance optimization
   * if (memoryPool.shouldPoolValidationResult(rules.length)) {
   *   const result = memoryPool.getValidationResult();
   *   // ... perform validation
   *   memoryPool.returnValidationResult(result);
   * }
   * ```
   *
   * @since 1.0.0
   */
  public getValidationResult(): ValidraResult<any> {
    return this.get('validationResult', this.factories.validationResult);
  }

  /**
   * Returns a validation result object to the memory pool with automatic state reset.
   *
   * Ensures proper cleanup of validation result state before returning to pool for reuse.
   * The reset process clears validation data, error collections, and status flags to
   * prevent data leakage between validation operations.
   *
   * @public
   * @param {ValidraResult<any>} result - Validation result object to return to pool
   *
   * @example
   * ```typescript
   * // Complete validation lifecycle with pooling
   * const result = memoryPool.getValidationResult();
   *
   * // Perform validation operations
   * result.isValid = await validateData(data);
   * result.data = processedData;
   *
   * // Return to pool for reuse (automatic cleanup)
   * memoryPool.returnValidationResult(result);
   * ```
   *
   * @since 1.0.0
   */
  public returnValidationResult(result: ValidraResult<any>): void {
    this.return('validationResult', result, this.factories.resetValidationResult);
  }

  /**
   * Retrieves an arguments array from the memory pool for rule parameter handling.
   *
   * Optimized for reusable parameter arrays in rule execution scenarios. The returned
   * array is clean and ready for population with validation rule parameters, improving
   * performance in high-frequency validation operations.
   *
   * @public
   * @returns {unknown[]} Clean arguments array from pool or newly created
   *
   * @example
   * ```typescript
   * // Rule parameter handling with pooled arrays
   * const args = memoryPool.getArgumentsArray();
   * args.push(value, compareValue, options);
   *
   * const ruleResult = await rule.execute(...args);
   * memoryPool.returnArgumentsArray(args);
   * ```
   *
   * @example
   * ```typescript
   * // Conditional pooling based on parameter complexity
   * const paramCount = ruleParams.length;
   * if (memoryPool.shouldPoolArguments(paramCount)) {
   *   const args = memoryPool.getArgumentsArray();
   *   args.push(...ruleParams);
   *   // ... use args
   *   memoryPool.returnArgumentsArray(args);
   * }
   * ```
   *
   * @since 1.0.0
   */
  public getArgumentsArray(): unknown[] {
    return this.get('argumentsArray', this.factories.argumentsArray);
  }

  /**
   * Returns an arguments array to the memory pool with automatic length reset.
   *
   * Clears the arguments array contents before returning to pool, ensuring clean state
   * for subsequent reuse. The reset process removes all elements while preserving the
   * array object for optimal memory reuse patterns.
   *
   * @public
   * @param {unknown[]} args - Arguments array to return to pool
   *
   * @example
   * ```typescript
   * // Parameter array lifecycle with pooling
   * const args = memoryPool.getArgumentsArray();
   * args.push(param1, param2, param3);
   *
   * // Execute rule with parameters
   * const result = rule.apply(null, args);
   *
   * // Return to pool (automatic cleanup)
   * memoryPool.returnArgumentsArray(args);
   * ```
   *
   * @since 1.0.0
   */
  public returnArgumentsArray(args: unknown[]): void {
    this.return('argumentsArray', args, this.factories.resetArgumentsArray);
  }

  /**
   * Retrieves an error array from the memory pool for validation error collection.
   *
   * Provides clean string arrays optimized for collecting validation error messages
   * during rule execution. Useful for scenarios where multiple validation errors
   * need to be aggregated before result composition.
   *
   * @public
   * @returns {string[]} Clean error array from pool or newly created
   *
   * @example
   * ```typescript
   * // Error collection with pooled arrays
   * const errors = memoryPool.getErrorArray();
   *
   * if (!isValid) {
   *   errors.push('Field is required');
   *   errors.push('Format is invalid');
   * }
   *
   * result.errors = errors.length > 0 ? errors : undefined;
   * memoryPool.returnErrorArray(errors);
   * ```
   *
   * @since 1.0.0
   */
  public getErrorArray(): string[] {
    return this.get('errorArray', this.factories.errorArray);
  }

  /**
   * Returns an error array to the memory pool with automatic content reset.
   *
   * Clears all error messages from the array before returning to pool, ensuring
   * clean state for subsequent error collection operations. Maintains array object
   * identity for optimal memory reuse.
   *
   * @public
   * @param {string[]} errors - Error array to return to pool
   *
   * @example
   * ```typescript
   * // Error collection lifecycle
   * const errors = memoryPool.getErrorArray();
   * errors.push(...validationErrors);
   *
   * // Use collected errors
   * logErrors(errors);
   *
   * // Return to pool (automatic cleanup)
   * memoryPool.returnErrorArray(errors);
   * ```
   *
   * @since 1.0.0
   */
  public returnErrorArray(errors: string[]): void {
    this.return('errorArray', errors, this.factories.resetErrorArray);
  }

  /**
   * Determines whether arguments array should utilize memory pooling based on complexity.
   *
   * Provides intelligent pooling decisions to optimize performance by avoiding pooling
   * overhead for simple parameter scenarios. The threshold is based on performance
   * benchmarks where pooling benefits exceed management overhead.
   *
   * @public
   * @param {number} paramCount - Number of parameters in the arguments array
   * @returns {boolean} True if pooling should be used, false for direct allocation
   *
   * @example
   * ```typescript
   * // Conditional pooling for optimal performance
   * if (memoryPool.shouldPoolArguments(ruleParams.length)) {
   *   const args = memoryPool.getArgumentsArray();
   *   // Use pooled array for complex scenarios
   * } else {
   *   const args = [...ruleParams];
   *   // Direct allocation for simple cases
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Performance optimization in rule execution
   * const usePooling = memoryPool.shouldPoolArguments(params.length);
   * const args = usePooling
   *   ? memoryPool.getArgumentsArray()
   *   : [];
   *
   * args.push(...params);
   * // ... execute rule
   *
   * if (usePooling) {
   *   memoryPool.returnArgumentsArray(args);
   * }
   * ```
   *
   * @since 1.0.0
   */
  public shouldPoolArguments(paramCount: number): boolean {
    return this.enabled && paramCount > 5;
  }

  /**
   * Determines whether validation result should utilize memory pooling based on rule complexity.
   *
   * Provides performance-optimized pooling decisions by analyzing validation complexity.
   * Only recommends pooling for scenarios where the overhead is justified by the
   * performance benefits of object reuse.
   *
   * @public
   * @param {number} rulesCount - Number of validation rules to be executed
   * @returns {boolean} True if pooling should be used, false for direct allocation
   *
   * @example
   * ```typescript
   * // Smart pooling based on validation complexity
   * if (memoryPool.shouldPoolValidationResult(validationRules.length)) {
   *   const result = memoryPool.getValidationResult();
   *   // Use pooled result for complex validations
   *   memoryPool.returnValidationResult(result);
   * } else {
   *   const result = { isValid: true, data: null };
   *   // Direct allocation for simple validations
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Performance monitoring and optimization
   * const complexValidation = rules.length > 10;
   * if (complexValidation && memoryPool.shouldPoolValidationResult(rules.length)) {
   *   // Use pooling for complex scenarios
   *   const metrics = memoryPool.getMetrics();
   *   console.log(`Pool efficiency: ${metrics.hitRate}%`);
   * }
   * ```
   *
   * @since 1.0.0
   */
  public shouldPoolValidationResult(rulesCount: number): boolean {
    return this.enabled && rulesCount > 10;
  }

  /**
   * Clears all memory pools and resets internal state to initial conditions.
   *
   * Provides comprehensive cleanup for memory management in long-running applications
   * or testing scenarios. All pooled objects are discarded and pool metrics are reset,
   * allowing for fresh memory allocation patterns.
   *
   * @public
   *
   * @example
   * ```typescript
   * // Periodic memory cleanup in long-running applications
   * setInterval(() => {
   *   const metrics = memoryPool.getMetrics();
   *   if (metrics.totalSize > 1000) {
   *     memoryPool.clear();
   *     console.log('Memory pools cleared for optimization');
   *   }
   * }, 300000); // Every 5 minutes
   * ```
   *
   * @example
   * ```typescript
   * // Testing scenario cleanup
   * afterEach(() => {
   *   memoryPool.clear(); // Ensure clean state between tests
   * });
   * ```
   *
   * @since 1.0.0
   */
  public clear(): void {
    this.memoryPool.clear();
  }

  /**
   * Retrieves comprehensive memory pool performance metrics and statistics.
   *
   * Provides detailed insights into pool performance including hit rates, miss counts,
   * and pool sizes for performance monitoring and optimization decisions. Useful for
   * tuning pool configurations and identifying memory usage patterns.
   *
   * @public
   * @returns {MemoryPoolMetrics} Comprehensive pool performance metrics
   *
   * @example
   * ```typescript
   * // Performance monitoring and optimization
   * const metrics = memoryPool.getMetrics();
   * console.log(`Pool Performance Report:
   *   Hit Rate: ${metrics.hitRate}%
   *   Total Hits: ${metrics.hits}
   *   Total Misses: ${metrics.misses}
   *   Pool Size: ${metrics.totalSize}
   *   Memory Saved: ${metrics.hits} allocations`);
   *
   * if (metrics.hitRate < 70) {
   *   console.warn('Consider increasing pool size');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Adaptive pool management based on metrics
   * const metrics = memoryPool.getMetrics();
   * if (metrics.hitRate > 95 && metrics.totalSize > 100) {
   *   // Pool might be oversized, consider reducing
   *   console.log('Pool may be oversized for current workload');
   * }
   * ```
   *
   * @since 1.0.0
   */
  public getMetrics(): MemoryPoolMetrics {
    return this.memoryPool.getMetrics();
  }

  /**
   * Checks whether memory pooling is currently enabled for this manager instance.
   *
   * Provides runtime inspection of pooling status for conditional logic and
   * debugging scenarios. Useful for adapting validation strategies based on
   * current memory management configuration.
   *
   * @public
   * @returns {boolean} True if memory pooling is enabled, false if disabled
   *
   * @example
   * ```typescript
   * // Conditional validation strategy based on pooling status
   * if (memoryPool.isEnabled()) {
   *   // Use pooled objects for better performance
   *   const result = memoryPool.getValidationResult();
   *   // ... validation logic
   *   memoryPool.returnValidationResult(result);
   * } else {
   *   // Direct allocation when pooling is disabled
   *   const result = { isValid: true, data: null };
   *   // ... validation logic
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Debug information logging
   * console.log(`Memory pooling: ${memoryPool.isEnabled() ? 'enabled' : 'disabled'}`);
   * if (memoryPool.isEnabled()) {
   *   const metrics = memoryPool.getMetrics();
   *   console.log(`Current pool metrics:`, metrics);
   * }
   * ```
   *
   * @since 1.0.0
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}
