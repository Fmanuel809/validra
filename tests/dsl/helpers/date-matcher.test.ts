/**
 * @fileoverview Comprehensive unit tests for DateMatcher utility class
 * Tests verify UTC-based date operations to ensure timezone consistency
 * @module DateMatcherTests
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateMatcher } from '../../../src/dsl/helpers/date-matcher';

describe('DateMatcher', () => {
    let fixedDate: Date;
    let mockNow: Date;

    beforeEach(() => {
        // Fix the current date for consistent testing (UTC)
        mockNow = new Date('2025-06-05T12:00:00.000Z'); // Thursday, June 5, 2025 UTC
        vi.setSystemTime(mockNow);
        
        fixedDate = new Date('2025-01-15T10:30:00.000Z'); // Wednesday, January 15, 2025 UTC
    });

    describe('isAfter', () => {
        it('should return true when date is after reference date', () => {
            const date = new Date('2025-06-10');
            const reference = new Date('2025-06-05');
            
            expect(DateMatcher.isAfter(date, reference)).toBe(true);
        });

        it('should return false when date is before reference date', () => {
            const date = new Date('2025-06-01');
            const reference = new Date('2025-06-05');
            
            expect(DateMatcher.isAfter(date, reference)).toBe(false);
        });

        it('should return false when dates are equal', () => {
            const date = new Date('2025-06-05T12:30:00');
            const reference = new Date('2025-06-05T12:30:00');
            
            expect(DateMatcher.isAfter(date, reference)).toBe(false);
        });

        it('should compare dates accurately with different times on same day', () => {
            const laterDate = new Date('2025-06-05T15:00:00');
            const earlierDate = new Date('2025-06-05T10:00:00');
            
            expect(DateMatcher.isAfter(laterDate, earlierDate)).toBe(true);
            expect(DateMatcher.isAfter(earlierDate, laterDate)).toBe(false);
        });

        it('should handle dates across different years', () => {
            const date2025 = new Date('2025-01-01');
            const date2024 = new Date('2024-12-31');
            
            expect(DateMatcher.isAfter(date2025, date2024)).toBe(true);
            expect(DateMatcher.isAfter(date2024, date2025)).toBe(false);
        });

        it('should throw error when first parameter is not a Date', () => {
            const reference = new Date('2025-06-05');
            
            expect(() => DateMatcher.isAfter('not-a-date' as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isAfter(null as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isAfter(undefined as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isAfter(123 as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
        });

        it('should throw error when second parameter is not a Date', () => {
            const date = new Date('2025-06-05');
            
            expect(() => DateMatcher.isAfter(date, 'not-a-date' as any))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isAfter(date, null as any))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isAfter(date, undefined as any))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isAfter(date, 123 as any))
                .toThrow('Both date and reference must be valid Date instances.');
        });

        it('should throw error when both parameters are invalid', () => {
            expect(() => DateMatcher.isAfter('invalid' as any, 'also-invalid' as any))
                .toThrow('Both date and reference must be valid Date instances.');
        });
    });

    describe('isBefore', () => {
        it('should return true when date is before reference date', () => {
            const date = new Date('2025-06-01');
            const reference = new Date('2025-06-05');
            
            expect(DateMatcher.isBefore(date, reference)).toBe(true);
        });

        it('should return false when date is after reference date', () => {
            const date = new Date('2025-06-10');
            const reference = new Date('2025-06-05');
            
            expect(DateMatcher.isBefore(date, reference)).toBe(false);
        });

        it('should return false when dates are equal', () => {
            const date = new Date('2025-06-05T12:30:00');
            const reference = new Date('2025-06-05T12:30:00');
            
            expect(DateMatcher.isBefore(date, reference)).toBe(false);
        });

        it('should compare dates accurately with different times on same day', () => {
            const earlierDate = new Date('2025-06-05T10:00:00');
            const laterDate = new Date('2025-06-05T15:00:00');
            
            expect(DateMatcher.isBefore(earlierDate, laterDate)).toBe(true);
            expect(DateMatcher.isBefore(laterDate, earlierDate)).toBe(false);
        });

        it('should handle dates across different years', () => {
            const date2024 = new Date('2024-12-31');
            const date2025 = new Date('2025-01-01');
            
            expect(DateMatcher.isBefore(date2024, date2025)).toBe(true);
            expect(DateMatcher.isBefore(date2025, date2024)).toBe(false);
        });

        it('should throw error when first parameter is not a Date', () => {
            const reference = new Date('2025-06-05');
            
            expect(() => DateMatcher.isBefore('not-a-date' as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isBefore(null as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isBefore(undefined as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isBefore(123 as any, reference))
                .toThrow('Both date and reference must be valid Date instances.');
        });

        it('should throw error when second parameter is not a Date', () => {
            const date = new Date('2025-06-05');
            
            expect(() => DateMatcher.isBefore(date, 'not-a-date' as any))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isBefore(date, null as any))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isBefore(date, undefined as any))
                .toThrow('Both date and reference must be valid Date instances.');
            expect(() => DateMatcher.isBefore(date, 123 as any))
                .toThrow('Both date and reference must be valid Date instances.');
        });
    });

    describe('isToday', () => {
        it('should return true for current date in UTC', () => {
            const today = new Date(); // This will be the mocked date (2025-06-05 UTC)
            
            expect(DateMatcher.isToday(today)).toBe(true);
        });

        it('should return true for today with different time in UTC', () => {
            const todayMorning = new Date('2025-06-05T06:00:00.000Z');
            const todayEvening = new Date('2025-06-05T22:30:00.000Z');
            
            expect(DateMatcher.isToday(todayMorning)).toBe(true);
            expect(DateMatcher.isToday(todayEvening)).toBe(true);
        });

        it('should return false for yesterday in UTC', () => {
            const yesterday = new Date('2025-06-04T12:00:00.000Z');
            
            expect(DateMatcher.isToday(yesterday)).toBe(false);
        });

        it('should return false for tomorrow in UTC', () => {
            const tomorrow = new Date('2025-06-06T12:00:00.000Z');
            
            expect(DateMatcher.isToday(tomorrow)).toBe(false);
        });

        it('should return false for different month in UTC', () => {
            const differentMonth = new Date('2025-05-05T12:00:00.000Z');
            
            expect(DateMatcher.isToday(differentMonth)).toBe(false);
        });

        it('should return false for different year in UTC', () => {
            const differentYear = new Date('2024-06-05T12:00:00.000Z');
            
            expect(DateMatcher.isToday(differentYear)).toBe(false);
        });

        it('should ignore time component and use UTC date', () => {
            const todayMidnight = new Date('2025-06-05T00:00:00.000Z');
            const todayNoon = new Date('2025-06-05T12:00:00.000Z');
            const todayEndOfDay = new Date('2025-06-05T23:59:59.999Z');
            
            expect(DateMatcher.isToday(todayMidnight)).toBe(true);
            expect(DateMatcher.isToday(todayNoon)).toBe(true);
            expect(DateMatcher.isToday(todayEndOfDay)).toBe(true);
        });

        it('should handle timezone edge cases correctly with UTC', () => {
            // Test dates that could be "today" in some timezone but not in UTC
            const lateYesterday = new Date('2025-06-04T23:30:00.000Z');
            const earlyTomorrow = new Date('2025-06-06T00:30:00.000Z');
            
            expect(DateMatcher.isToday(lateYesterday)).toBe(false);
            expect(DateMatcher.isToday(earlyTomorrow)).toBe(false);
        });

        it('should throw error when parameter is not a Date', () => {
            expect(() => DateMatcher.isToday('not-a-date' as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isToday(null as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isToday(undefined as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isToday(123 as any))
                .toThrow('The provided value must be a valid Date instance.');
        });
    });

    describe('isWeekend', () => {
        it('should return true for Saturday in UTC', () => {
            const saturday = new Date('2025-06-07T12:00:00.000Z'); // Saturday
            
            expect(DateMatcher.isWeekend(saturday)).toBe(true);
        });

        it('should return true for Sunday in UTC', () => {
            const sunday = new Date('2025-06-01T12:00:00.000Z'); // Sunday
            
            expect(DateMatcher.isWeekend(sunday)).toBe(true);
        });

        it('should return false for Monday in UTC', () => {
            const monday = new Date('2025-06-02T12:00:00.000Z'); // Monday
            
            expect(DateMatcher.isWeekend(monday)).toBe(false);
        });

        it('should return false for Tuesday in UTC', () => {
            const tuesday = new Date('2025-06-03T12:00:00.000Z'); // Tuesday
            
            expect(DateMatcher.isWeekend(tuesday)).toBe(false);
        });

        it('should return false for Wednesday in UTC', () => {
            const wednesday = new Date('2025-06-04T12:00:00.000Z'); // Wednesday
            
            expect(DateMatcher.isWeekend(wednesday)).toBe(false);
        });

        it('should return false for Thursday in UTC', () => {
            const thursday = new Date('2025-06-05T12:00:00.000Z'); // Thursday (today)
            
            expect(DateMatcher.isWeekend(thursday)).toBe(false);
        });

        it('should return false for Friday in UTC', () => {
            const friday = new Date('2025-06-06T12:00:00.000Z'); // Friday
            
            expect(DateMatcher.isWeekend(friday)).toBe(false);
        });

        it('should work regardless of time and use UTC day', () => {
            const saturdayMorning = new Date('2025-06-07T08:00:00.000Z');
            const saturdayEvening = new Date('2025-06-07T20:00:00.000Z');
            const sundayMidnight = new Date('2025-06-01T00:00:00.000Z');
            
            expect(DateMatcher.isWeekend(saturdayMorning)).toBe(true);
            expect(DateMatcher.isWeekend(saturdayEvening)).toBe(true);
            expect(DateMatcher.isWeekend(sundayMidnight)).toBe(true);
        });

        it('should handle timezone edge cases with UTC', () => {
            // Test dates that might be different weekdays in different timezones
            const sundayVeryLate = new Date('2025-06-01T23:59:59.000Z'); // Still Sunday in UTC
            const mondayVeryEarly = new Date('2025-06-02T00:00:01.000Z'); // Already Monday in UTC
            
            expect(DateMatcher.isWeekend(sundayVeryLate)).toBe(true);
            expect(DateMatcher.isWeekend(mondayVeryEarly)).toBe(false);
        });

        it('should throw error when parameter is not a Date', () => {
            expect(() => DateMatcher.isWeekend('not-a-date' as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isWeekend(null as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isWeekend(undefined as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isWeekend(123 as any))
                .toThrow('The provided value must be a valid Date instance.');
        });
    });

    describe('isWeekday', () => {
        it('should return true for Monday in UTC', () => {
            const monday = new Date('2025-06-02T12:00:00.000Z'); // Monday
            
            expect(DateMatcher.isWeekday(monday)).toBe(true);
        });

        it('should return true for Tuesday in UTC', () => {
            const tuesday = new Date('2025-06-03T12:00:00.000Z'); // Tuesday
            
            expect(DateMatcher.isWeekday(tuesday)).toBe(true);
        });

        it('should return true for Wednesday in UTC', () => {
            const wednesday = new Date('2025-06-04T12:00:00.000Z'); // Wednesday
            
            expect(DateMatcher.isWeekday(wednesday)).toBe(true);
        });

        it('should return true for Thursday in UTC', () => {
            const thursday = new Date('2025-06-05T12:00:00.000Z'); // Thursday (today)
            
            expect(DateMatcher.isWeekday(thursday)).toBe(true);
        });

        it('should return true for Friday in UTC', () => {
            const friday = new Date('2025-06-06T12:00:00.000Z'); // Friday
            
            expect(DateMatcher.isWeekday(friday)).toBe(true);
        });

        it('should return false for Saturday in UTC', () => {
            const saturday = new Date('2025-06-07T12:00:00.000Z'); // Saturday
            
            expect(DateMatcher.isWeekday(saturday)).toBe(false);
        });

        it('should return false for Sunday in UTC', () => {
            const sunday = new Date('2025-06-01T12:00:00.000Z'); // Sunday
            
            expect(DateMatcher.isWeekday(sunday)).toBe(false);
        });

        it('should work regardless of time and use UTC day', () => {
            const mondayMorning = new Date('2025-06-02T08:00:00.000Z');
            const fridayEvening = new Date('2025-06-06T18:00:00.000Z');
            const wednesdayMidnight = new Date('2025-06-04T00:00:00.000Z');
            
            expect(DateMatcher.isWeekday(mondayMorning)).toBe(true);
            expect(DateMatcher.isWeekday(fridayEvening)).toBe(true);
            expect(DateMatcher.isWeekday(wednesdayMidnight)).toBe(true);
        });

        it('should handle timezone edge cases with UTC', () => {
            // Test dates that might be different weekdays in different timezones
            const fridayVeryLate = new Date('2025-06-06T23:59:59.000Z'); // Still Friday in UTC
            const saturdayVeryEarly = new Date('2025-06-07T00:00:01.000Z'); // Already Saturday in UTC
            
            expect(DateMatcher.isWeekday(fridayVeryLate)).toBe(true);
            expect(DateMatcher.isWeekday(saturdayVeryEarly)).toBe(false);
        });

        it('should throw error when parameter is not a Date', () => {
            expect(() => DateMatcher.isWeekday('not-a-date' as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isWeekday(null as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isWeekday(undefined as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isWeekday(123 as any))
                .toThrow('The provided value must be a valid Date instance.');
        });
    });

    describe('isLeapYear', () => {
        it('should return true for years divisible by 4 (basic leap years) using UTC', () => {
            expect(DateMatcher.isLeapYear(new Date('2024-01-01T12:00:00.000Z'))).toBe(true); // 2024 is divisible by 4
            expect(DateMatcher.isLeapYear(new Date('2020-06-15T12:00:00.000Z'))).toBe(true); // 2020 is divisible by 4
            expect(DateMatcher.isLeapYear(new Date('2016-12-31T12:00:00.000Z'))).toBe(true); // 2016 is divisible by 4
        });

        it('should return false for years not divisible by 4 using UTC', () => {
            expect(DateMatcher.isLeapYear(new Date('2023-01-01T12:00:00.000Z'))).toBe(false); // 2023 is not divisible by 4
            expect(DateMatcher.isLeapYear(new Date('2021-01-01T12:00:00.000Z'))).toBe(false); // 2021 is not divisible by 4
            expect(DateMatcher.isLeapYear(new Date('2019-01-01T12:00:00.000Z'))).toBe(false); // 2019 is not divisible by 4
        });

        it('should return false for century years not divisible by 400 using UTC', () => {
            expect(DateMatcher.isLeapYear(new Date('1700-01-01T12:00:00.000Z'))).toBe(false); // 1700 is divisible by 100 but not 400
            expect(DateMatcher.isLeapYear(new Date('1800-01-01T12:00:00.000Z'))).toBe(false); // 1800 is divisible by 100 but not 400
            expect(DateMatcher.isLeapYear(new Date('1900-01-01T12:00:00.000Z'))).toBe(false); // 1900 is divisible by 100 but not 400
        });

        it('should return true for century years divisible by 400 using UTC', () => {
            expect(DateMatcher.isLeapYear(new Date('2000-01-01T12:00:00.000Z'))).toBe(true); // 2000 is divisible by 400
            expect(DateMatcher.isLeapYear(new Date('1600-01-01T12:00:00.000Z'))).toBe(true); // 1600 is divisible by 400
            expect(DateMatcher.isLeapYear(new Date('2400-01-01T12:00:00.000Z'))).toBe(true); // 2400 is divisible by 400
        });

        it('should work regardless of month and day using UTC', () => {
            expect(DateMatcher.isLeapYear(new Date('2024-02-29T12:00:00.000Z'))).toBe(true); // Leap day itself
            expect(DateMatcher.isLeapYear(new Date('2024-07-15T12:00:00.000Z'))).toBe(true); // Mid-year
            expect(DateMatcher.isLeapYear(new Date('2024-12-31T12:00:00.000Z'))).toBe(true); // End of year
        });

        it('should work regardless of time using UTC year', () => {
            expect(DateMatcher.isLeapYear(new Date('2024-01-01T00:00:00.000Z'))).toBe(true);
            expect(DateMatcher.isLeapYear(new Date('2024-01-01T12:30:45.000Z'))).toBe(true);
            expect(DateMatcher.isLeapYear(new Date('2024-01-01T23:59:59.000Z'))).toBe(true);
        });

        it('should handle edge cases around century boundaries using UTC', () => {
            expect(DateMatcher.isLeapYear(new Date('1896-01-01T12:00:00.000Z'))).toBe(true); // 1896 is divisible by 4
            expect(DateMatcher.isLeapYear(new Date('1900-01-01T12:00:00.000Z'))).toBe(false); // 1900 is not a leap year
            expect(DateMatcher.isLeapYear(new Date('1904-01-01T12:00:00.000Z'))).toBe(true); // 1904 is divisible by 4
            expect(DateMatcher.isLeapYear(new Date('1996-01-01T12:00:00.000Z'))).toBe(true); // 1996 is divisible by 4
            expect(DateMatcher.isLeapYear(new Date('2000-01-01T12:00:00.000Z'))).toBe(true); // 2000 is a leap year
            expect(DateMatcher.isLeapYear(new Date('2004-01-01T12:00:00.000Z'))).toBe(true); // 2004 is divisible by 4
        });

        it('should handle timezone edge cases correctly with UTC year', () => {
            // Test dates near year boundaries that could be different years in different timezones
            const lateDecember2023 = new Date('2023-12-31T23:59:59.000Z'); // Still 2023 in UTC
            const earlyJanuary2024 = new Date('2024-01-01T00:00:01.000Z'); // Already 2024 in UTC
            
            expect(DateMatcher.isLeapYear(lateDecember2023)).toBe(false); // 2023 is not a leap year
            expect(DateMatcher.isLeapYear(earlyJanuary2024)).toBe(true); // 2024 is a leap year
        });

        it('should throw error when parameter is not a Date', () => {
            expect(() => DateMatcher.isLeapYear('not-a-date' as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isLeapYear(null as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isLeapYear(undefined as any))
                .toThrow('The provided value must be a valid Date instance.');
            expect(() => DateMatcher.isLeapYear(123 as any))
                .toThrow('The provided value must be a valid Date instance.');
        });
    });

    // Integration tests combining multiple methods with UTC consistency
    describe('Integration tests', () => {
        it('should correctly identify weekend and weekday relationships using UTC', () => {
            const saturday = new Date('2025-06-07T12:00:00.000Z');
            const sunday = new Date('2025-06-01T12:00:00.000Z');
            const monday = new Date('2025-06-02T12:00:00.000Z');
            const friday = new Date('2025-06-06T12:00:00.000Z');
            
            // Weekend tests
            expect(DateMatcher.isWeekend(saturday)).toBe(true);
            expect(DateMatcher.isWeekday(saturday)).toBe(false);
            expect(DateMatcher.isWeekend(sunday)).toBe(true);
            expect(DateMatcher.isWeekday(sunday)).toBe(false);
            
            // Weekday tests
            expect(DateMatcher.isWeekday(monday)).toBe(true);
            expect(DateMatcher.isWeekend(monday)).toBe(false);
            expect(DateMatcher.isWeekday(friday)).toBe(true);
            expect(DateMatcher.isWeekend(friday)).toBe(false);
        });

        it('should handle date comparisons with today checks using UTC', () => {
            const yesterday = new Date('2025-06-04T12:00:00.000Z');
            const today = new Date('2025-06-05T12:00:00.000Z');
            const tomorrow = new Date('2025-06-06T12:00:00.000Z');
            
            expect(DateMatcher.isToday(today)).toBe(true);
            expect(DateMatcher.isToday(yesterday)).toBe(false);
            expect(DateMatcher.isToday(tomorrow)).toBe(false);
            
            expect(DateMatcher.isBefore(yesterday, today)).toBe(true);
            expect(DateMatcher.isAfter(tomorrow, today)).toBe(true);
        });

        it('should handle leap year edge cases with date comparisons using UTC', () => {
            const feb28_2024 = new Date('2024-02-28T12:00:00.000Z'); // Leap year
            const feb29_2024 = new Date('2024-02-29T12:00:00.000Z'); // Leap day
            const mar01_2024 = new Date('2024-03-01T12:00:00.000Z');
            
            const feb28_2023 = new Date('2023-02-28T12:00:00.000Z'); // Non-leap year
            const mar01_2023 = new Date('2023-03-01T12:00:00.000Z');
            
            // Verify leap year detection
            expect(DateMatcher.isLeapYear(feb29_2024)).toBe(true);
            expect(DateMatcher.isLeapYear(feb28_2023)).toBe(false);
            
            // Verify date ordering around leap day
            expect(DateMatcher.isBefore(feb28_2024, feb29_2024)).toBe(true);
            expect(DateMatcher.isBefore(feb29_2024, mar01_2024)).toBe(true);
            expect(DateMatcher.isAfter(mar01_2023, feb28_2023)).toBe(true);
        });

        it('should handle timezone edge cases consistently across all methods', () => {
            // Test dates that could be problematic with timezone issues
            const lateDecember = new Date('2024-12-31T23:30:00.000Z'); // Very late in UTC
            const earlyJanuary = new Date('2025-01-01T00:30:00.000Z'); // Very early in UTC
            
            // Should be consistent in all UTC-based checks
            expect(DateMatcher.isLeapYear(lateDecember)).toBe(true); // 2024 is leap year
            expect(DateMatcher.isLeapYear(earlyJanuary)).toBe(false); // 2025 is not leap year
            
            // Weekend/weekday checks should be consistent
            const saturdayLate = new Date('2025-06-07T23:59:59.000Z');
            const sundayEarly = new Date('2025-06-08T00:00:01.000Z');
            
            expect(DateMatcher.isWeekend(saturdayLate)).toBe(true);
            expect(DateMatcher.isWeekend(sundayEarly)).toBe(true);
            expect(DateMatcher.isWeekday(saturdayLate)).toBe(false);
            expect(DateMatcher.isWeekday(sundayEarly)).toBe(false);
        });
    });
});
