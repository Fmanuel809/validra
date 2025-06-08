/**
 * @fileoverview Runtime type checking utilities for the Validra library.
 *
 * This module provides the TypeChecker class with static methods for performing
 * runtime type validation and type guards. It's designed to work with both
 * JavaScript and TypeScript environments, providing reliable type checking
 * for common data types.
 *
 * @module TypeChecker
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

/**
 * Utility class for runtime type checking and validation.
 *
 * Provides static methods to perform type guards and runtime type validation
 * for common JavaScript/TypeScript data types. All methods are static and
 * can be called without instantiating the class.
 *
 * @example
 * ```typescript
 * // Basic type checking
 * TypeChecker.isString("hello");     // true
 * TypeChecker.isNumber(42);          // true
 * TypeChecker.isBoolean(true);       // true
 *
 * // Date validation
 * TypeChecker.isDate(new Date());    // true
 * TypeChecker.isDate("2025-01-01");  // false
 *
 * // Object and array distinction
 * TypeChecker.isArray([1, 2, 3]);    // true
 * TypeChecker.isObject({key: "value"}); // true
 * TypeChecker.isObject([1, 2, 3]);   // false
 * ```
 *
 * @public
 */
export class TypeChecker {
  /**
   * Checks if a value is a string.
   *
   * Performs a strict type check using the `typeof` operator to determine
   * if the provided value is of string type.
   *
   * @param value - The value to check
   * @returns `true` if the value is a string, `false` otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isString("hello");    // true
   * TypeChecker.isString("");         // true
   * TypeChecker.isString(123);        // false
   * TypeChecker.isString(null);       // false
   * ```
   *
   * @public
   * @static
   */
  static isString(value: unknown): boolean {
    return typeof value === 'string' || value instanceof String;
  }

  /**
   * Checks if a value is a Date instance.
   *
   * Uses the `instanceof` operator to determine if the provided value
   * is an instance of the Date constructor. Note that this returns `true`
   * even for invalid Date objects.
   *
   * @param value - The value to check
   * @returns `true` if the value is a Date instance, `false` otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isDate(new Date());           // true
   * TypeChecker.isDate(new Date("invalid")); // true (still a Date instance)
   * TypeChecker.isDate("2025-01-01");        // false
   * TypeChecker.isDate(1735689600000);       // false (timestamp)
   * ```
   *
   * @public
   * @static
   */
  static isDate(value: unknown): boolean {
    return value instanceof Date;
  }

  /**
   * Checks if a value is a valid number.
   *
   * Performs a strict type check for numbers and excludes `NaN` values.
   * This method returns `true` for all finite numbers, `Infinity`, and
   * `-Infinity`, but `false` for `NaN`.
   *
   * @param value - The value to check
   * @returns `true` if the value is a valid number (excluding NaN), `false` otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isNumber(42);         // true
   * TypeChecker.isNumber(3.14);       // true
   * TypeChecker.isNumber(Infinity);   // true
   * TypeChecker.isNumber(NaN);        // false
   * TypeChecker.isNumber("123");      // false
   * ```
   *
   * @public
   * @static
   */
  static isNumber(value: unknown): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Checks if a value is a boolean.
   *
   * Performs a strict type check using the `typeof` operator to determine
   * if the provided value is of boolean type. Only `true` and `false`
   * return `true`; truthy/falsy values are not considered booleans.
   *
   * @param value - The value to check
   * @returns `true` if the value is a boolean, `false` otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isBoolean(true);      // true
   * TypeChecker.isBoolean(false);     // true
   * TypeChecker.isBoolean(1);         // false
   * TypeChecker.isBoolean("");        // false
   * TypeChecker.isBoolean("true");    // false
   * ```
   *
   * @public
   * @static
   */
  static isBoolean(value: unknown): boolean {
    return typeof value === 'boolean';
  }

  /**
   * Checks if a value is an array.
   *
   * Uses the built-in `Array.isArray()` method to determine if the provided
   * value is an array. This is the recommended way to check for arrays in
   * JavaScript as it works correctly across different execution contexts.
   *
   * @param value - The value to check
   * @returns `true` if the value is an array, `false` otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isArray([]);              // true
   * TypeChecker.isArray([1, 2, 3]);       // true
   * TypeChecker.isArray(new Array(5));    // true
   * TypeChecker.isArray({length: 3});     // false (array-like object)
   * TypeChecker.isArray("string");        // false
   * ```
   *
   * @public
   * @static
   */
  static isArray(value: unknown): boolean {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is a plain object.
   *
   * Determines if the provided value is a plain object (not null, not an array,
   * and of type 'object'). This includes user-defined objects, built-in objects
   * like Date and RegExp, but excludes arrays and null.
   *
   * @param value - The value to check
   * @returns `true` if the value is an object (excluding arrays and null), `false` otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isObject({});             // true
   * TypeChecker.isObject({key: "value"}); // true
   * TypeChecker.isObject(new Date());     // true
   * TypeChecker.isObject([]);             // false
   * TypeChecker.isObject(null);           // false
   * TypeChecker.isObject("string");       // false
   * ```
   *
   * @public
   * @static
   */
  static isObject(value: unknown): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
}
