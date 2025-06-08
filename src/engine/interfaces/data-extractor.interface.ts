/**
 * Interface for data extraction operations in Validra Engine
 *
 * Follows Single Responsibility Principle by handling only data extraction
 * and path navigation logic with performance optimizations.
 */
export interface IDataExtractor {
  /**
   * Extracts value from data using pre-computed path segments
   *
   * @param data - The data object to extract from
   * @param pathSegments - Pre-computed path segments for navigation
   * @returns The extracted value or undefined if path doesn't exist
   */
  getValue(data: any, pathSegments: string[]): unknown;

  /**
   * Converts a dot-notation path to segments with LRU caching
   *
   * @param path - Dot-notation path (e.g., "user.profile.name")
   * @returns Array of path segments for efficient navigation
   */
  getPathSegments(path: string): string[];

  /**
   * Clears the path cache
   */
  clearCache(): void;

  /**
   * Gets current cache size for monitoring
   *
   * @returns Number of cached path segments
   */
  getCacheSize(): number;

  /**
   * Gets performance metrics for the data extractor
   *
   * @returns Metrics object with extraction stats
   */
  getMetrics(): { cacheHits: number; cacheMisses: number; totalExtractions: number };
}
