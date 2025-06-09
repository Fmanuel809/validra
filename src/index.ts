/**
 * @fileoverview Main entry point and public API for the Validra validation library
 * @module validra
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Main export barrel for the Validra validation library's public API.
 *
 * This module serves as the primary entry point for the Validra validation ecosystem,
 * providing comprehensive access to all validation components, DSL helpers, utilities,
 * and core engine functionality. Designed to offer a clean, organized, and intuitive
 * API surface for developers using the Validra library.
 *
 * Exported modules:
 * - **DSL**: Domain-specific language components and validation helpers
 * - **Engine**: Core validation engine and processing components
 * - **Utils**: Utility functions, type guards, and helper tools
 *
 * Key features provided:
 * - **Complete Validation Engine**: Full-featured validation processing with performance optimization
 * - **Flexible DSL**: Expressive domain-specific language for rule definition and validation logic
 * - **Type Safety**: Comprehensive TypeScript support with strict type checking
 * - **Performance Optimized**: High-performance validation for production applications
 * - **Memory Efficient**: Intelligent memory management and object pooling
 * - **Extensible Architecture**: Modular design supporting custom validation logic
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Import the complete Validra API
 * import * as Validra from 'validra';
 *
 * // Or import specific components
 * import { ValidraEngine, Rule } from 'validra';
 * ```
 *
 * @example
 * ```typescript
 * // Basic validation setup and usage
 * import { ValidraEngine, Rule } from 'validra';
 *
 * const engine = new ValidraEngine();
 * const rules: Rule[] = [
 *   { field: 'email', op: 'isEmail' },
 *   { field: 'age', op: 'min', params: [18] }
 * ];
 *
 * const result = engine.validate({ email: 'user@example.com', age: 25 }, rules);
 * console.log(result.isValid); // true
 * ```
 *
 * @see {@link https://github.com/validra/validra} for complete documentation and examples
 */

// Core validation engine and components
export * from './engine';

// Domain-specific language and validation helpers
export * from './dsl';

// Utility functions and type definitions
export * from './utils';
