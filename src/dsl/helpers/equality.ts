/**
 * @fileoverview Provides comprehensive equality and inequality comparison utilities
 * @module Equality
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { flatValues, isNullOrUndefined } from '@/utils';

/**
 * Utility class for performing equality and inequality comparisons between values.
 *
 * Provides static methods to compare primitive values and Date objects with proper
 * type handling and validation. The class handles special comparison cases like
 * Date objects by comparing their timestamps rather than object references.
 *
 * All comparison methods validate input parameters and throw descriptive errors
 * for null, undefined, or invalid values to ensure reliable operation.
 *
 * @example Basic Equality Comparisons
 * ```typescript
 * // Primitive value comparisons
 * Equality.isEqual("hello", "hello"); // true
 * Equality.isEqual(42, 42); // true
 * Equality.isEqual(true, true); // true
 * Equality.isEqual("42", 42); // false (strict comparison)
 *
 * // Date object comparisons (by timestamp)
 * const date1 = new Date('2025-01-01T00:00:00Z');
 * const date2 = new Date('2025-01-01T00:00:00Z');
 * Equality.isEqual(date1, date2); // true (same timestamp)
 * ```
 *
 * @example Inequality Comparisons
 * ```typescript
 * // Primitive inequality
 * Equality.isNotEqual("foo", "bar"); // true
 * Equality.isNotEqual(10, 20); // true
 * Equality.isNotEqual("test", "test"); // false
 *
 * // Date inequality
 * const today = new Date('2025-01-01');
 * const tomorrow = new Date('2025-01-02');
 * Equality.isNotEqual(today, tomorrow); // true
 * ```
 *
 * @example Error Handling
 * ```typescript
 * try {
 *   Equality.isEqual(null, "value"); // throws Error
 * } catch (error) {
 *   console.error('Comparison failed:', error.message);
 * }
 * ```
 *
 * @see {@link Comparison} for numerical comparisons and range validations
 * @see {@link TypeChecker} for type validation utilities
 *
 * @public
 * @since 1.0.0
 */
export class Equality {
  /**
   * Compares two values for strict equality with special handling for Date objects.
   *
   * Performs strict equality comparison (===) for most data types, but provides
   * special handling for Date objects by comparing their underlying timestamps
   * rather than object references. This ensures that Date objects representing
   * the same moment in time are considered equal even if they are different instances.
   *
   * @param valueA - The first value to compare
   * @param valueB - The second value to compare
   * @returns `true` if the values are considered equal, `false` otherwise
   *
   * @throws {Error} When either value is null or undefined
   *
   * @example Primitive Value Equality
   * ```typescript
   * Equality.isEqual(123, 123); // true
   * Equality.isEqual("test", "test"); // true
   * Equality.isEqual(true, true); // true
   * Equality.isEqual(123, "123"); // false (strict equality)
   * Equality.isEqual(0, false); // false (strict equality)
   * ```
   *
   * @example Date Object Equality
   * ```typescript
   * const date1 = new Date('2025-01-01T00:00:00Z');
   * const date2 = new Date('2025-01-01T00:00:00Z');
   * const date3 = new Date('2025-01-02T00:00:00Z');
   *
   * Equality.isEqual(date1, date2); // true (same timestamp)
   * Equality.isEqual(date1, date3); // false (different timestamps)
   * ```
   *
   * @example Error Cases
   * ```typescript
   * Equality.isEqual(null, "value"); // throws Error
   * Equality.isEqual(undefined, 123); // throws Error
   * Equality.isEqual("test", null); // throws Error
   * ```
   *
   * @see {@link isNotEqual} for inequality comparison
   * @see {@link Comparison.isGreaterThan} for numerical comparisons
   *
   * @public
   * @since 1.0.0
   */
  static isEqual(valueA: flatValues, valueB: flatValues): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) {
      throw new Error('Both values must be provided for comparison.');
    }

    if (valueA instanceof Date && valueB instanceof Date) {
      return valueA.getTime() === valueB.getTime();
    }

    return valueA === valueB;
  }

  /**
   * Compares two values for strict inequality with special handling for Date objects.
   *
   * Performs strict inequality comparison (!==) for most data types, but provides
   * special handling for Date objects by comparing their underlying timestamps
   * rather than object references. This ensures consistent inequality behavior
   * that matches the corresponding equality method.
   *
   * @param valueA - The first value to compare
   * @param valueB - The second value to compare
   * @returns `true` if the values are not equal, `false` if they are equal
   *
   * @throws {Error} When either value is null or undefined
   *
   * @example Primitive Value Inequality
   * ```typescript
   * Equality.isNotEqual(123, 456); // true
   * Equality.isNotEqual("foo", "bar"); // true
   * Equality.isNotEqual(true, false); // true
   * Equality.isNotEqual("test", "test"); // false (they are equal)
   * Equality.isNotEqual(42, "42"); // true (strict inequality)
   * ```
   *
   * @example Date Object Inequality
   * ```typescript
   * const date1 = new Date('2025-01-01T00:00:00Z');
   * const date2 = new Date('2025-01-02T00:00:00Z');
   * const date3 = new Date('2025-01-01T00:00:00Z');
   *
   * Equality.isNotEqual(date1, date2); // true (different timestamps)
   * Equality.isNotEqual(date1, date3); // false (same timestamp)
   * ```
   *
   * @example Validation Use Case
   * ```typescript
   * // Validate that a new password is different from the old one
   * const oldPassword = "oldPass123";
   * const newPassword = "newPass456";
   *
   * if (Equality.isNotEqual(oldPassword, newPassword)) {
   *   console.log("Password successfully changed");
   * } else {
   *   console.log("New password must be different from old password");
   * }
   * ```
   *
   * @see {@link isEqual} for equality comparison
   * @see {@link Comparison.isLessThan} for numerical comparisons
   *
   * @public
   * @since 1.0.0
   */
  static isNotEqual(valueA: flatValues, valueB: flatValues): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) {
      throw new Error('Both values must be provided for comparison.');
    }

    if (valueA instanceof Date && valueB instanceof Date) {
      return valueA.getTime() !== valueB.getTime();
    }

    return valueA !== valueB;
  }
}
