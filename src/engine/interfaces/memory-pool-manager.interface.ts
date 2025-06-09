import { ValidraResult } from './validra-result';

/**
 * Metrics for monitoring memory pool performance.
 *
 * @property hits - Number of successful object retrievals from the pool.
 * @property misses - Number of times an object was not found in the pool.
 * @property allocations - Number of new objects created.
 * @property returns - Number of objects returned to the pool.
 * @property totalRequests - Total number of get requests.
 * @property hitRate - Percentage of successful retrievals from the pool.
 * @property poolSizes - Current size of each pool by type.
 */
export interface MemoryPoolMetrics {
  /** Number of successful object retrievals from the pool. */
  hits: number;
  /** Number of times an object was not found in the pool. */
  misses: number;
  /** Number of new objects created. */
  allocations: number;
  /** Number of objects returned to the pool. */
  returns: number;
  /** Total number of get requests. */
  totalRequests: number;
  /** Percentage of successful retrievals from the pool. */
  hitRate: number;
  /** Current size of each pool by type. */
  poolSizes: Record<string, number>;
}

/**
 * Factory functions for creating and resetting pooled objects.
 *
 * @property validationResult - Factory for creating a new validation result object.
 * @property resetValidationResult - Function to reset a validation result object.
 * @property errorArray - Factory for creating a new error array.
 * @property resetErrorArray - Function to reset an error array.
 * @property argumentsArray - Factory for creating a new arguments array.
 * @property resetArgumentsArray - Function to reset an arguments array.
 */
export interface PoolFactories {
  /** Factory for creating a new validation result object. */
  validationResult: () => ValidraResult<any>;
  /** Function to reset a validation result object. */
  resetValidationResult: (result: ValidraResult<any>) => void;
  /** Factory for creating a new error array. */
  errorArray: () => string[];
  /** Function to reset an error array. */
  resetErrorArray: (arr: string[]) => void;
  /** Factory for creating a new arguments array. */
  argumentsArray: () => unknown[];
  /** Function to reset an arguments array. */
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

  /**
   * Determines if an arguments array should use memory pool
   *
   * @param paramCount - Number of parameters
   * @returns True if should use memory pool
   */
  shouldPoolArguments(paramCount: number): boolean;

  /**
   * Determines if validation result should use memory pool
   *
   * @param rulesCount - Number of validation rules
   * @returns True if should use memory pool
   */
  shouldPoolValidationResult(rulesCount: number): boolean;
}
