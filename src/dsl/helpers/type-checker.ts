/**
 * @fileoverview Runtime type checking utilities for the Validra validation library
 * @module TypeChecker
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

/**
 * Utility class providing static methods for runtime type checking and validation.
 *
 * Performs type guards and runtime type validation for common JavaScript/TypeScript
 * data types. All methods are static and designed for use without class instantiation.
 * Essential for validating data types in dynamic validation scenarios.
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic primitive type checking
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
 * TypeChecker.isObject([1, 2, 3]);   // false (arrays are not plain objects)
 *
 * // Use in validation logic
 * function validateInput(value: unknown) {
 *   if (TypeChecker.isString(value)) {
 *     // TypeScript now knows value is string
 *     return value.trim().length > 0;
 *   }
 *   return false;
 * }
 * ```
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates | TypeScript Type Predicates}
 */
export class TypeChecker {
  /**
   * Checks if a value is a string primitive or String object.
   *
   * Performs a strict type check using the `typeof` operator and `instanceof`
   * to determine if the provided value is of string type. Handles both string
   * primitives and String object instances.
   *
   * @public
   * @static
   * @param {unknown} value - The value to check for string type
   * @returns {boolean} True if the value is a string primitive or String object, false otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isString("hello");        // true (primitive)
   * TypeChecker.isString("");             // true (empty string)
   * TypeChecker.isString(new String("hi")); // true (String object)
   * TypeChecker.isString(123);            // false
   * TypeChecker.isString(null);           // false
   * TypeChecker.isString(undefined);      // false
   * ```
   *
   * @since 1.0.0
   */
  static isString(value: unknown): boolean {
    return typeof value === 'string' || value instanceof String;
  }

  /**
   * Checks if a value is a Date instance.
   *
   * Uses the `instanceof` operator to determine if the provided value
   * is an instance of the Date constructor. Note that this returns `true`
   * even for invalid Date objects (those created with invalid date strings).
   *
   * @public
   * @static
   * @param {unknown} value - The value to check for Date instance
   * @returns {boolean} True if the value is a Date instance (valid or invalid), false otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isDate(new Date());              // true
   * TypeChecker.isDate(new Date("2025-01-01"));  // true (valid date)
   * TypeChecker.isDate(new Date("invalid"));     // true (still a Date instance, but invalid)
   * TypeChecker.isDate("2025-01-01");            // false (string)
   * TypeChecker.isDate(1735689600000);           // false (timestamp number)
   * TypeChecker.isDate(null);                    // false
   *
   * // To check for valid dates, combine with additional validation:
   * const isValidDate = (value: unknown): boolean => {
   *   return TypeChecker.isDate(value) && !isNaN((value as Date).getTime());
   * };
   * ```
   *
   * @since 1.0.0
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date | MDN Date Documentation}
   */
  static isDate(value: unknown): boolean {
    return value instanceof Date;
  }

  /**
   * Checks if a value is a valid number (excluding NaN).
   *
   * Performs a strict type check for numbers and excludes `NaN` values.
   * This method returns `true` for all finite numbers, `Infinity`, and
   * `-Infinity`, but `false` for `NaN`. Essential for numeric validation
   * in dynamic scenarios where type safety is critical.
   *
   * @public
   * @static
   * @param {unknown} value - The value to check for valid number type
   * @returns {boolean} True if the value is a valid number (excluding NaN), false otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isNumber(42);           // true (integer)
   * TypeChecker.isNumber(3.14159);      // true (float)
   * TypeChecker.isNumber(-273.15);      // true (negative)
   * TypeChecker.isNumber(Infinity);     // true (positive infinity)
   * TypeChecker.isNumber(-Infinity);    // true (negative infinity)
   * TypeChecker.isNumber(NaN);          // false (Not a Number)
   * TypeChecker.isNumber("123");        // false (string representation)
   * TypeChecker.isNumber(null);         // false
   * TypeChecker.isNumber(undefined);    // false
   *
   * // Use in validation logic
   * function validateAge(age: unknown): boolean {
   *   return TypeChecker.isNumber(age) && age >= 0 && age <= 150;
   * }
   * ```
   *
   * @since 1.0.0
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number | MDN Number Documentation}
   */
  static isNumber(value: unknown): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Checks if a value is a boolean primitive.
   *
   * Performs a strict type check using the `typeof` operator to determine
   * if the provided value is of boolean type. Only `true` and `false`
   * return `true`; truthy/falsy values are not considered booleans.
   * This ensures type safety in boolean validation scenarios.
   *
   * @public
   * @static
   * @param {unknown} value - The value to check for boolean type
   * @returns {boolean} True if the value is a boolean primitive, false otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isBoolean(true);       // true
   * TypeChecker.isBoolean(false);      // true
   * TypeChecker.isBoolean(1);          // false (truthy but not boolean)
   * TypeChecker.isBoolean(0);          // false (falsy but not boolean)
   * TypeChecker.isBoolean("");         // false (falsy string)
   * TypeChecker.isBoolean("true");     // false (string representation)
   * TypeChecker.isBoolean(null);       // false
   * TypeChecker.isBoolean(undefined);  // false
   *
   * // Use in form validation
   * function validateCheckbox(value: unknown): boolean {
   *   return TypeChecker.isBoolean(value) && value === true;
   * }
   * ```
   *
   * @since 1.0.0
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean | MDN Boolean Documentation}
   */
  static isBoolean(value: unknown): boolean {
    return typeof value === 'boolean';
  }

  /**
   * Checks if a value is an array instance.
   *
   * Uses the built-in `Array.isArray()` method to determine if the provided
   * value is an array. This is the recommended way to check for arrays in
   * JavaScript as it works correctly across different execution contexts
   * and iframe boundaries, avoiding prototype chain issues.
   *
   * @public
   * @static
   * @param {unknown} value - The value to check for array type
   * @returns {boolean} True if the value is an array instance, false otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isArray([]);                    // true (empty array)
   * TypeChecker.isArray([1, 2, 3]);             // true (populated array)
   * TypeChecker.isArray(new Array(5));          // true (Array constructor)
   * TypeChecker.isArray(Array.from("hello"));   // true (Array.from result)
   * TypeChecker.isArray({length: 3});           // false (array-like object)
   * TypeChecker.isArray("string");              // false
   * TypeChecker.isArray(null);                  // false
   *
   * // Use in data processing
   * function processItems(items: unknown): number {
   *   if (TypeChecker.isArray(items)) {
   *     return items.length; // TypeScript knows items is an array
   *   }
   *   return 0;
   * }
   * ```
   *
   * @since 1.0.0
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray | MDN Array.isArray Documentation}
   */
  static isArray(value: unknown): boolean {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is a plain object (excluding arrays, null, and built-in objects).
   *
   * Determines if the provided value is a plain object (not null, not an array,
   * and of type 'object'). This includes user-defined objects and built-in objects
   * like Date, RegExp, and Error, but specifically excludes arrays and null values.
   * Useful for validating object-like data structures.
   *
   * @public
   * @static
   * @param {unknown} value - The value to check for object type
   * @returns {boolean} True if the value is an object (excluding arrays and null), false otherwise
   *
   * @example
   * ```typescript
   * TypeChecker.isObject({});                    // true (empty object)
   * TypeChecker.isObject({key: "value"});        // true (object literal)
   * TypeChecker.isObject(new Date());            // true (Date object)
   * TypeChecker.isObject(new RegExp("test"));    // true (RegExp object)
   * TypeChecker.isObject(new Error("message"));  // true (Error object)
   * TypeChecker.isObject([]);                    // false (array)
   * TypeChecker.isObject([1, 2, 3]);             // false (array)
   * TypeChecker.isObject(null);                  // false (null)
   * TypeChecker.isObject("string");              // false (primitive)
   * TypeChecker.isObject(42);                    // false (primitive)
   *
   * // Use in API data validation
   * function validateUserData(data: unknown): boolean {
   *   return TypeChecker.isObject(data) && !TypeChecker.isArray(data);
   * }
   * ```
   *
   * @since 1.0.0
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object | MDN Object Documentation}
   */
  static isObject(value: unknown): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
}
