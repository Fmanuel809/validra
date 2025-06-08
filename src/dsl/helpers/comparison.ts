/**
 * @fileoverview Numerical comparison utilities for the Validra library.
 *
 * This module provides the Comparison class with static methods for performing
 * numerical comparisons including greater than, less than, equal comparisons,
 * and range validations. All methods include proper validation and error handling.
 *
 * @module Comparison
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { isNullOrUndefined, isNumber } from "@/utils";

/**
 * Utility class for performing numerical comparisons and range validations.
 *
 * Provides static methods to compare numbers with proper type validation
 * and error handling. All methods validate inputs and throw descriptive
 * errors for invalid values.
 *
 * @example
 * ```typescript
 * // Basic comparisons
 * Comparison.isGreaterThan(10, 5);        // true
 * Comparison.isLessThan(3, 8);            // true
 * Comparison.isGreaterThanOrEqual(5, 5);  // true
 * Comparison.isLessThanOrEqual(4, 7);     // true
 *
 * // Range validations
 * Comparison.between(5, 1, 10);           // true
 * Comparison.notBetween(15, 1, 10);       // true
 *
 * // Error handling
 * Comparison.isGreaterThan(null, 5);      // throws Error
 * Comparison.isGreaterThan("10", 5);      // throws Error
 * ```
 *
 * @public
 */

export class Comparison {
  /**
   * Checks if the first value is greater than the second value.
   *
   * Performs a strict numerical comparison after validating that both
   * values are valid numbers and not null or undefined.
   *
   * @param valueA - The first number to compare
   * @param valueB - The second number to compare
   * @returns `true` if valueA is greater than valueB, `false` otherwise
   * @throws {Error} When either value is null, undefined, or not a number
   *
   * @example
   * ```typescript
   * Comparison.isGreaterThan(10, 5);     // true
   * Comparison.isGreaterThan(3, 8);      // false
   * Comparison.isGreaterThan(5, 5);      // false
   * Comparison.isGreaterThan(-1, -5);    // true
   * ```
   *
   * @public
   * @static
   */
  static isGreaterThan(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB))
      throw new Error("Both values must be provided for comparison.");

    if (!isNumber(valueA) || !isNumber(valueB))
      throw new Error("Both values must be numbers for comparison.");

    return valueA > valueB;
  }

  /**
   * Checks if the first value is less than the second value.
   *
   * Performs a strict numerical comparison after validating that both
   * values are valid numbers and not null or undefined.
   *
   * @param valueA - The first number to compare
   * @param valueB - The second number to compare
   * @returns `true` if valueA is less than valueB, `false` otherwise
   * @throws {Error} When either value is null, undefined, or not a number
   *
   * @example
   * ```typescript
   * Comparison.isLessThan(3, 8);         // true
   * Comparison.isLessThan(10, 5);        // false
   * Comparison.isLessThan(5, 5);         // false
   * Comparison.isLessThan(-5, -1);       // true
   * ```
   *
   * @public
   * @static
   */
  static isLessThan(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB))
      throw new Error("Both values must be provided for comparison.");

    if (!isNumber(valueA) || !isNumber(valueB))
      throw new Error("Both values must be numbers for comparison.");

    return valueA < valueB;
  }

  /**
   * Checks if the first value is greater than or equal to the second value.
   *
   * Performs a strict numerical comparison after validating that both
   * values are valid numbers and not null or undefined.
   *
   * @param valueA - The first number to compare
   * @param valueB - The second number to compare
   * @returns `true` if valueA is greater than or equal to valueB, `false` otherwise
   * @throws {Error} When either value is null, undefined, or not a number
   *
   * @example
   * ```typescript
   * Comparison.isGreaterThanOrEqual(10, 5);    // true
   * Comparison.isGreaterThanOrEqual(5, 5);     // true
   * Comparison.isGreaterThanOrEqual(3, 8);     // false
   * Comparison.isGreaterThanOrEqual(0, -1);    // true
   * ```
   *
   * @public
   * @static
   */
  static isGreaterThanOrEqual(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB))
      throw new Error("Both values must be provided for comparison.");

    if (!isNumber(valueA) || !isNumber(valueB))
      throw new Error("Both values must be numbers for comparison.");

    return valueA >= valueB;
  }

  /**
   * Checks if the first value is less than or equal to the second value.
   *
   * Performs a strict numerical comparison after validating that both
   * values are valid numbers and not null or undefined.
   *
   * @param valueA - The first number to compare
   * @param valueB - The second number to compare
   * @returns `true` if valueA is less than or equal to valueB, `false` otherwise
   * @throws {Error} When either value is null, undefined, or not a number
   *
   * @example
   * ```typescript
   * Comparison.isLessThanOrEqual(3, 8);        // true
   * Comparison.isLessThanOrEqual(5, 5);        // true
   * Comparison.isLessThanOrEqual(10, 5);       // false
   * Comparison.isLessThanOrEqual(-1, 0);       // true
   * ```
   *
   * @public
   * @static
   */
  static isLessThanOrEqual(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB))
      throw new Error("Both values must be provided for comparison.");

    if (!isNumber(valueA) || !isNumber(valueB))
      throw new Error("Both values must be numbers for comparison.");

    return valueA <= valueB;
  }

  /**
   * Checks if a value is within a specified range (inclusive).
   *
   * Validates that the value is between the minimum and maximum values,
   * including the boundaries. All three values must be valid numbers.
   *
   * @param value - The value to check
   * @param min - The minimum value of the range (inclusive)
   * @param max - The maximum value of the range (inclusive)
   * @returns `true` if value is between min and max (inclusive), `false` otherwise
   * @throws {Error} When any value is null, undefined, or not a number
   *
   * @example
   * ```typescript
   * Comparison.between(5, 1, 10);              // true
   * Comparison.between(1, 1, 10);              // true (inclusive)
   * Comparison.between(10, 1, 10);             // true (inclusive)
   * Comparison.between(0, 1, 10);              // false
   * Comparison.between(15, 1, 10);             // false
   * ```
   *
   * @public
   * @static
   */
  static between(value: number, min: number, max: number): boolean {
    if (
      isNullOrUndefined(value) ||
      isNullOrUndefined(min) ||
      isNullOrUndefined(max)
    )
      throw new Error("All three values must be provided for comparison.");

    if (!isNumber(value) || !isNumber(min) || !isNumber(max))
      throw new Error("All three values must be numbers for comparison.");

    return value >= min && value <= max;
  }

  /**
   * Checks if a value is outside a specified range.
   *
   * Validates that the value is either less than the minimum or greater
   * than the maximum value. All three values must be valid numbers.
   *
   * @param value - The value to check
   * @param min - The minimum value of the range
   * @param max - The maximum value of the range
   * @returns `true` if value is outside the min-max range, `false` otherwise
   * @throws {Error} When any value is null, undefined, or not a number
   *
   * @example
   * ```typescript
   * Comparison.notBetween(0, 1, 10);           // true
   * Comparison.notBetween(15, 1, 10);          // true
   * Comparison.notBetween(5, 1, 10);           // false
   * Comparison.notBetween(1, 1, 10);           // false
   * Comparison.notBetween(10, 1, 10);          // false
   * ```
   *
   * @public
   * @static
   */
  static notBetween(value: number, min: number, max: number): boolean {
    if (
      isNullOrUndefined(value) ||
      isNullOrUndefined(min) ||
      isNullOrUndefined(max)
    )
      throw new Error("All three values must be provided for comparison.");

    if (!isNumber(value) || !isNumber(min) || !isNumber(max))
      throw new Error("All three values must be numbers for comparison.");

    return value < min || value > max;
  }
}
