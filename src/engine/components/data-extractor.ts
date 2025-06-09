/**
 * @fileoverview High-performance data extraction component with intelligent caching for validation operations
 * @module DataExtractor
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { IDataExtractor } from '../interfaces/data-extractor.interface';

/**
 * Advanced data extraction component optimized for high-performance validation operations.
 *
 * The DataExtractor provides sophisticated data navigation and extraction capabilities
 * with intelligent LRU caching, performance optimizations, and comprehensive path
 * resolution for complex data structures. Designed specifically for validation
 * scenarios requiring frequent property access and path traversal.
 *
 * Key features:
 * - **LRU Path Caching**: Intelligent caching of path segments with automatic eviction
 * - **Performance Optimization**: Optimized access patterns for common validation scenarios
 * - **Safe Navigation**: Comprehensive null/undefined checking and bounds validation
 * - **Array Support**: Intelligent array index handling with validation
 * - **Metrics Tracking**: Built-in performance monitoring and cache analytics
 * - **Memory Management**: Automatic cache size management for optimal memory usage
 *
 * Performance characteristics:
 * - O(1) cache lookups for previously computed path segments
 * - O(n) path traversal where n is path depth
 * - Optimized single-segment path access for common validation patterns
 * - Memory-efficient LRU cache with configurable size limits
 *
 * @public
 * @implements {IDataExtractor}
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic data extraction usage
 * const extractor = new DataExtractor();
 * const userData = {
 *   user: {
 *     profile: {
 *       name: 'John Doe',
 *       age: 30
 *     },
 *     preferences: ['theme:dark', 'notifications:enabled']
 *   }
 * };
 *
 * // Extract nested property values
 * const name = extractor.getValue(userData, ['user', 'profile', 'name']); // 'John Doe'
 * const age = extractor.getValue(userData, ['user', 'profile', 'age']); // 30
 * ```
 *
 * @example
 * ```typescript
 * // Path segment caching for repeated access
 * const extractor = new DataExtractor();
 *
 * // First access computes and caches path segments
 * const segments1 = extractor.getPathSegments('user.profile.name');
 *
 * // Subsequent access uses cached segments (performance boost)
 * const segments2 = extractor.getPathSegments('user.profile.name');
 *
 * // Monitor cache performance
 * const metrics = extractor.getMetrics();
 * console.log(`Cache hit rate: ${metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100}%`);
 * ```
 *
 * @example
 * ```typescript
 * // Array access and complex data structures
 * const complexData = {
 *   users: [
 *     { name: 'Alice', roles: ['admin', 'user'] },
 *     { name: 'Bob', roles: ['user'] }
 *   ]
 * };
 *
 * // Access array elements with bounds checking
 * const firstName = extractor.getValue(complexData, ['users', '0', 'name']); // 'Alice'
 * const invalidIndex = extractor.getValue(complexData, ['users', '10', 'name']); // undefined
 * ```
 *
 * @see {@link IDataExtractor} for the interface definition
 */
export class DataExtractor implements IDataExtractor {
  private pathCache = new Map<string, string[]>();
  private static readonly MAX_PATH_CACHE_SIZE = 50;
  private totalExtractions = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Extracts values from complex data structures using optimized path traversal.
   *
   * Provides high-performance data extraction with comprehensive safety checks,
   * array bounds validation, and optimized access patterns for common validation
   * scenarios. The method handles nested objects, arrays, and mixed data structures
   * with graceful error handling for invalid paths.
   *
   * @public
   * @param {any} data - Source data object to extract values from
   * @param {string[]} pathSegments - Pre-computed path segments for efficient navigation
   * @returns {unknown} Extracted value or undefined if path is invalid or doesn't exist
   *
   * @example
   * ```typescript
   * // Extract from nested object structure
   * const data = {
   *   user: {
   *     profile: { name: 'Alice', age: 28 },
   *     settings: { theme: 'dark' }
   *   }
   * };
   *
   * const name = extractor.getValue(data, ['user', 'profile', 'name']); // 'Alice'
   * const theme = extractor.getValue(data, ['user', 'settings', 'theme']); // 'dark'
   * const invalid = extractor.getValue(data, ['user', 'missing', 'field']); // undefined
   * ```
   *
   * @example
   * ```typescript
   * // Array access with bounds checking
   * const data = {
   *   items: ['apple', 'banana', 'cherry'],
   *   matrix: [[1, 2], [3, 4]]
   * };
   *
   * const fruit = extractor.getValue(data, ['items', '1']); // 'banana'
   * const cell = extractor.getValue(data, ['matrix', '0', '1']); // 2
   * const outOfBounds = extractor.getValue(data, ['items', '10']); // undefined
   * ```
   *
   * @example
   * ```typescript
   * // Performance-optimized single segment access
   * const data = { status: 'active', count: 42 };
   *
   * // Optimized path for single-level properties
   * const status = extractor.getValue(data, ['status']); // 'active'
   * const count = extractor.getValue(data, ['count']); // 42
   * ```
   *
   * @since 1.0.0
   */
  public getValue(data: any, pathSegments: string[]): unknown {
    this.totalExtractions++;
    // Optimize for single-segment paths (most common case)
    if (pathSegments.length === 1 && pathSegments[0]) {
      return data?.[pathSegments[0]];
    }

    let current = data;
    for (const segment of pathSegments) {
      if (current === null || current === undefined) {
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
   * Converts dot-notation paths to optimized segment arrays with intelligent LRU caching.
   *
   * Provides high-performance path parsing with LRU (Least Recently Used) caching
   * to avoid repeated string splitting operations. The cache automatically manages
   * memory usage and maintains optimal performance for frequently accessed paths.
   *
   * @public
   * @param {string} path - Dot-notation path string (e.g., 'user.profile.name')
   * @returns {string[]} Array of path segments optimized for efficient navigation
   *
   * @example
   * ```typescript
   * // Basic path segment conversion
   * const segments1 = extractor.getPathSegments('user.profile.name');
   * // Returns: ['user', 'profile', 'name']
   *
   * const segments2 = extractor.getPathSegments('settings.theme');
   * // Returns: ['settings', 'theme']
   *
   * const singleSegment = extractor.getPathSegments('status');
   * // Returns: ['status']
   * ```
   *
   * @example
   * ```typescript
   * // Caching performance optimization
   * const extractor = new DataExtractor();
   *
   * // First call: computes and caches segments
   * const segments1 = extractor.getPathSegments('user.profile.email');
   *
   * // Subsequent calls: retrieved from cache (faster)
   * const segments2 = extractor.getPathSegments('user.profile.email');
   * const segments3 = extractor.getPathSegments('user.profile.email');
   *
   * // Monitor cache effectiveness
   * const metrics = extractor.getMetrics();
   * console.log(`Cache hits: ${metrics.cacheHits}, Misses: ${metrics.cacheMisses}`);
   * ```
   *
   * @example
   * ```typescript
   * // Complex path patterns for validation
   * const paths = [
   *   'form.fields.0.value',      // Array index access
   *   'validation.rules.required', // Nested configuration
   *   'user.permissions.admin'     // Permission checking
   * ];
   *
   * paths.forEach(path => {
   *   const segments = extractor.getPathSegments(path);
   *   console.log(`${path} -> [${segments.join(', ')}]`);
   * });
   * ```
   *
   * @since 1.0.0
   */
  public getPathSegments(path: string): string[] {
    // Check cache first
    if (this.pathCache.has(path)) {
      this.cacheHits++;
      // Move to end for LRU management
      const segments = this.pathCache.get(path)!;
      this.pathCache.delete(path);
      this.pathCache.set(path, segments);
      return segments;
    }

    this.cacheMisses++;
    // Split path into segments
    const segments = path.includes('.') ? path.split('.') : [path];

    // Cache size management - remove least recently used
    if (this.pathCache.size >= DataExtractor.MAX_PATH_CACHE_SIZE) {
      // Remove least recently used (first entry in Map)
      const firstKey = this.pathCache.keys().next().value;
      if (firstKey !== undefined) {
        this.pathCache.delete(firstKey);
      }
    }

    this.pathCache.set(path, segments);
    return segments;
  }

  /**
   * Clears the internal path cache and resets caching state.
   *
   * Provides manual cache management for memory optimization in long-running
   * applications or when data access patterns change significantly. Useful
   * for testing scenarios and performance tuning operations.
   *
   * @public
   *
   * @example
   * ```typescript
   * // Periodic cache cleanup in long-running applications
   * setInterval(() => {
   *   const metrics = extractor.getMetrics();
   *   if (extractor.getCacheSize() > 40) {
   *     extractor.clearCache();
   *     console.log('Path cache cleared for memory optimization');
   *   }
   * }, 300000); // Every 5 minutes
   * ```
   *
   * @example
   * ```typescript
   * // Testing scenario cache reset
   * beforeEach(() => {
   *   extractor.clearCache(); // Ensure clean state for each test
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Application phase transition cleanup
   * function switchToNewDataSchema() {
   *   extractor.clearCache(); // Clear cache for new access patterns
   *   console.log('Cache cleared - ready for new schema');
   * }
   * ```
   *
   * @since 1.0.0
   */
  public clearCache(): void {
    this.pathCache.clear();
  }

  /**
   * Retrieves current cache size for monitoring and optimization decisions.
   *
   * Provides insight into cache utilization for performance monitoring,
   * memory management decisions, and optimization strategies. Useful for
   * determining optimal cache sizes and identifying cache usage patterns.
   *
   * @public
   * @returns {number} Current number of cached path segment arrays
   *
   * @example
   * ```typescript
   * // Monitor cache utilization
   * const currentSize = extractor.getCacheSize();
   * console.log(`Current cache entries: ${currentSize}/50`);
   *
   * if (currentSize > 40) {
   *   console.warn('Cache nearing capacity - consider clearing or increasing size');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Performance optimization based on cache size
   * function optimizeExtractor() {
   *   const cacheSize = extractor.getCacheSize();
   *   const metrics = extractor.getMetrics();
   *
   *   console.log(`Cache utilization: ${cacheSize}/50 entries`);
   *   console.log(`Hit rate: ${metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100}%`);
   * }
   * ```
   *
   * @since 1.0.0
   */
  public getCacheSize(): number {
    return this.pathCache.size;
  }

  /**
   * Retrieves comprehensive performance metrics for analysis and optimization.
   *
   * Provides detailed performance analytics including cache effectiveness,
   * extraction frequency, and operational efficiency metrics. Essential for
   * performance monitoring, optimization decisions, and system health analysis.
   *
   * @public
   * @returns {object} Performance metrics object with cache and extraction statistics
   * @returns {number} returns.cacheHits - Number of successful cache lookups
   * @returns {number} returns.cacheMisses - Number of cache misses requiring computation
   * @returns {number} returns.totalExtractions - Total number of extraction operations performed
   *
   * @example
   * ```typescript
   * // Comprehensive performance analysis
   * const metrics = extractor.getMetrics();
   * const hitRate = (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100;
   *
   * console.log(`Performance Report:
   *   Total Extractions: ${metrics.totalExtractions}
   *   Cache Hits: ${metrics.cacheHits}
   *   Cache Misses: ${metrics.cacheMisses}
   *   Hit Rate: ${hitRate.toFixed(2)}%
   *   Cache Size: ${extractor.getCacheSize()}`);
   * ```
   *
   * @example
   * ```typescript
   * // Performance monitoring and alerting
   * function monitorExtractorPerformance() {
   *   const metrics = extractor.getMetrics();
   *   const hitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses);
   *
   *   if (hitRate < 0.8) {
   *     console.warn(`Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
   *   }
   *
   *   if (metrics.totalExtractions > 10000) {
   *     console.info('High extraction volume - consider optimizing access patterns');
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Performance benchmarking
   * const startMetrics = extractor.getMetrics();
   *
   * // Perform operations...
   * runValidationBatch(data);
   *
   * const endMetrics = extractor.getMetrics();
   * const newExtractions = endMetrics.totalExtractions - startMetrics.totalExtractions;
   * console.log(`Batch completed ${newExtractions} extractions`);
   * ```
   *
   * @since 1.0.0
   */
  public getMetrics(): {
    /** Number of cache hits for path extraction. */
    cacheHits: number;
    /** Number of cache misses for path extraction. */
    cacheMisses: number;
    /** Total number of extraction operations performed. */
    totalExtractions: number;
  } {
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      totalExtractions: this.totalExtractions,
    };
  }
}
