/**
 * @fileoverview Core validation engine and processing components for high-performance validation operations
 * @module engine
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Core validation engine module providing high-performance validation processing and component architecture.
 *
 * The engine module contains the foundational components that power the Validra validation
 * system, including the main validation engine, specialized validators, memory management,
 * and performance optimization components. Designed for scalability, efficiency, and
 * enterprise-grade validation requirements.
 *
 * Exported components:
 * - **Components**: Specialized validation components (sync, async, streaming, caching, etc.)
 * - **Interfaces**: Type definitions and contracts for engine components
 * - **Memory Pool**: Advanced memory management and object pooling for performance
 * - **Rule**: Core rule definition and structure for validation operations
 * - **Streaming Validator**: Memory-efficient streaming validation for large datasets
 * - **Validra Engine**: Main validation engine orchestrating all validation operations
 *
 * Key features:
 * - **High Performance**: Optimized for enterprise-scale validation workloads
 * - **Memory Efficient**: Advanced memory management with object pooling
 * - **Scalable Architecture**: Component-based design supporting various validation patterns
 * - **Streaming Support**: Memory-efficient processing of large datasets
 * - **Async Processing**: Non-blocking validation for improved application responsiveness
 * - **Caching System**: Intelligent caching for improved performance and reduced computation
 *
 * Engine capabilities:
 * - **Synchronous Validation**: Fast, blocking validation for immediate results
 * - **Asynchronous Validation**: Non-blocking validation with Promise-based API
 * - **Streaming Validation**: Generator-based validation for large datasets
 * - **Batch Processing**: Efficient batch validation with optimized resource usage
 * - **Error Handling**: Comprehensive error management and recovery mechanisms
 * - **Performance Monitoring**: Built-in metrics and performance tracking
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Import main validation engine
 * import { ValidraEngine, Rule } from 'validra/engine';
 *
 * const engine = new ValidraEngine();
 * const rules: Rule[] = [
 *   { field: 'email', op: 'isEmail' },
 *   { field: 'age', op: 'min', params: [18] }
 * ];
 *
 * const result = engine.validate(userData, rules);
 * ```
 *
 * @example
 * ```typescript
 * // Import specific validation components
 * import {
 *   SyncValidator,
 *   AsyncValidator,
 *   StreamValidator,
 *   CacheManager
 * } from 'validra/engine';
 *
 * // Use specialized validators for specific needs
 * const syncValidator = new SyncValidator(options);
 * const result = syncValidator.validate(data, rules);
 * ```
 *
 * @see {@link ValidraEngine} for the main validation engine
 * @see {@link SyncValidator} for synchronous validation
 * @see {@link AsyncValidator} for asynchronous validation
 * @see {@link StreamValidator} for streaming validation
 */

// Specialized validation components
export * from './components';

// Type definitions and interfaces
export * from './interfaces';

// Memory management and object pooling
export * from './memory-pool';

// Core rule definition and structure
export * from './rule';

// Streaming validation for large datasets
export * from './streaming-validator';

// Main validation engine
export * from './validra-engine';
