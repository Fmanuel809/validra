/**
 * Interface for the cache manager, which manages multiple caching strategies for validation optimization.
 */
export interface ICacheManager {
  /**
   * Get value from path cache using LRU strategy.
   * @param path The path string to look up in the cache.
   * @returns The cached path segments as an array of strings.
   */
  getPathSegments(path: string): string[];

  /**
   * Cache a compiled helper for fast lookup.
   * @param operation The operation name.
   * @param helper The compiled helper to cache.
   */
  cacheHelper(operation: string, helper: any): void;

  /**
   * Get cached helper by operation name.
   * @param operation The operation name.
   * @returns The cached helper, or undefined if not found.
   */
  getCachedHelper(operation: string): any | undefined;

  /**
   * Check if a helper is cached for a given operation.
   * @param operation The operation name to check in the helper cache.
   * @returns True if the helper is cached, false otherwise.
   */
  hasHelper(operation: string): boolean;

  /**
   * Preload helpers for a list of operations.
   * @param operations Array of operation names to preload into the cache.
   * @returns A promise that resolves when preloading is complete.
   */
  preloadHelpers(operations: string[]): Promise<void>;

  /**
   * Get cache statistics and metrics for all managed caches.
   * @returns The current cache metrics, including path and helper cache statistics.
   */
  getMetrics(): CacheMetrics;

  /**
   * Clear all caches managed by the cache manager.
   */
  clear(): void;

  /**
   * Clear a specific cache type managed by the cache manager.
   * @param cacheType The type of cache to clear (path, helper, or all).
   */
  clearCache(cacheType: CacheType): void;
}

/**
 * Statistics and metrics for all caches managed by the cache manager.
 */
export interface CacheMetrics {
  /**
   * Path cache statistics.
   */
  pathCache: {
    /** Number of entries currently stored in the path cache. */
    size: number;
    /** Number of successful cache hits for path lookups. */
    hits: number;
    /** Number of cache misses for path lookups. */
    misses: number;
    /** Hit rate percentage for path cache (0-100). */
    hitRate: number;
  };
  /**
   * Helper cache statistics.
   */
  helperCache: {
    /** Number of entries currently stored in the helper cache. */
    size: number;
    /** Number of helper cache entries (may be the same as size). */
    entries: number;
  };
  /**
   * Estimated total memory usage of all caches in bytes.
   */
  totalMemoryUsage: number;
}

/**
 * Configuration options for the cache manager.
 */
export interface CacheConfig {
  /** Maximum number of entries allowed in the path cache. */
  maxPathCacheSize?: number;
  /** Maximum number of entries allowed in the helper cache. */
  maxHelperCacheSize?: number;
  /** Whether to enable the path cache. */
  enablePathCache?: boolean;
  /** Whether to enable the helper cache. */
  enableHelperCache?: boolean;
  /** Caching strategy for the path cache ('LRU' or 'LFU'). */
  pathCacheStrategy?: 'LRU' | 'LFU';
}

/**
 * Enum for cache types managed by the cache manager.
 */
export enum CacheType {
  /** Path cache. */
  PATH = 'path',
  /** Helper cache. */
  HELPER = 'helper',
  /** All caches. */
  ALL = 'all',
}
