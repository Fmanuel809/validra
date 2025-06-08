// Type guard utility functions for validating and checking values in Validra.
// Author: Felix M. Martinez
//
// This module provides utility functions to perform runtime type checking
// and validation of values, particularly for null and undefined checks.
//
// Example usage:
//   isNullOrUndefined(null);
//   isNumber(42);
//
// Version: 1.0.0
//

import { flatValues } from './utility.types';

/**
 * Type guard utility functions for validating and checking values.
 *
 * This module provides utility functions to perform runtime type checking
 * and validation of values, particularly for null and undefined checks.
 */

/**
 * Checks if a value is null or undefined.
 *
 * This utility function performs a strict check for null or undefined values,
 * which is useful for validation and error handling throughout the application.
 *
 * @param value - The value to check for null or undefined
 * @returns `true` if the value is null or undefined, `false` otherwise
 *
 * @example
 * ```typescript
 * // Returns true for null/undefined
 * isNullOrUndefined(null);      // true
 * isNullOrUndefined(undefined); // true
 *
 * // Returns false for valid values
 * isNullOrUndefined("");        // false
 * isNullOrUndefined(0);         // false
 * isNullOrUndefined(false);     // false
 * isNullOrUndefined(new Date()); // false
 * ```
 *
 * @public
 */
export function isNullOrUndefined(value: flatValues): boolean {
  return value === null || value === undefined;
}

/**
 * Checks if a value is a valid number.
 *
 * Performs a strict type check for numbers and excludes `NaN` values.
 * This method returns `true` for all finite numbers, `Infinity`, and
 * `-Infinity`, but `false` for `NaN`.
 *
 * @param value - The value to check for being a valid number
 * @returns `true` if the value is a valid number (excluding NaN), `false` otherwise
 *
 * @example
 * ```typescript
 * // Returns true for valid numbers
 * isNumber(42);         // true
 * isNumber(3.14);       // true
 * isNumber(0);          // true
 * isNumber(-5);         // true
 * isNumber(Infinity);   // true
 * isNumber(-Infinity);  // true
 *
 * // Returns false for invalid values
 * isNumber(NaN);        // false
 * isNumber("123");      // false
 * isNumber(true);       // false
 * isNumber(null);       // false
 * isNumber(undefined);  // false
 * ```
 *
 * @public
 */
export function isNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}
