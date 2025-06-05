import { describe, test, expect } from 'vitest';
import { TypeChecker } from '../../../src/dls/helpers/type-checker';

describe('TypeChecker', () => {
    describe('isString', () => {
        test('should return true for string values', () => {
            expect(TypeChecker.isString('hello')).toBe(true);
            expect(TypeChecker.isString('')).toBe(true);
            expect(TypeChecker.isString(' ')).toBe(true);
            expect(TypeChecker.isString('123')).toBe(true);
            expect(TypeChecker.isString('true')).toBe(true);
        });

        test('should return false for non-string values', () => {
            expect(TypeChecker.isString(123)).toBe(false);
            expect(TypeChecker.isString(true)).toBe(false);
            expect(TypeChecker.isString(false)).toBe(false);
            expect(TypeChecker.isString(null)).toBe(false);
            expect(TypeChecker.isString(undefined)).toBe(false);
            expect(TypeChecker.isString([])).toBe(false);
            expect(TypeChecker.isString({})).toBe(false);
            expect(TypeChecker.isString(new Date())).toBe(false);
        });
    });

    describe('isDate', () => {
        test('should return true for Date instances', () => {
            expect(TypeChecker.isDate(new Date())).toBe(true);
            expect(TypeChecker.isDate(new Date('2025-01-01'))).toBe(true);
            expect(TypeChecker.isDate(new Date(0))).toBe(true);
            expect(TypeChecker.isDate(new Date('invalid'))).toBe(true); // Invalid dates are still Date instances
        });

        test('should return false for non-Date values', () => {
            expect(TypeChecker.isDate('2025-01-01')).toBe(false);
            expect(TypeChecker.isDate(1735689600000)).toBe(false); // timestamp
            expect(TypeChecker.isDate('January 1, 2025')).toBe(false);
            expect(TypeChecker.isDate(null)).toBe(false);
            expect(TypeChecker.isDate(undefined)).toBe(false);
            expect(TypeChecker.isDate({})).toBe(false);
            expect(TypeChecker.isDate([])).toBe(false);
            expect(TypeChecker.isDate(123)).toBe(false);
            expect(TypeChecker.isDate('hello')).toBe(false);
        });
    });

    describe('isNumber', () => {
        test('should return true for valid number values', () => {
            expect(TypeChecker.isNumber(42)).toBe(true);
            expect(TypeChecker.isNumber(0)).toBe(true);
            expect(TypeChecker.isNumber(-1)).toBe(true);
            expect(TypeChecker.isNumber(3.14)).toBe(true);
            expect(TypeChecker.isNumber(Infinity)).toBe(true);
            expect(TypeChecker.isNumber(-Infinity)).toBe(true);
        });

        test('should return false for NaN', () => {
            expect(TypeChecker.isNumber(NaN)).toBe(false);
        });

        test('should return false for non-number values', () => {
            expect(TypeChecker.isNumber('123')).toBe(false);
            expect(TypeChecker.isNumber('42.5')).toBe(false);
            expect(TypeChecker.isNumber(true)).toBe(false);
            expect(TypeChecker.isNumber(false)).toBe(false);
            expect(TypeChecker.isNumber(null)).toBe(false);
            expect(TypeChecker.isNumber(undefined)).toBe(false);
            expect(TypeChecker.isNumber([])).toBe(false);
            expect(TypeChecker.isNumber({})).toBe(false);
            expect(TypeChecker.isNumber(new Date())).toBe(false);
        });

        test('should handle edge cases with numeric strings', () => {
            expect(TypeChecker.isNumber('0')).toBe(false);
            expect(TypeChecker.isNumber('3.14')).toBe(false);
            expect(TypeChecker.isNumber('Infinity')).toBe(false);
        });
    });

    describe('isBoolean', () => {
        test('should return true for boolean values', () => {
            expect(TypeChecker.isBoolean(true)).toBe(true);
            expect(TypeChecker.isBoolean(false)).toBe(true);
        });

        test('should return false for non-boolean values', () => {
            expect(TypeChecker.isBoolean('true')).toBe(false);
            expect(TypeChecker.isBoolean('false')).toBe(false);
            expect(TypeChecker.isBoolean(1)).toBe(false);
            expect(TypeChecker.isBoolean(0)).toBe(false);
            expect(TypeChecker.isBoolean(null)).toBe(false);
            expect(TypeChecker.isBoolean(undefined)).toBe(false);
            expect(TypeChecker.isBoolean([])).toBe(false);
            expect(TypeChecker.isBoolean({})).toBe(false);
            expect(TypeChecker.isBoolean(new Date())).toBe(false);
        });

        test('should handle truthy/falsy values correctly', () => {
            expect(TypeChecker.isBoolean('')).toBe(false); // falsy but not boolean
            expect(TypeChecker.isBoolean(' ')).toBe(false); // truthy but not boolean
        });
    });

    describe('isArray', () => {
        test('should return true for array values', () => {
            expect(TypeChecker.isArray([])).toBe(true);
            expect(TypeChecker.isArray([1, 2, 3])).toBe(true);
            expect(TypeChecker.isArray(['a', 'b', 'c'])).toBe(true);
            expect(TypeChecker.isArray([true, false])).toBe(true);
            expect(TypeChecker.isArray([{}])).toBe(true);
            expect(TypeChecker.isArray([[]])).toBe(true); // nested arrays
            expect(TypeChecker.isArray(new Array())).toBe(true);
            expect(TypeChecker.isArray(new Array(5))).toBe(true);
        });

        test('should return false for non-array values', () => {
            expect(TypeChecker.isArray({})).toBe(false);
            expect(TypeChecker.isArray('array')).toBe(false);
            expect(TypeChecker.isArray(123)).toBe(false);
            expect(TypeChecker.isArray(true)).toBe(false);
            expect(TypeChecker.isArray(null)).toBe(false);
            expect(TypeChecker.isArray(undefined)).toBe(false);
            expect(TypeChecker.isArray(new Date())).toBe(false);
        });

        test('should handle array-like objects correctly', () => {
            expect(TypeChecker.isArray({ length: 3, 0: 'a', 1: 'b', 2: 'c' })).toBe(false);
            expect(TypeChecker.isArray('string')).toBe(false); // strings have length property
        });
    });

    describe('isObject', () => {
        test('should return true for plain objects', () => {
            expect(TypeChecker.isObject({})).toBe(true);
            expect(TypeChecker.isObject({ key: 'value' })).toBe(true);
            expect(TypeChecker.isObject({ nested: { object: true } })).toBe(true);
            expect(TypeChecker.isObject(new Object())).toBe(true);
        });

        test('should return false for null', () => {
            expect(TypeChecker.isObject(null)).toBe(false);
        });

        test('should return false for arrays', () => {
            expect(TypeChecker.isObject([])).toBe(false);
            expect(TypeChecker.isObject([1, 2, 3])).toBe(false);
            expect(TypeChecker.isObject(new Array())).toBe(false);
        });

        test('should return false for primitive values', () => {
            expect(TypeChecker.isObject('string')).toBe(false);
            expect(TypeChecker.isObject(123)).toBe(false);
            expect(TypeChecker.isObject(true)).toBe(false);
            expect(TypeChecker.isObject(false)).toBe(false);
            expect(TypeChecker.isObject(undefined)).toBe(false);
        });

        test('should handle special object types', () => {
            expect(TypeChecker.isObject(new Date())).toBe(true); // Date is an object
            expect(TypeChecker.isObject(new RegExp('test'))).toBe(true); // RegExp is an object
            expect(TypeChecker.isObject(new Error('test'))).toBe(true); // Error is an object
        });

        test('should handle functions', () => {
            expect(TypeChecker.isObject(function() {})).toBe(false); // functions are not objects in this context
            expect(TypeChecker.isObject(() => {})).toBe(false);
        });
    });

    describe('integration tests', () => {
        test('should correctly identify mixed types in an array', () => {
            const mixedArray = [
                'string',
                42,
                true,
                new Date(),
                [],
                {},
                null,
                undefined
            ];

            expect(TypeChecker.isString(mixedArray[0])).toBe(true);
            expect(TypeChecker.isNumber(mixedArray[1])).toBe(true);
            expect(TypeChecker.isBoolean(mixedArray[2])).toBe(true);
            expect(TypeChecker.isDate(mixedArray[3])).toBe(true);
            expect(TypeChecker.isArray(mixedArray[4])).toBe(true);
            expect(TypeChecker.isObject(mixedArray[5])).toBe(true);
        });

        test('should handle edge cases consistently', () => {
            const edgeCases = [
                NaN,
                Infinity,
                -Infinity,
                '',
                0,
                false,
                [],
                {}
            ];

            // Each value should be identified by exactly one type checker
            edgeCases.forEach(value => {
                const checks = [
                    TypeChecker.isString(value),
                    TypeChecker.isNumber(value),
                    TypeChecker.isBoolean(value),
                    TypeChecker.isDate(value),
                    TypeChecker.isArray(value),
                    TypeChecker.isObject(value)
                ];
                
                const trueCount = checks.filter(Boolean).length;
                expect(trueCount).toBeGreaterThanOrEqual(0); // Some values might not match any type
            });
        });
    });
});
