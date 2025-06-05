import { flatValues, isNullOrUndefined } from "@/utils";

/**
 * Utility class for performing equality and inequality comparisons between values.
 * 
 * Provides static methods to compare primitive values and Date objects with proper
 * type handling and validation.
 * 
 * @example
 * ```typescript
 * // Basic equality
 * Equality.isEqual("hello", "hello"); // true
 * Equality.isEqual(42, 42); // true
 * 
 * // Date comparison
 * const date1 = new Date('2025-01-01');
 * const date2 = new Date('2025-01-01');
 * Equality.isEqual(date1, date2); // true
 * 
 * // Inequality
 * Equality.isNotEqual("foo", "bar"); // true
 * ```
 */
export class Equality {
    /**
     * Compares two values for equality.
     * 
     * Handles special cases like Date objects by comparing their timestamps.
     * For all other types, performs strict equality comparison (===).
     * 
     * @param valueA - The first value to compare
     * @param valueB - The second value to compare
     * @returns `true` if the values are equal, `false` otherwise
     * @throws {Error} When either value is null or undefined
     * 
     * @example
     * ```typescript
     * Equality.isEqual(123, 123); // true
     * Equality.isEqual("test", "test"); // true
     * Equality.isEqual(new Date('2025-01-01'), new Date('2025-01-01')); // true
     * Equality.isEqual(123, "123"); // false
     * ```
     */
    static isEqual(valueA: flatValues, valueB: flatValues): boolean {
        if(isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) throw new Error('Both values must be provided for comparison.');

        if (valueA instanceof Date && valueB instanceof Date) {
            return valueA.getTime() === valueB.getTime();
        }

        return valueA === valueB;
    }

    /**
     * Compares two values for inequality.
     * 
     * Handles special cases like Date objects by comparing their timestamps.
     * For all other types, performs strict inequality comparison (!==).
     * 
     * @param valueA - The first value to compare
     * @param valueB - The second value to compare
     * @returns `true` if the values are not equal, `false` otherwise
     * @throws {Error} When either value is null or undefined
     * 
     * @example
     * ```typescript
     * Equality.isNotEqual(123, 456); // true
     * Equality.isNotEqual("foo", "bar"); // true
     * Equality.isNotEqual(new Date('2025-01-01'), new Date('2025-01-02')); // true
     * Equality.isNotEqual("test", "test"); // false
     * ```
     */
    static isNotEqual(valueA: flatValues, valueB: flatValues): boolean {
        if(isNullOrUndefined(valueA) || isNullOrUndefined(valueB)) throw new Error('Both values must be provided for comparison.');

        if (valueA instanceof Date && valueB instanceof Date) {
            return valueA.getTime() !== valueB.getTime();
        }

        return valueA !== valueB;
    }
}