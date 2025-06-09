/**
 * @fileoverview Domain-specific language components and validation helpers for expressive rule definition
 * @module dsl
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Domain-specific language (DSL) module providing expressive validation helpers and rule definition components.
 *
 * The DSL module offers a comprehensive set of validation helpers, factories, and interfaces
 * that enable developers to create powerful, readable, and maintainable validation rules.
 * Designed with a focus on developer experience, type safety, and extensibility for
 * complex validation scenarios.
 *
 * Exported components:
 * - **Helpers**: Collection of specialized validation helper classes and utilities
 * - **Factory**: Helper factory for dynamic validation helper creation and management
 * - **Interfaces**: Type definitions and contracts for DSL components
 *
 * Key features:
 * - **Expressive Syntax**: Human-readable validation rule definitions
 * - **Type Safety**: Full TypeScript support with comprehensive type checking
 * - **Extensible Design**: Pluggable architecture for custom validation logic
 * - **Performance Optimized**: Efficient helper resolution and caching mechanisms
 * - **Modular Architecture**: Organized helper categories for specific validation domains
 * - **Rich Validation Set**: Comprehensive coverage of common validation scenarios
 *
 * Available helper categories:
 * - **Type Checking**: Type validation and runtime type safety
 * - **String Validation**: Text pattern matching, format validation, and string operations
 * - **Numeric Validation**: Mathematical comparisons and numeric range validation
 * - **Date Validation**: Temporal comparisons and date/time validation
 * - **Collection Validation**: Array and object structure validation
 * - **Equality Validation**: Value comparison and equivalence checking
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Import DSL components for rule definition
 * import { helpersActions, TypeChecker, StringChecker } from 'validra/dsl';
 *
 * // Use helpers for validation logic
 * const isEmail = helpersActions.getHelperResolverSchema('isEmail');
 * const isRequired = helpersActions.getHelperResolverSchema('required');
 * ```
 *
 * @example
 * ```typescript
 * // Create complex validation rules using DSL helpers
 * import { Rule } from 'validra';
 *
 * const userValidationRules: Rule[] = [
 *   { field: 'email', op: 'isEmail' },
 *   { field: 'age', op: 'min', params: [18] },
 *   { field: 'name', op: 'required' },
 *   { field: 'profile.bio', op: 'maxLength', params: [500] }
 * ];
 * ```
 *
 * @see {@link helpersActions} for helper factory and resolution
 * @see {@link TypeChecker} for type validation helpers
 * @see {@link StringChecker} for string validation helpers
 */

// Validation helper classes and utilities
export * from './helpers';

// Helper factory and resolution system
export * from './helpers-facotry';

// Type definitions and interfaces
export * from './interfaces';
