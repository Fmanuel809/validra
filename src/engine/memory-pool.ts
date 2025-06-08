/**
 * Memory Pool for high-frequency validation scenarios
 * Provides object reuse to reduce garbage collection pressure
 */
export class ValidraMemoryPool {
  private readonly pools: Map<string, any[]> = new Map();
  private readonly maxSize: number;
  private readonly metrics = {
    hits: 0,
    misses: 0,
    allocations: 0,
    returns: 0,
  };

  /**
   * Creates a new ValidraMemoryPool instance.
   * @param maxSize The maximum size of the memory pool for each object type.
   */
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool or create a new one
   */
  get<T>(type: string, factory: () => T): T {
    const pool = this.pools.get(type);

    if (pool && pool.length > 0) {
      this.metrics.hits++;
      return pool.pop() as T;
    }

    this.metrics.misses++;
    this.metrics.allocations++;

    // Just create the object without pre-allocation to reduce overhead
    const newObj = factory();

    // Initialize empty pool only if it doesn't exist
    if (!pool) {
      this.pools.set(type, []);
    }

    return newObj;
  }

  /**
   * Return an object to the pool
   */
  return<T>(type: string, obj: T, resetFn?: (obj: T) => void): void {
    if (!obj) {
      return;
    }

    const pool = this.pools.get(type) || [];

    if (pool.length < this.maxSize) {
      // Reset object state if reset function provided
      if (resetFn) {
        resetFn(obj);
      }

      pool.push(obj);
      this.pools.set(type, pool);
      this.metrics.returns++;
    }
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.pools.clear();
    this.resetMetrics();
  }

  /**
   * Gets metrics for the memory pool.
   * @returns An object containing metrics for the pool.
   *   - hits: Number of successful object retrievals from the pool.
   *   - misses: Number of times an object was not found in the pool.
   *   - allocations: Number of new objects created.
   *   - returns: Number of objects returned to the pool.
   *   - totalRequests: Total number of get requests.
   *   - hitRate: Percentage of successful retrievals from the pool.
   *   - poolSizes: Current size of each pool by type.
   */
  getMetrics() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    return {
      /** Number of successful object retrievals from the pool. */
      hits: this.metrics.hits,
      /** Number of times an object was not found in the pool. */
      misses: this.metrics.misses,
      /** Number of new objects created. */
      allocations: this.metrics.allocations,
      /** Number of objects returned to the pool. */
      returns: this.metrics.returns,
      /** Total number of get requests. */
      totalRequests,
      /** Percentage of successful retrievals from the pool. */
      hitRate: totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0,
      /** Current size of each pool by type. */
      poolSizes: Array.from(this.pools.entries()).reduce(
        (acc, [type, pool]) => {
          acc[type] = pool.length;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics.hits = 0;
    this.metrics.misses = 0;
    this.metrics.allocations = 0;
    this.metrics.returns = 0;
  }
}

/**
 * Pooled objects factories and reset functions
 */
export const MemoryPoolFactories = {
  /** Factory for creating a new validation result object. */
  validationResult: () => ({
    /** Indicates if the validation was successful. */
    isValid: true,
    /** The validated data. */
    data: null,
    /** Validation errors. */
    errors: {},
  }),

  /** Function to reset a validation result object. */
  resetValidationResult: (result: any) => {
    result.isValid = true;
    result.data = null;
    result.errors = {};
  },

  /** Factory for creating a new error array. */
  errorArray: () => [] as string[],

  /** Function to reset an error array. */
  resetErrorArray: (arr: string[]) => {
    arr.length = 0;
  },

  /** Factory for creating a new arguments array. */
  argumentsArray: () => [] as unknown[],

  /** Function to reset an arguments array. */
  resetArgumentsArray: (arr: unknown[]) => {
    arr.length = 0;
  },
};
