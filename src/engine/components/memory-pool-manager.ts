import { IMemoryPoolManager, MemoryPoolMetrics, PoolFactories } from '../interfaces/memory-pool-manager.interface';
import { ValidraResult } from '../interfaces/validra-result';
import { MemoryPoolFactories, ValidraMemoryPool } from '../memory-pool';

/**
 * Memory pool manager component for Validra Engine
 *
 * Manages memory pools for high-frequency validation scenarios with proper
 * object lifecycle management and performance monitoring.
 *
 * Follows Single Responsibility Principle by focusing solely on memory pool operations.
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
   * Creates a new MemoryPoolManager instance.
   * @param enabled Whether the memory pool is enabled.
   * @param poolSize The initial size of the memory pool.
   */
  constructor(enabled: boolean = true, poolSize: number = 25) {
    this.enabled = enabled;
    this.memoryPool = new ValidraMemoryPool(poolSize);
  }

  /**
   * Gets an object from the memory pool or creates a new one
   *
   * @param type - Type identifier for the pool
   * @param factory - Factory function to create new instances
   * @returns Object from pool or newly created
   */
  public get<T>(type: string, factory: () => T): T {
    if (!this.enabled) {
      return factory();
    }
    return this.memoryPool.get(type, factory);
  }

  /**
   * Returns an object to the memory pool with optional reset
   *
   * @param type - Type identifier for the pool
   * @param obj - Object to return to pool
   * @param resetFn - Optional function to reset object state
   */
  public return<T>(type: string, obj: T, resetFn?: (obj: T) => void): void {
    if (!this.enabled || !obj) {
      return;
    }
    this.memoryPool.return(type, obj, resetFn);
  }

  /**
   * Gets validation result from pool with proper typing
   *
   * Optimized method for the most common pool operation in validation.
   *
   * @returns Validation result object from pool
   */
  public getValidationResult(): ValidraResult<any> {
    return this.get('validationResult', this.factories.validationResult);
  }

  /**
   * Returns validation result to pool with reset
   *
   * Ensures validation result is properly reset before returning to pool.
   *
   * @param result - Validation result to return
   */
  public returnValidationResult(result: ValidraResult<any>): void {
    this.return('validationResult', result, this.factories.resetValidationResult);
  }

  /**
   * Gets arguments array from pool for rule execution
   *
   * Optimized for rule parameter handling with reusable arrays.
   *
   * @returns Arguments array from pool
   */
  public getArgumentsArray(): unknown[] {
    return this.get('argumentsArray', this.factories.argumentsArray);
  }

  /**
   * Returns arguments array to pool with reset
   *
   * Clears arguments array before returning to pool for reuse.
   *
   * @param args - Arguments array to return
   */
  public returnArgumentsArray(args: unknown[]): void {
    this.return('argumentsArray', args, this.factories.resetArgumentsArray);
  }

  /**
   * Gets error array from pool for error collection
   *
   * @returns Error array from pool
   */
  public getErrorArray(): string[] {
    return this.get('errorArray', this.factories.errorArray);
  }

  /**
   * Returns error array to pool with reset
   *
   * @param errors - Error array to return
   */
  public returnErrorArray(errors: string[]): void {
    this.return('errorArray', errors, this.factories.resetErrorArray);
  }

  /**
   * Determines if an arguments array should use memory pool
   *
   * Only use pool for complex parameter arrays to avoid overhead for simple validations.
   * Optimized threshold based on performance benchmarks.
   *
   * @param paramCount - Number of parameters
   * @returns True if should use memory pool
   */
  public shouldPoolArguments(paramCount: number): boolean {
    return this.enabled && paramCount > 5;
  }

  /**
   * Determines if validation result should use memory pool
   *
   * Use pool only for complex validations with many rules to justify the overhead.
   * Optimized threshold based on performance benchmarks.
   *
   * @param rulesCount - Number of validation rules
   * @returns True if should use memory pool
   */
  public shouldPoolValidationResult(rulesCount: number): boolean {
    return this.enabled && rulesCount > 10;
  }

  /**
   * Clears all memory pools
   *
   * Useful for memory management in long-running applications
   * or during testing scenarios.
   */
  public clear(): void {
    this.memoryPool.clear();
  }

  /**
   * Gets memory pool performance metrics
   *
   * @returns Current pool metrics including hit rates and pool sizes
   */
  public getMetrics(): MemoryPoolMetrics {
    return this.memoryPool.getMetrics();
  }

  /**
   * Checks if memory pool is enabled
   *
   * @returns True if memory pool is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}
