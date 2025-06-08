/**
 * Union type representing flat primitive values supported by Validra.
 *
 * This type includes the basic data types that can be used in validation
 * operations and comparisons throughout the Validra library.
 *
 * @example
 * ```typescript
 * // Valid flatValues
 * const text: flatValues = "hello";
 * const count: flatValues = 42;
 * const isActive: flatValues = true;
 * const createdAt: flatValues = new Date();
 * ```
 */
export type flatValues = string | number | boolean | Date;
