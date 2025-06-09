/**
 * @fileoverview Type definitions for primitive value validation and data structure support
 * @module UtilityTypes
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Union type representing flat primitive values supported throughout the Validra validation ecosystem.
 *
 * This fundamental type definition encompasses the core primitive data types that are
 * commonly used in validation operations, comparisons, and data processing throughout
 * the Validra library. Designed to provide type safety while maintaining flexibility
 * for the most common validation scenarios and data manipulation operations.
 *
 * Supported types:
 * - **string**: Text data including empty strings, Unicode, and multi-byte characters
 * - **number**: Numeric values including integers, decimals, Infinity, and -Infinity (excludes NaN)
 * - **boolean**: Boolean values (true/false) for logical operations and flags
 * - **Date**: Date objects for temporal data validation and comparison operations
 *
 * Type characteristics:
 * - **Serializable**: All types can be safely serialized for storage and transmission
 * - **Comparable**: Types support standard comparison operations for validation rules
 * - **Primitive-based**: Focus on fundamental data types for predictable behavior
 * - **Validation-friendly**: Optimized for common validation patterns and operations
 * - **Type-safe**: Provides compile-time type checking for enhanced development experience
 *
 * Use cases:
 * - **Form Validation**: Validating user input fields and form data
 * - **API Validation**: Ensuring request/response data matches expected primitive types
 * - **Configuration Validation**: Validating configuration values and settings
 * - **Data Processing**: Type-safe data transformation and manipulation operations
 * - **Rule Definition**: Defining validation rules with type-safe value constraints
 * - **Comparison Operations**: Safe value comparison in validation logic
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // String values for text validation
 * const email: flatValues = "user@example.com";
 * const username: flatValues = "john_doe";
 * const description: flatValues = "";  // empty string is valid
 * ```
 *
 * @example
 * ```typescript
 * // Numeric values for mathematical validation
 * const age: flatValues = 25;
 * const price: flatValues = 99.99;
 * const score: flatValues = 0;        // zero is valid
 * const infinity: flatValues = Infinity;  // infinity is valid
 * ```
 *
 * @example
 * ```typescript
 * // Boolean values for logical validation
 * const isActive: flatValues = true;
 * const isVerified: flatValues = false;
 * const hasPermission: flatValues = Boolean(userRole === 'admin');
 * ```
 *
 * @example
 * ```typescript
 * // Date values for temporal validation
 * const createdAt: flatValues = new Date();
 * const birthday: flatValues = new Date('1990-01-01');
 * const deadline: flatValues = new Date(Date.now() + 86400000); // tomorrow
 * ```
 *
 * @example
 * ```typescript
 * // Function accepting flatValues for flexible validation
 * function validatePrimitiveValue(value: flatValues): boolean {
 *   // Type-safe handling of all supported primitive types
 *   if (typeof value === 'string') {
 *     return value.length > 0;
 *   }
 *   if (typeof value === 'number') {
 *     return !isNaN(value) && isFinite(value);
 *   }
 *   if (typeof value === 'boolean') {
 *     return true; // all boolean values are valid
 *   }
 *   if (value instanceof Date) {
 *     return !isNaN(value.getTime());
 *   }
 *   return false;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Array of flatValues for batch processing
 * const mixedValues: flatValues[] = [
 *   "hello",
 *   42,
 *   true,
 *   new Date(),
 *   -3.14,
 *   false,
 *   ""
 * ];
 *
 * const validValues = mixedValues.filter(validatePrimitiveValue);
 * ```
 */
export type flatValues = string | number | boolean | Date;
