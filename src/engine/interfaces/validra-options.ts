export interface ValidraEngineOptions {
  debug?: boolean;
  throwOnUnknownField?: boolean;
  allowPartialValidation?: boolean;

  // Memory Pool optimizations for high-frequency validation
  enableMemoryPool?: boolean;
  memoryPoolSize?: number;

  // Streaming validation for large datasets
  enableStreaming?: boolean;
  streamingChunkSize?: number;
}
