/**
 * Cache Manager Interface
 * Manages multiple caching strategies for validation optimization
 */

export interface ICacheManager {
  /**
   * Get value from path cache using LRU strategy
   */
  getPathSegments(path: string): string[];

  /**
   * Cache a compiled helper for fast lookup
   */
  cacheHelper(operation: string, helper: any): void;

  /**
   * Get cached helper by operation name
   */
  getCachedHelper(operation: string): any | undefined;

  /**
   * Check if helper is cached
   */
  hasHelper(operation: string): boolean;

  /**
   * Preload helpers for operations
   */
  preloadHelpers(operations: string[]): Promise<void>;

  /**
   * Get cache statistics
   */
  getMetrics(): CacheMetrics;

  /**
   * Clear all caches
   */
  clear(): void;

  /**
   * Clear specific cache type
   */
  clearCache(cacheType: CacheType): void;
}

export interface CacheMetrics {
  pathCache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  helperCache: {
    size: number;
    entries: number;
  };
  totalMemoryUsage: number;
}

export interface CacheConfig {
  maxPathCacheSize?: number;
  maxHelperCacheSize?: number;
  enablePathCache?: boolean;
  enableHelperCache?: boolean;
  pathCacheStrategy?: 'LRU' | 'LFU';
}

export enum CacheType {
  PATH = 'path',
  HELPER = 'helper',
  ALL = 'all',
}
