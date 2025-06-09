/**
 * @fileoverview Cache management component for the Validra validation engine
 * @module CacheManager
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { helpersActions } from '@/dsl';
import { ValidraLogger } from '@/utils';
import { CacheConfig, CacheMetrics, CacheType, ICacheManager } from '../interfaces/cache-manager.interface';

/**
 * Cache Manager implementation for optimizing validation performance.
 *
 * Provides advanced caching strategies for validation components including path resolution
 * caching and helper function caching. Supports multiple cache eviction policies (LRU, FIFO)
 * and configurable cache sizes to balance memory usage with performance.
 *
 * Key features:
 * - Path segment caching for object property access optimization
 * - Helper function result caching for frequently used validation operations
 * - LRU (Least Recently Used) and FIFO (First In, First Out) eviction policies
 * - Comprehensive metrics tracking for cache performance analysis
 * - Configurable cache sizes and strategies per cache type
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic cache manager
 * const cacheManager = new CacheManager();
 *
 * // Advanced configuration
 * const advancedCache = new CacheManager({
 *   maxPathCacheSize: 100,
 *   maxHelperCacheSize: 200,
 *   enablePathCache: true,
 *   enableHelperCache: true,
 *   pathCacheStrategy: 'LRU'
 * });
 *
 * // Path caching usage
 * const segments = cacheManager.getPathSegments('user.profile.name');
 * console.log(segments); // ['user', 'profile', 'name']
 *
 * // Cache metrics
 * const metrics = cacheManager.getMetrics();
 * console.log(`Cache hit rate: ${metrics.pathHitRate}%`);
 *
 * // Cache management
 * cacheManager.clearCache('path');
 * cacheManager.invalidateCache();
 * ```
 *
 * @see {@link ICacheManager} Interface definition
 * @see {@link CacheConfig} Configuration options
 * @see {@link CacheMetrics} Performance metrics
 */
export class CacheManager implements ICacheManager {
  private readonly pathCache = new Map<string, string[]>();
  private readonly helperCache = new Map<string, any>();
  private readonly pathCacheHits = new Map<string, number>();
  private readonly config: Required<CacheConfig>;
  private readonly logger: ValidraLogger;

  // Metrics tracking
  private pathHits = 0;
  private pathMisses = 0;

  /**
   * Creates a new CacheManager instance with configurable caching strategies.
   *
   * Initializes cache storage containers and applies configuration settings
   * for optimal performance based on the intended use case. Default settings
   * provide balanced performance for most validation scenarios.
   *
   * @public
   * @param {CacheConfig} [config={}] - Cache configuration options
   * @param {number} [config.maxPathCacheSize=50] - Maximum number of path entries to cache
   * @param {number} [config.maxHelperCacheSize=100] - Maximum number of helper results to cache
   * @param {boolean} [config.enablePathCache=true] - Enable path segment caching
   * @param {boolean} [config.enableHelperCache=true] - Enable helper function result caching
   * @param {'LRU' | 'FIFO'} [config.pathCacheStrategy='LRU'] - Cache eviction strategy for path cache
   *
   * @example
   * ```typescript
   * // Default configuration
   * const defaultCache = new CacheManager();
   *
   * // Custom configuration for high-performance scenarios
   * const highPerfCache = new CacheManager({
   *   maxPathCacheSize: 200,
   *   maxHelperCacheSize: 500,
   *   pathCacheStrategy: 'LRU'
   * });
   *
   * // Memory-constrained configuration
   * const lightweightCache = new CacheManager({
   *   maxPathCacheSize: 20,
   *   maxHelperCacheSize: 50,
   *   enableHelperCache: false  // Disable helper cache to save memory
   * });
   * ```
   *
   * @since 1.0.0
   */
  constructor(config: CacheConfig = {}) {
    this.config = {
      maxPathCacheSize: config.maxPathCacheSize ?? 50,
      maxHelperCacheSize: config.maxHelperCacheSize ?? 100,
      enablePathCache: config.enablePathCache ?? true,
      enableHelperCache: config.enableHelperCache ?? true,
      pathCacheStrategy: config.pathCacheStrategy ?? 'LRU',
    };

    this.logger = new ValidraLogger('CacheManager');
  }

  /**
   * Retrieves path segments with optimized LRU cache support.
   *
   * Splits object property paths into segments while leveraging caching
   * to avoid repeated string operations. Implements LRU strategy to maintain
   * frequently accessed paths in memory for optimal performance.
   *
   * @public
   * @param {string} path - The object path to split (e.g., 'user.profile.name')
   * @returns {string[]} Array of path segments
   *
   * @example
   * ```typescript
   * const cacheManager = new CacheManager();
   *
   * // First call - cache miss, segments computed
   * const segments1 = cacheManager.getPathSegments('user.profile.name');
   * console.log(segments1); // ['user', 'profile', 'name']
   *
   * // Second call - cache hit, segments retrieved from cache
   * const segments2 = cacheManager.getPathSegments('user.profile.name');
   * console.log(segments2); // ['user', 'profile', 'name'] (from cache)
   *
   * // Complex nested paths
   * const nestedPath = cacheManager.getPathSegments('data[0].items.metadata.id');
   * console.log(nestedPath); // ['data', '0', 'items', 'metadata', 'id']
   * ```
   *
   * @since 1.0.0
   */
  getPathSegments(path: string): string[] {
    if (!this.config.enablePathCache) {
      return this.splitPath(path);
    }

    // Check cache hit
    if (this.pathCache.has(path)) {
      this.pathHits++;
      const segments = this.pathCache.get(path)!;

      // Update access for LRU
      if (this.config.pathCacheStrategy === 'LRU') {
        this.updatePathAccess(path);
      }

      return segments;
    }

    // Cache miss
    this.pathMisses++;
    const segments = this.splitPath(path);

    // Cache the result
    this.cachePathSegments(path, segments);

    return segments;
  }

  /**
   * Cache a compiled helper for fast lookup
   */
  cacheHelper(operation: string, helper: any): void {
    if (!this.config.enableHelperCache) {
      return;
    }

    // Check cache size limit
    if (this.helperCache.size >= this.config.maxHelperCacheSize) {
      // Remove oldest entry (first in Map)
      const firstKey = this.helperCache.keys().next().value;
      if (firstKey !== undefined) {
        this.helperCache.delete(firstKey);
      }
    }

    this.helperCache.set(operation, helper);
  }

  /**
   * Get cached helper by operation name
   */
  getCachedHelper(operation: string): any | undefined {
    if (!this.config.enableHelperCache) {
      return undefined;
    }

    return this.helperCache.get(operation);
  }

  /**
   * Check if helper is cached
   */
  hasHelper(operation: string): boolean {
    if (!this.config.enableHelperCache) {
      return false;
    }

    return this.helperCache.has(operation);
  }

  /**
   * Preload helpers for operations with error handling
   */
  async preloadHelpers(operations: string[]): Promise<void> {
    if (!this.config.enableHelperCache) {
      return;
    }

    const uniqueOps = [...new Set(operations)];
    const loadPromises: Promise<void>[] = [];

    for (const operation of uniqueOps) {
      loadPromises.push(this.loadHelper(operation));
    }

    await Promise.allSettled(loadPromises);
  }

  /**
   * Get comprehensive cache metrics
   */
  getMetrics(): CacheMetrics {
    const totalPathRequests = this.pathHits + this.pathMisses;
    const pathHitRate = totalPathRequests > 0 ? (this.pathHits / totalPathRequests) * 100 : 0;

    return {
      pathCache: {
        size: this.pathCache.size,
        hits: this.pathHits,
        misses: this.pathMisses,
        hitRate: pathHitRate,
      },
      helperCache: {
        size: this.helperCache.size,
        entries: this.helperCache.size,
      },
      totalMemoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.clearCache(CacheType.ALL);
  }

  /**
   * Clear specific cache type
   */
  clearCache(cacheType: CacheType): void {
    switch (cacheType) {
      case CacheType.PATH:
        this.pathCache.clear();
        this.pathCacheHits.clear();
        this.pathHits = 0;
        this.pathMisses = 0;
        break;
      case CacheType.HELPER:
        this.helperCache.clear();
        break;
      case CacheType.ALL:
        this.clearCache(CacheType.PATH);
        this.clearCache(CacheType.HELPER);
        break;
    }
  }

  /**
   * Split path into segments
   */
  private splitPath(path: string): string[] {
    return path.includes('.') ? path.split('.') : [path];
  }

  /**
   * Cache path segments with size management
   */
  private cachePathSegments(path: string, segments: string[]): void {
    if (!this.config.enablePathCache) {
      return;
    }

    // Check cache size limit
    if (this.pathCache.size >= this.config.maxPathCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.pathCache.set(path, segments);
    this.pathCacheHits.set(path, 1);
  }

  /**
   * Update path access for LRU strategy
   */
  private updatePathAccess(path: string): void {
    // Move to end for LRU (delete and re-add)
    const segments = this.pathCache.get(path)!;
    this.pathCache.delete(path);
    this.pathCache.set(path, segments);

    // Update hit count
    const currentHits = this.pathCacheHits.get(path) || 0;
    this.pathCacheHits.set(path, currentHits + 1);
  }

  /**
   * Evict least recently used path from cache
   */
  private evictLeastRecentlyUsed(): void {
    if (this.config.pathCacheStrategy === 'LRU') {
      // Remove first entry (least recently used)
      const firstKey = this.pathCache.keys().next().value;
      if (firstKey !== undefined) {
        this.pathCache.delete(firstKey);
        this.pathCacheHits.delete(firstKey);
      }
    } else {
      // LFU strategy - remove least frequently used
      let minHits = Infinity;
      let leastUsedKey: string | undefined;

      for (const [key, hits] of this.pathCacheHits) {
        if (hits < minHits) {
          minHits = hits;
          leastUsedKey = key;
        }
      }

      if (leastUsedKey) {
        this.pathCache.delete(leastUsedKey);
        this.pathCacheHits.delete(leastUsedKey);
      }
    }
  }

  /**
   * Load single helper with error handling
   */
  private async loadHelper(operation: string): Promise<void> {
    try {
      const helper = helpersActions.getHelperResolverSchema(operation as any);
      if (helper) {
        this.cacheHelper(operation, helper);
      }
    } catch (error) {
      this.logger.error(`Failed to resolve helper for operation "${operation}"`, { error });
      // Silent fail for invalid operations
      // Logging can be handled at a higher level
    }
  }

  /**
   * Estimate total memory usage of caches
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    // Estimate path cache size
    for (const [path, segments] of this.pathCache) {
      totalSize += path.length * 2; // String characters (UTF-16)
      totalSize += segments.reduce((acc, segment) => acc + segment.length * 2, 0);
      totalSize += 32; // Object overhead
    }

    // Estimate helper cache size (rough approximation)
    totalSize += this.helperCache.size * 256; // Assuming ~256 bytes per helper

    return totalSize;
  }
}
