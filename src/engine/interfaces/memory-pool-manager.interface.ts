import { ValidraResult } from './validra-result';

/**
 * Memory pool metrics for monitoring performance
 */
export interface MemoryPoolMetrics {
  hits: number;
  misses: number;
  allocations: number;
  returns: number;
  totalRequests: number;
  hitRate: number;
  poolSizes: Record<string, number>;
}

/**
 * Factory functions for creating and resetting pooled objects
 */
export interface PoolFactories {
  validationResult: () => ValidraResult<any>;
  resetValidationResult: (result: ValidraResult<any>) => void;
  errorArray: () => string[];
  resetErrorArray: (arr: string[]) => void;
  argumentsArray: () => unknown[];
  resetArgumentsArray: (arr: unknown[]) => void;
}

/**
 * Interface for memory pool management in Validra Engine
 *
 * Follows Single Responsibility Principle by handling only memory pool
 * operations for high-frequency validation scenarios.
 */
export interface IMemoryPoolManager {
  /**
   * Gets an object from the memory pool or creates a new one
   *
   * @param type - Type identifier for the pool
   * @param factory - Factory function to create new instances
   * @returns Object from pool or newly created
   */
  get<T>(type: string, factory: () => T): T;

  /**
   * Returns an object to the memory pool with optional reset
   *
   * @param type - Type identifier for the pool
   * @param obj - Object to return to pool
   * @param resetFn - Optional function to reset object state
   */
  return<T>(type: string, obj: T, resetFn?: (obj: T) => void): void;

  /**
   * Gets validation result from pool with proper typing
   *
   * @returns Validation result object from pool
   */
  getValidationResult(): ValidraResult<any>;

  /**
   * Returns validation result to pool with reset
   *
   * @param result - Validation result to return
   */
  returnValidationResult(result: ValidraResult<any>): void;

  /**
   * Gets arguments array from pool for rule execution
   *
   * @returns Arguments array from pool
   */
  getArgumentsArray(): unknown[];

  /**
   * Returns arguments array to pool with reset
   *
   * @param args - Arguments array to return
   */
  returnArgumentsArray(args: unknown[]): void;

  /**
   * Clears all memory pools
   */
  clear(): void;

  /**
   * Gets memory pool performance metrics
   *
   * @returns Current pool metrics
   */
  getMetrics(): MemoryPoolMetrics;

  /**
   * Checks if memory pool is enabled
   *
   * @returns True if memory pool is enabled
   */
  isEnabled(): boolean;
}
