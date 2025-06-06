import { describe, test, expect } from 'vitest';
import { isNullOrUndefined, isNumber } from '../../src/utils/utility-guards';

describe('utility-guards', () => {
    describe('isNullOrUndefined', () => {
        test('should return true for null values', () => {
            expect(isNullOrUndefined(null as any)).toBe(true);
        });

        test('should return true for undefined values', () => {
            expect(isNullOrUndefined(undefined as any)).toBe(true);
        });

        test('should return false for empty string', () => {
            expect(isNullOrUndefined('')).toBe(false);
        });

        test('should return false for zero number', () => {
            expect(isNullOrUndefined(0)).toBe(false);
        });

        test('should return false for false boolean', () => {
            expect(isNullOrUndefined(false)).toBe(false);
        });

        test('should return false for valid string values', () => {
            expect(isNullOrUndefined('hello')).toBe(false);
            expect(isNullOrUndefined('world')).toBe(false);
            expect(isNullOrUndefined(' ')).toBe(false); // whitespace
        });

        test('should return false for valid number values', () => {
            expect(isNullOrUndefined(42)).toBe(false);
            expect(isNullOrUndefined(-1)).toBe(false);
            expect(isNullOrUndefined(3.14)).toBe(false);
            expect(isNullOrUndefined(Infinity)).toBe(false);
            expect(isNullOrUndefined(-Infinity)).toBe(false);
        });

        test('should return false for valid boolean values', () => {
            expect(isNullOrUndefined(true)).toBe(false);
            expect(isNullOrUndefined(false)).toBe(false);
        });

        test('should return false for valid Date objects', () => {
            expect(isNullOrUndefined(new Date())).toBe(false);
            expect(isNullOrUndefined(new Date('2025-01-01'))).toBe(false);
            expect(isNullOrUndefined(new Date(0))).toBe(false); // Unix epoch
        });

        test('should handle edge cases with special number values', () => {
            expect(isNullOrUndefined(NaN)).toBe(false); // NaN is not null/undefined
        });
    });

    describe('isNumber', () => {
        test('should return true for valid integer numbers', () => {
            expect(isNumber(42)).toBe(true);
            expect(isNumber(0)).toBe(true);
            expect(isNumber(-1)).toBe(true);
            expect(isNumber(1000)).toBe(true);
        });

        test('should return true for valid decimal numbers', () => {
            expect(isNumber(3.14)).toBe(true);
            expect(isNumber(-2.5)).toBe(true);
            expect(isNumber(0.1)).toBe(true);
            expect(isNumber(999.999)).toBe(true);
        });

        test('should return true for infinity values', () => {
            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(-Infinity)).toBe(true);
        });

        test('should return false for NaN', () => {
            expect(isNumber(NaN)).toBe(false);
        });

        test('should return false for string values', () => {
            expect(isNumber('123')).toBe(false);
            expect(isNumber('42.5')).toBe(false);
            expect(isNumber('hello')).toBe(false);
            expect(isNumber('')).toBe(false);
            expect(isNumber('Infinity')).toBe(false);
            expect(isNumber('NaN')).toBe(false);
        });

        test('should return false for boolean values', () => {
            expect(isNumber(true)).toBe(false);
            expect(isNumber(false)).toBe(false);
        });

        test('should return false for null and undefined', () => {
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
        });

        test('should return false for objects and arrays', () => {
            expect(isNumber({})).toBe(false);
            expect(isNumber([])).toBe(false);
            expect(isNumber([1, 2, 3])).toBe(false);
            expect(isNumber({ value: 42 })).toBe(false);
            expect(isNumber(new Date())).toBe(false);
        });

        test('should return false for functions', () => {
            expect(isNumber(function() {})).toBe(false);
            expect(isNumber(() => {})).toBe(false);
        });

        test('should handle edge cases correctly', () => {
            expect(isNumber(Number.MAX_VALUE)).toBe(true);
            expect(isNumber(Number.MIN_VALUE)).toBe(true);
            expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
        });

        test('should handle numeric operations results', () => {
            expect(isNumber(5 + 3)).toBe(true);
            expect(isNumber(10 / 2)).toBe(true);
            expect(isNumber(Math.PI)).toBe(true);
            expect(isNumber(Math.sqrt(16))).toBe(true);
            expect(isNumber(parseInt('42'))).toBe(true);
            expect(isNumber(parseFloat('3.14'))).toBe(true);
        });

        test('should return false for invalid parsing results', () => {
            expect(isNumber(parseInt('hello'))).toBe(false); // NaN
            expect(isNumber(parseFloat('invalid'))).toBe(false); // NaN
        });
    });

    describe('integration tests', () => {
        test('should work correctly when used together', () => {
            const testValues = [
                null,
                undefined,
                42,
                'hello',
                true,
                [],
                {},
                NaN,
                Infinity
            ];

            testValues.forEach(value => {
                const isNullUndef = isNullOrUndefined(value as any);
                const isNum = isNumber(value);
                
                // null and undefined should only be caught by isNullOrUndefined
                if (value === null || value === undefined) {
                    expect(isNullUndef).toBe(true);
                    expect(isNum).toBe(false);
                }
            });
        });

        test('should handle mixed type arrays correctly', () => {
            const mixedArray = [42, 'string', null, undefined, true, NaN, Infinity];
            
            expect(isNumber(mixedArray[0])).toBe(true); // 42
            expect(isNumber(mixedArray[1])).toBe(false); // 'string'
            expect(isNullOrUndefined(mixedArray[2] as any)).toBe(true); // null
            expect(isNullOrUndefined(mixedArray[3] as any)).toBe(true); // undefined
            expect(isNumber(mixedArray[4])).toBe(false); // true
            expect(isNumber(mixedArray[5])).toBe(false); // NaN
            expect(isNumber(mixedArray[6])).toBe(true); // Infinity
        });
    });
});
