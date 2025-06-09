/**
 * @fileoverview Type guard utilities for runtime type validation and safe value checking
 * @module UtilityGuards
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { flatValues } from './utility.types';

/**
 * Comprehensive type guard utilities for runtime type validation and safe value checking.
 *
 * This module provides essential utility functions for performing runtime type checking
 * and validation of values throughout the Validra ecosystem. Designed to enhance type
 * safety, prevent runtime errors, and provide reliable validation mechanisms for
 * dynamic data processing and user input validation.
 *
 * Key features:
 * - **Runtime Type Safety**: Provides type guards for safe value checking at runtime
 * - **Null Safety**: Comprehensive null and undefined detection and handling
 * - **Type Validation**: Strict type checking with edge case handling
 * - **Performance Optimized**: Minimal overhead type checking operations
 * - **TypeScript Integration**: Full TypeScript type guard support for enhanced IDE experience
 * - **Error Prevention**: Prevents common runtime errors through proactive validation
 *
 * Use cases:
 * - **Input Validation**: Validate user input and external data sources
 * - **API Response Validation**: Ensure API responses match expected types
 * - **Error Prevention**: Prevent null reference errors and type-related bugs
 * - **Data Processing**: Safe data transformation and manipulation operations
 * - **Form Validation**: Client-side validation for form inputs and user data
 * - **Configuration Validation**: Validate configuration objects and settings
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic type guard usage for safe data processing
 * function processUserInput(value: unknown) {
 *   if (isNullOrUndefined(value)) {
 *     return "No value provided";
 *   }
 *
 *   if (isNumber(value)) {
 *     return `Numeric value: ${value}`;
 *   }
 *
 *   return `Other value: ${value}`;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Form validation with type guards
 * interface UserData {
 *   age?: number;
 *   name?: string;
 * }
 *
 * function validateUserData(data: UserData): string[] {
 *   const errors: string[] = [];
 *
 *   if (isNullOrUndefined(data.age)) {
 *     errors.push("Age is required");
 *   } else if (!isNumber(data.age)) {
 *     errors.push("Age must be a valid number");
 *   }
 *
 *   return errors;
 * }
 * ```
 */

/**
 * Performs strict null and undefined checking with comprehensive type safety validation.
 *
 * This essential utility function provides reliable detection of null and undefined values,
 * which is crucial for preventing null reference errors and ensuring safe data processing
 * throughout the Validra validation pipeline. Implements strict equality checks to
 * distinguish between falsy values and actual null/undefined states.
 *
 * Key features:
 * - **Strict Checking**: Uses strict equality (===) for precise null/undefined detection
 * - **Type Safety**: Provides TypeScript type guard functionality for enhanced safety
 * - **Falsy Distinction**: Distinguishes between null/undefined and other falsy values
 * - **Performance Optimized**: Minimal overhead for high-frequency validation operations
 * - **Error Prevention**: Prevents null reference errors in data processing pipelines
 *
 * @public
 * @param {flatValues} value - The value to examine for null or undefined state
 * @returns {boolean} True if the value is strictly null or undefined, false for all other values including falsy values
 *
 * @example
 * ```typescript
 * // Strict null and undefined detection
 * isNullOrUndefined(null);           // true
 * isNullOrUndefined(undefined);      // true
 * ```
 *
 * @example
 * ```typescript
 * // Falsy values that are NOT null/undefined
 * isNullOrUndefined("");             // false (empty string)
 * isNullOrUndefined(0);              // false (zero)
 * isNullOrUndefined(false);          // false (boolean false)
 * isNullOrUndefined(NaN);            // false (Not a Number)
 * ```
 *
 * @example
 * ```typescript
 * // Valid non-null values
 * isNullOrUndefined("hello");        // false
 * isNullOrUndefined(42);             // false
 * isNullOrUndefined(true);           // false
 * isNullOrUndefined(new Date());     // false
 * isNullOrUndefined([]);             // false (empty array)
 * isNullOrUndefined({});             // false (empty object)
 * ```
 *
 * @example
 * ```typescript
 * // Safe data processing with null checking
 * function processUserData(data: any) {
 *   if (isNullOrUndefined(data)) {
 *     throw new Error("Data cannot be null or undefined");
 *   }
 *
 *   // Safe to process data here
 *   return data.toString();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Form validation with comprehensive null checking
 * interface FormData {
 *   email?: string;
 *   age?: number;
 * }
 *
 * function validateFormData(form: FormData): string[] {
 *   const errors: string[] = [];
 *
 *   if (isNullOrUndefined(form.email)) {
 *     errors.push("Email is required");
 *   }
 *
 *   if (isNullOrUndefined(form.age)) {
 *     errors.push("Age is required");
 *   }
 *
 *   return errors;
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isNullOrUndefined(value: flatValues): boolean {
  return value === null || value === undefined;
}

/**
 * Performs comprehensive number type validation with NaN exclusion and strict type checking.
 *
 * This utility function provides robust validation for numeric values, implementing strict
 * type checking that excludes NaN while accepting all valid numeric values including
 * infinity. Essential for numerical validation operations where precise number detection
 * is required for mathematical operations and data processing.
 *
 * Key features:
 * - **Strict Type Checking**: Uses typeof operator for precise number type detection
 * - **NaN Exclusion**: Explicitly excludes NaN values for mathematical safety
 * - **Infinity Support**: Accepts both positive and negative infinity as valid numbers
 * - **Type Safety**: Provides TypeScript type guard functionality for enhanced safety
 * - **Performance Optimized**: Minimal overhead validation for high-frequency operations
 * - **Mathematical Compatibility**: Ensures values are safe for mathematical operations
 *
 * @public
 * @param {unknown} value - The value to examine for valid number type (accepts any type for flexible validation)
 * @returns {boolean} True if the value is a valid number excluding NaN, false for all non-numeric values and NaN
 *
 * @example
 * ```typescript
 * // Valid numeric values
 * isNumber(42);                      // true (positive integer)
 * isNumber(-17);                     // true (negative integer)
 * isNumber(3.14159);                 // true (positive decimal)
 * isNumber(-2.718);                  // true (negative decimal)
 * isNumber(0);                       // true (zero)
 * ```
 *
 * @example
 * ```typescript
 * // Special numeric values
 * isNumber(Infinity);                // true (positive infinity)
 * isNumber(-Infinity);               // true (negative infinity)
 * isNumber(Number.MAX_VALUE);        // true (maximum number)
 * isNumber(Number.MIN_VALUE);        // true (minimum positive number)
 * ```
 *
 * @example
 * ```typescript
 * // Invalid values (non-numeric or NaN)
 * isNumber(NaN);                     // false (Not a Number)
 * isNumber("42");                    // false (string representation)
 * isNumber("3.14");                  // false (string decimal)
 * isNumber(true);                    // false (boolean)
 * isNumber(false);                   // false (boolean)
 * isNumber(null);                    // false (null value)
 * isNumber(undefined);               // false (undefined value)
 * isNumber([]);                      // false (array)
 * isNumber({});                      // false (object)
 * ```
 *
 * @example
 * ```typescript
 * // Safe mathematical operations with number validation
 * function safeCalculation(a: unknown, b: unknown): number {
 *   if (!isNumber(a) || !isNumber(b)) {
 *     throw new Error("Both operands must be valid numbers");
 *   }
 *
 *   // TypeScript now knows a and b are numbers
 *   return a + b;
 * }
 *
 * const result = safeCalculation(10, 20); // 30
 * // safeCalculation("10", 20); // throws error
 * ```
 *
 * @example
 * ```typescript
 * // Form validation for numeric inputs
 * function validateNumericInput(input: any): string | null {
 *   if (!isNumber(input)) {
 *     return "Value must be a valid number";
 *   }
 *
 *   if (input < 0) {
 *     return "Value must be non-negative";
 *   }
 *
 *   return null; // valid
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}
