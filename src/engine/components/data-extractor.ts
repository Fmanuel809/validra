import { IDataExtractor } from '../interfaces/data-extractor.interface';

/**
 * Data extraction component for Validra Engine
 *
 * Handles data extraction and path navigation with performance optimizations
 * including LRU caching for path segments and optimized array access.
 *
 * Follows Single Responsibility Principle by focusing solely on data extraction logic.
 */
export class DataExtractor implements IDataExtractor {
  private pathCache = new Map<string, string[]>();
  private static readonly MAX_PATH_CACHE_SIZE = 50;
  private totalExtractions = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Extracts value from data using pre-computed path segments
   *
   * Optimized for performance with:
   * - Early return for single-segment paths
   * - Proper null/undefined checking
   * - Array index validation with bounds checking
   *
   * @param data - The data object to extract from
   * @param pathSegments - Pre-computed path segments for navigation
   * @returns The extracted value or undefined if path doesn't exist
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
   * Converts a dot-notation path to segments with LRU caching
   *
   * Implements LRU (Least Recently Used) cache for path segments to:
   * - Avoid repeated string splitting operations
   * - Maintain optimal memory usage
   * - Improve overall validation performance
   *
   * @param path - Dot-notation path (e.g., "user.profile.name")
   * @returns Array of path segments for efficient navigation
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
   * Clears the path cache
   *
   * Useful for memory management in long-running applications
   * or when data structure patterns change significantly.
   */
  public clearCache(): void {
    this.pathCache.clear();
  }

  /**
   * Gets current cache size for monitoring
   *
   * @returns Current number of cached path segments
   */
  public getCacheSize(): number {
    return this.pathCache.size;
  }

  /**
   * Gets performance metrics for the data extractor
   *
   * @returns Object containing cacheHits, cacheMisses, and totalExtractions counts
   */
  public getMetrics(): { cacheHits: number; cacheMisses: number; totalExtractions: number } {
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      totalExtractions: this.totalExtractions,
    };
  }
}
