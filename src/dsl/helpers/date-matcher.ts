/**
 * @fileoverview Provides comprehensive date comparison and validation utilities
 * @module DateMatcher
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { TypeChecker } from "./type-checker";

/**
 * Utility class providing static methods for date comparison and validation operations.
 * All date operations use UTC to avoid timezone-related issues and ensure consistent
 * results across different environments and timezones.
 * 
 * @public
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Date comparisons (uses millisecond timestamps, inherently UTC)
 * DateMatcher.isAfter(new Date('2025-01-01'), new Date('2024-12-31')); // true
 * DateMatcher.isToday(new Date()); // true
 * 
 * // Date properties (uses UTC methods)
 * DateMatcher.isWeekend(new Date('2025-01-05')); // true (Sunday in UTC)
 * DateMatcher.isLeapYear(new Date('2024-01-01')); // true
 * ```
 */
export class DateMatcher {
    /**
     * Checks if a date is after another reference date.
     * Uses millisecond timestamps for comparison, which are timezone-independent.
     * 
     * @public
     * @static
     * @param {Date} date - The date to check
     * @param {Date} reference - The reference date to compare against
     * @returns {boolean} True if date is after the reference date, false otherwise
     * @throws {Error} Throws if either date or reference is not a valid Date instance
     * 
     * @example
     * ```typescript
     * const date = new Date('2025-01-01');
     * const reference = new Date('2024-12-31');
     * DateMatcher.isAfter(date, reference); // true
     * 
     * const earlier = new Date('2024-01-01');
     * DateMatcher.isAfter(earlier, reference); // false
     * ```
     * 
     * @since 1.0.0
     */
    static isAfter(date: Date, reference: Date): boolean {
        if(!TypeChecker.isDate(date) || !TypeChecker.isDate(reference)) {
            throw 'Both date and reference must be valid Date instances.';
        }

        return date.getTime() > reference.getTime();
    }

    /**
     * Checks if a date is before another reference date.
     * Uses millisecond timestamps for comparison, which are timezone-independent.
     * 
     * @public
     * @static
     * @param {Date} date - The date to check
     * @param {Date} reference - The reference date to compare against
     * @returns {boolean} True if date is before the reference date, false otherwise
     * @throws {Error} Throws if either date or reference is not a valid Date instance
     * 
     * @example
     * ```typescript
     * const date = new Date('2024-01-01');
     * const reference = new Date('2024-12-31');
     * DateMatcher.isBefore(date, reference); // true
     * 
     * const later = new Date('2025-01-01');
     * DateMatcher.isBefore(later, reference); // false
     * ```
     * 
     * @since 1.0.0
     */
    static isBefore(date: Date, reference: Date): boolean {
        if(!TypeChecker.isDate(date) || !TypeChecker.isDate(reference)) {
            throw 'Both date and reference must be valid Date instances.';
        }

        return date.getTime() < reference.getTime();
    }

    /**
     * Checks if a date represents today's date.
     * Compares only the date portion (year, month, day) in UTC, ignoring time and timezone.
     * 
     * @public
     * @static
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is today in UTC, false otherwise
     * @throws {Error} Throws if date is not a valid Date instance
     * 
     * @example
     * ```typescript
     * DateMatcher.isToday(new Date()); // true
     * DateMatcher.isToday(new Date('2024-01-01')); // false (unless today is 2024-01-01)
     * 
     * // Time and timezone are ignored, comparison is done in UTC
     * const todayMidnight = new Date();
     * todayMidnight.setUTCHours(0, 0, 0, 0);
     * DateMatcher.isToday(todayMidnight); // true
     * ```
     * 
     * @since 1.0.0
     */
    static isToday(date: Date): boolean {
        if(!TypeChecker.isDate(date)) {
            throw 'The provided value must be a valid Date instance.';
        }

        const today = new Date();
        return date.getUTCFullYear() === today.getUTCFullYear() &&
               date.getUTCMonth() === today.getUTCMonth() &&
               date.getUTCDate() === today.getUTCDate();
    }

    /**
     * Checks if a date falls on a weekend (Saturday or Sunday).
     * Uses UTC date to avoid timezone-related issues.
     * 
     * @public
     * @static
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is a Saturday or Sunday in UTC, false otherwise
     * @throws {Error} Throws if date is not a valid Date instance
     * 
     * @example
     * ```typescript
     * DateMatcher.isWeekend(new Date('2025-01-04')); // true (Saturday)
     * DateMatcher.isWeekend(new Date('2025-01-05')); // true (Sunday)
     * DateMatcher.isWeekend(new Date('2025-01-06')); // false (Monday)
     * ```
     * 
     * @since 1.0.0
     */
    static isWeekend(date: Date): boolean {
        if(!TypeChecker.isDate(date)) {
            throw 'The provided value must be a valid Date instance.';
        }

        const day = date.getUTCDay();
        return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
    }

    /**
     * Checks if a date falls on a weekday (Monday through Friday).
     * Uses UTC date to avoid timezone-related issues.
     * 
     * @public
     * @static
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is Monday through Friday in UTC, false otherwise
     * @throws {Error} Throws if date is not a valid Date instance
     * 
     * @example
     * ```typescript
     * DateMatcher.isWeekday(new Date('2025-01-06')); // true (Monday)
     * DateMatcher.isWeekday(new Date('2025-01-10')); // true (Friday)
     * DateMatcher.isWeekday(new Date('2025-01-11')); // false (Saturday)
     * DateMatcher.isWeekday(new Date('2025-01-12')); // false (Sunday)
     * ```
     * 
     * @since 1.0.0
     */
    static isWeekday(date: Date): boolean {
        if(!TypeChecker.isDate(date)) {
            throw 'The provided value must be a valid Date instance.';
        }

        const day = date.getUTCDay();
        return day >= 1 && day <= 5; // 1 = Monday, 5 = Friday
    }

    /**
     * Checks if the year of a given date is a leap year.
     * A leap year occurs every 4 years, except for years divisible by 100,
     * unless they are also divisible by 400. Uses UTC year to avoid timezone issues.
     * 
     * @public
     * @static
     * @param {Date} date - The date whose year to check
     * @returns {boolean} True if the year is a leap year, false otherwise
     * @throws {Error} Throws if date is not a valid Date instance
     * 
     * @example
     * ```typescript
     * DateMatcher.isLeapYear(new Date('2024-01-01')); // true (2024 is divisible by 4)
     * DateMatcher.isLeapYear(new Date('2023-01-01')); // false
     * DateMatcher.isLeapYear(new Date('2000-01-01')); // true (divisible by 400)
     * DateMatcher.isLeapYear(new Date('1900-01-01')); // false (divisible by 100 but not 400)
     * ```
     * 
     * @since 1.0.0
     */
    static isLeapYear(date: Date): boolean {
        if(!TypeChecker.isDate(date)) {
            throw 'The provided value must be a valid Date instance.';
        }

        const year = date.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
}