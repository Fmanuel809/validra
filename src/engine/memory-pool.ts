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
    returns: 0
  };

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
    if (!obj) return;
    
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
   * Get pool statistics
   */
  getMetrics() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      totalRequests,
      hitRate: totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0,
      poolSizes: Array.from(this.pools.entries()).reduce((acc, [type, pool]) => {
        acc[type] = pool.length;
        return acc;
      }, {} as Record<string, number>)
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
  validationResult: () => ({
    isValid: true,
    data: null,
    errors: {}
  }),
  
  resetValidationResult: (result: any) => {
    result.isValid = true;
    result.data = null;
    result.errors = {};
  },
  
  errorArray: () => [] as string[],
  
  resetErrorArray: (arr: string[]) => {
    arr.length = 0;
  },
  
  argumentsArray: () => [] as unknown[],
  
  resetArgumentsArray: (arr: unknown[]) => {
    arr.length = 0;
  }
};
