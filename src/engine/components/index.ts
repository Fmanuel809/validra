/**
 * @fileoverview Engine component implementations for specialized validation operations and performance optimization
 * @module components
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Engine components module providing specialized validation components and performance optimization implementations.
 *
 * This module contains the core implementation components that power the Validra validation
 * engine, each designed for specific validation scenarios and performance requirements.
 * These components work together to provide a comprehensive, scalable, and efficient
 * validation system suitable for enterprise applications.
 *
 * Available components:
 * - **AsyncValidator**: Non-blocking asynchronous validation with Promise-based API
 * - **CacheManager**: Intelligent caching system for validation results and rule compilation
 * - **CallbackManager**: Event-driven callback system for validation lifecycle management
 * - **DataExtractor**: High-performance data extraction with path caching and optimization
 * - **ErrorHandler**: Comprehensive error management and recovery mechanisms
 * - **MemoryPoolManager**: Advanced memory management with object pooling for performance
 * - **RuleCompiler**: Rule compilation and optimization for enhanced validation performance
 * - **StreamValidator**: Memory-efficient streaming validation for large datasets
 * - **SyncValidator**: High-performance synchronous validation for immediate results
 *
 * Component features:
 * - **Performance Optimized**: Each component is optimized for specific validation scenarios
 * - **Memory Efficient**: Advanced memory management and resource optimization
 * - **Scalable Design**: Components support high-throughput validation workloads
 * - **Error Resilient**: Comprehensive error handling and recovery mechanisms
 * - **Monitoring Support**: Built-in metrics and performance tracking capabilities
 * - **Type Safe**: Full TypeScript support with comprehensive type checking
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Import specific components for custom validation setups
 * import {
 *   SyncValidator,
 *   AsyncValidator,
 *   CacheManager,
 *   MemoryPoolManager
 * } from 'validra/engine/components';
 *
 * // Create custom validation pipeline
 * const cacheManager = new CacheManager();
 * const memoryPool = new MemoryPoolManager();
 * const validator = new SyncValidator({ cacheManager, memoryPool });
 * ```
 *
 * @see {@link AsyncValidator} for asynchronous validation
 * @see {@link SyncValidator} for synchronous validation
 * @see {@link StreamValidator} for streaming validation
 * @see {@link CacheManager} for validation caching
 * @see {@link MemoryPoolManager} for memory optimization
 */

// Asynchronous validation component
export * from './async-validator';

// Caching system for validation optimization
export * from './cache-manager';

// Event-driven callback management
export * from './callback-manager';

// High-performance data extraction
export * from './data-extractor';

// Comprehensive error handling
export * from './error-handler';

// Advanced memory management
export * from './memory-pool-manager';

// Rule compilation and optimization
export * from './rule-compiler';

// Streaming validation for large datasets
export * from './stream-validator';

// High-performance synchronous validation
export * from './sync-validator';
