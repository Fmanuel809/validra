import { flatValues } from "./utility.types";

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
 */
export function isNullOrUndefined(value: flatValues): boolean {
  return value === null || value === undefined;
}
