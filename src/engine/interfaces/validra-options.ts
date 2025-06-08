/**
 * Options for configuring the Validra validation engine.
 *
 * These options allow you to control debugging, error handling, memory pool usage, and streaming validation.
 *
 * @property debug - Enable debug logging for the engine.
 * @property throwOnUnknownField - Throw an error if a field is not recognized by the rules.
 * @property allowPartialValidation - Continue validation after errors (partial validation mode).
 * @property enableMemoryPool - Enable memory pool optimizations for high-frequency validation.
 * @property memoryPoolSize - Maximum number of objects to keep in the memory pool.
 * @property enableStreaming - Enable streaming validation for large datasets.
 * @property streamingChunkSize - Number of items per chunk in streaming validation.
 *
 * @example
 * const options: ValidraEngineOptions = {
 *   debug: true,
 *   throwOnUnknownField: false,
 *   allowPartialValidation: true,
 *   enableMemoryPool: true,
 *   memoryPoolSize: 50,
 *   enableStreaming: true,
 *   streamingChunkSize: 100
 * };
 */
export interface ValidraEngineOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Throw error on unknown fields */
  throwOnUnknownField?: boolean;
  /** Allow partial validation (continue on error) */
  allowPartialValidation?: boolean;

  // Memory Pool optimizations for high-frequency validation
  /** Enable memory pool optimizations */
  enableMemoryPool?: boolean;
  /** Maximum memory pool size */
  memoryPoolSize?: number;

  // Streaming validation for large datasets
  /** Enable streaming validation for large datasets */
  enableStreaming?: boolean;
  /** Chunk size for streaming validation */
  streamingChunkSize?: number;
}
