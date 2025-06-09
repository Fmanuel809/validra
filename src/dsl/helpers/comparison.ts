/**
 * @fileoverview Provides comprehensive numerical comparison and range validation utilities
 * @module Comparison
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { isNullOrUndefined, isNumber } from '@/utils';

/**
 * Utility class for performing numerical comparisons and range validations.
 *
 * Provides static methods to compare numbers with comprehensive type validation
 * and error handling. All methods validate inputs to ensure they are valid numbers
 * and throw descriptive errors for invalid values, ensuring reliable operation
 * in business rule validation scenarios.
 *
 * The class supports all standard numerical comparison operations including
 * greater than, less than, greater/less than or equal, and range validations
 * (between/not between operations).
 *
 * @example Basic Numerical Comparisons
 * ```typescript
 * // Standard comparisons
 * Comparison.isGreaterThan(10, 5);        // true
 * Comparison.isLessThan(3, 8);            // true
 * Comparison.isGreaterThanOrEqual(5, 5);  // true
 * Comparison.isLessThanOrEqual(4, 7);     // true
 *
 * // Decimal and negative number support
 * Comparison.isGreaterThan(3.14, 3.1);    // true
 * Comparison.isLessThan(-10, -5);         // true
 * ```
 *
 * @example Range Validation Operations
 * ```typescript
 * // Inclusive range checking
 * Comparison.between(5, 1, 10);           // true (5 is between 1 and 10)
 * Comparison.between(1, 1, 10);           // true (boundary inclusive)
 * Comparison.between(10, 1, 10);          // true (boundary inclusive)
 * Comparison.between(0, 1, 10);           // false (outside range)
 *
 * // Exclusive range checking
 * Comparison.notBetween(15, 1, 10);       // true (15 is not between 1 and 10)
 * Comparison.notBetween(5, 1, 10);        // false (5 is between 1 and 10)
 * ```
 *
 * @example Input Validation and Error Handling
 * ```typescript
 * // These will throw descriptive errors:
 * Comparison.isGreaterThan(null, 5);      // throws Error: values must be provided
 * Comparison.isGreaterThan("10", 5);      // throws Error: values must be numbers
 * Comparison.isGreaterThan(NaN, 5);       // throws Error: values must be numbers
 * Comparison.between(5, null, 10);        // throws Error: all values must be provided
 * ```
 *
 * @example Real-world Usage in Validation Rules
 * ```typescript
 * // Age validation
 * const age = 25;
 * const isAdult = Comparison.isGreaterThanOrEqual(age, 18); // true
 * const isSenior = Comparison.isGreaterThanOrEqual(age, 65); // false
 *
 * // Price range validation
 * const price = 49.99;
 * const isAffordable = Comparison.between(price, 10, 100); // true
 *
 * // Score validation
 * const score = 85;
 * const isPassing = Comparison.isGreaterThanOrEqual(score, 60); // true
 * const isExcellent = Comparison.isGreaterThan(score, 90); // false
 * ```
 *
 * @see {@link Equality} for equality and inequality comparisons
 * @see {@link TypeChecker.isNumber} for number type validation
 * @see {@link DateMatcher} for date-specific comparisons
 *
 * @public
 * @since 1.0.0
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
   */
  static isGreaterThan(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) {
      throw new Error('Both values must be provided for comparison.');
    }

    if (!isNumber(valueA) || !isNumber(valueB)) {
      throw new Error('Both values must be numbers for comparison.');
    }

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
   */
  static isLessThan(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) {
      throw new Error('Both values must be provided for comparison.');
    }

    if (!isNumber(valueA) || !isNumber(valueB)) {
      throw new Error('Both values must be numbers for comparison.');
    }

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
   */
  static isGreaterThanOrEqual(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) {
      throw new Error('Both values must be provided for comparison.');
    }

    if (!isNumber(valueA) || !isNumber(valueB)) {
      throw new Error('Both values must be numbers for comparison.');
    }

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
   */
  static isLessThanOrEqual(valueA: number, valueB: number): boolean {
    if (isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) {
      throw new Error('Both values must be provided for comparison.');
    }

    if (!isNumber(valueA) || !isNumber(valueB)) {
      throw new Error('Both values must be numbers for comparison.');
    }

    return valueA <= valueB;
  }

  /**
   * Validates whether a value falls within a specified inclusive range.
   *
   * This method checks if a given numeric value is between (and including)
   * the specified minimum and maximum boundaries. Both boundaries are inclusive,
   * meaning the value can equal either the minimum or maximum and still be
   * considered within range.
   *
   * All three parameters must be valid numbers, and the method provides
   * comprehensive input validation with descriptive error messages.
   *
   * @param value - The numeric value to test against the range
   * @param min - The minimum boundary of the range (inclusive)
   * @param max - The maximum boundary of the range (inclusive)
   * @returns `true` if the value is within the inclusive range, `false` otherwise
   *
   * @throws {Error} When any parameter is null, undefined, or not a valid number
   *
   * @example Basic Range Validation
   * ```typescript
   * Comparison.between(5, 1, 10);              // true (within range)
   * Comparison.between(1, 1, 10);              // true (equals minimum boundary)
   * Comparison.between(10, 1, 10);             // true (equals maximum boundary)
   * Comparison.between(0, 1, 10);              // false (below minimum)
   * Comparison.between(15, 1, 10);             // false (above maximum)
   * ```
   *
   * @example Decimal and Negative Number Support
   * ```typescript
   * Comparison.between(3.5, 3.0, 4.0);         // true
   * Comparison.between(-5, -10, 0);            // true (negative ranges)
   * Comparison.between(2.99, 3.0, 4.0);        // false (just below minimum)
   * ```
   *
   * @example Real-world Applications
   * ```typescript
   * // Age range validation
   * const age = 25;
   * const isWorkingAge = Comparison.between(age, 18, 65); // true
   *
   * // Grade validation (0-100 scale)
   * const grade = 85;
   * const isValidGrade = Comparison.between(grade, 0, 100); // true
   *
   * // Temperature range check
   * const temperature = 22.5;
   * const isComfortable = Comparison.between(temperature, 20, 25); // true
   * ```
   *
   * @example Error Handling
   * ```typescript
   * // These will throw descriptive errors:
   * Comparison.between(null, 1, 10);           // Error: values must be provided
   * Comparison.between(5, "1", 10);            // Error: values must be numbers
   * Comparison.between(5, 1, undefined);       // Error: values must be provided
   * ```
   *
   * @see {@link notBetween} for exclusive range validation
   * @see {@link isGreaterThanOrEqual} for minimum boundary checking
   * @see {@link isLessThanOrEqual} for maximum boundary checking
   *
   * @public
   * @since 1.0.0
   */
  static between(value: number, min: number, max: number): boolean {
    if (isNullOrUndefined(value) || isNullOrUndefined(min) || isNullOrUndefined(max)) {
      throw new Error('All three values must be provided for comparison.');
    }

    if (!isNumber(value) || !isNumber(min) || !isNumber(max)) {
      throw new Error('All three values must be numbers for comparison.');
    }

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
   */
  static notBetween(value: number, min: number, max: number): boolean {
    if (isNullOrUndefined(value) || isNullOrUndefined(min) || isNullOrUndefined(max)) {
      throw new Error('All three values must be provided for comparison.');
    }

    if (!isNumber(value) || !isNumber(min) || !isNumber(max)) {
      throw new Error('All three values must be numbers for comparison.');
    }

    return value < min || value > max;
  }
}
