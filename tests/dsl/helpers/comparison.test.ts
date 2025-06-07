import { describe, test, expect } from 'vitest';
import { Comparison } from '../../../src/dsl/helpers/comparison';

describe('Comparison', () => {
    describe('isGreaterThan', () => {
        test('should return true when first value is greater than second', () => {
            expect(Comparison.isGreaterThan(10, 5)).toBe(true);
            expect(Comparison.isGreaterThan(1, 0)).toBe(true);
            expect(Comparison.isGreaterThan(0, -1)).toBe(true);
            expect(Comparison.isGreaterThan(-1, -5)).toBe(true);
            expect(Comparison.isGreaterThan(3.14, 2.71)).toBe(true);
        });

        test('should return false when first value is less than or equal to second', () => {
            expect(Comparison.isGreaterThan(5, 10)).toBe(false);
            expect(Comparison.isGreaterThan(5, 5)).toBe(false);
            expect(Comparison.isGreaterThan(0, 0)).toBe(false);
            expect(Comparison.isGreaterThan(-5, -1)).toBe(false);
            expect(Comparison.isGreaterThan(2.71, 3.14)).toBe(false);
        });

        test('should handle decimal numbers correctly', () => {
            expect(Comparison.isGreaterThan(1.1, 1.0)).toBe(true);
            expect(Comparison.isGreaterThan(0.1, 0.01)).toBe(true);
            expect(Comparison.isGreaterThan(999.999, 999.998)).toBe(true);
        });

        test('should handle special number values', () => {
            expect(Comparison.isGreaterThan(Infinity, 1000)).toBe(true);
            expect(Comparison.isGreaterThan(1, -Infinity)).toBe(true);
            expect(Comparison.isGreaterThan(Infinity, -Infinity)).toBe(true);
        });

        test('should throw error for null values', () => {
            expect(() => Comparison.isGreaterThan(null as any, 5)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isGreaterThan(5, null as any)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isGreaterThan(null as any, null as any)).toThrow('Both values must be provided for comparison.');
        });

        test('should throw error for undefined values', () => {
            expect(() => Comparison.isGreaterThan(undefined as any, 5)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isGreaterThan(5, undefined as any)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isGreaterThan(undefined as any, undefined as any)).toThrow('Both values must be provided for comparison.');
        });

        test('should throw error for non-number values', () => {
            expect(() => Comparison.isGreaterThan('10' as any, 5)).toThrow('Both values must be numbers for comparison.');
            expect(() => Comparison.isGreaterThan(10, '5' as any)).toThrow('Both values must be numbers for comparison.');
            expect(() => Comparison.isGreaterThan(true as any, false as any)).toThrow('Both values must be numbers for comparison.');
        });

        test('should throw error for NaN values', () => {
            expect(() => Comparison.isGreaterThan(NaN, 5)).toThrow('Both values must be numbers for comparison.');
            expect(() => Comparison.isGreaterThan(5, NaN)).toThrow('Both values must be numbers for comparison.');
        });
    });

    describe('isLessThan', () => {
        test('should return true when first value is less than second', () => {
            expect(Comparison.isLessThan(5, 10)).toBe(true);
            expect(Comparison.isLessThan(0, 1)).toBe(true);
            expect(Comparison.isLessThan(-1, 0)).toBe(true);
            expect(Comparison.isLessThan(-5, -1)).toBe(true);
            expect(Comparison.isLessThan(2.71, 3.14)).toBe(true);
        });

        test('should return false when first value is greater than or equal to second', () => {
            expect(Comparison.isLessThan(10, 5)).toBe(false);
            expect(Comparison.isLessThan(5, 5)).toBe(false);
            expect(Comparison.isLessThan(0, 0)).toBe(false);
            expect(Comparison.isLessThan(-1, -5)).toBe(false);
            expect(Comparison.isLessThan(3.14, 2.71)).toBe(false);
        });

        test('should handle decimal numbers correctly', () => {
            expect(Comparison.isLessThan(1.0, 1.1)).toBe(true);
            expect(Comparison.isLessThan(0.01, 0.1)).toBe(true);
            expect(Comparison.isLessThan(999.998, 999.999)).toBe(true);
        });

        test('should handle special number values', () => {
            expect(Comparison.isLessThan(-Infinity, 1000)).toBe(true);
            expect(Comparison.isLessThan(1, Infinity)).toBe(true);
            expect(Comparison.isLessThan(-Infinity, Infinity)).toBe(true);
        });

        test('should throw error for invalid values', () => {
            expect(() => Comparison.isLessThan(null as any, 5)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isLessThan(5, undefined as any)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isLessThan('5' as any, 10)).toThrow('Both values must be numbers for comparison.');
            expect(() => Comparison.isLessThan(NaN, 5)).toThrow('Both values must be numbers for comparison.');
        });
    });

    describe('isGreaterThanOrEqual', () => {
        test('should return true when first value is greater than second', () => {
            expect(Comparison.isGreaterThanOrEqual(10, 5)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(1, 0)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(-1, -5)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(3.14, 2.71)).toBe(true);
        });

        test('should return true when values are equal', () => {
            expect(Comparison.isGreaterThanOrEqual(5, 5)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(0, 0)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(-1, -1)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(3.14, 3.14)).toBe(true);
        });

        test('should return false when first value is less than second', () => {
            expect(Comparison.isGreaterThanOrEqual(5, 10)).toBe(false);
            expect(Comparison.isGreaterThanOrEqual(0, 1)).toBe(false);
            expect(Comparison.isGreaterThanOrEqual(-5, -1)).toBe(false);
            expect(Comparison.isGreaterThanOrEqual(2.71, 3.14)).toBe(false);
        });

        test('should throw error for invalid values', () => {
            expect(() => Comparison.isGreaterThanOrEqual(null as any, 5)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isGreaterThanOrEqual(5, undefined as any)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isGreaterThanOrEqual('5' as any, 10)).toThrow('Both values must be numbers for comparison.');
        });
    });

    describe('isLessThanOrEqual', () => {
        test('should return true when first value is less than second', () => {
            expect(Comparison.isLessThanOrEqual(5, 10)).toBe(true);
            expect(Comparison.isLessThanOrEqual(0, 1)).toBe(true);
            expect(Comparison.isLessThanOrEqual(-5, -1)).toBe(true);
            expect(Comparison.isLessThanOrEqual(2.71, 3.14)).toBe(true);
        });

        test('should return true when values are equal', () => {
            expect(Comparison.isLessThanOrEqual(5, 5)).toBe(true);
            expect(Comparison.isLessThanOrEqual(0, 0)).toBe(true);
            expect(Comparison.isLessThanOrEqual(-1, -1)).toBe(true);
            expect(Comparison.isLessThanOrEqual(3.14, 3.14)).toBe(true);
        });

        test('should return false when first value is greater than second', () => {
            expect(Comparison.isLessThanOrEqual(10, 5)).toBe(false);
            expect(Comparison.isLessThanOrEqual(1, 0)).toBe(false);
            expect(Comparison.isLessThanOrEqual(-1, -5)).toBe(false);
            expect(Comparison.isLessThanOrEqual(3.14, 2.71)).toBe(false);
        });

        test('should throw error for invalid values', () => {
            expect(() => Comparison.isLessThanOrEqual(null as any, 5)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isLessThanOrEqual(5, undefined as any)).toThrow('Both values must be provided for comparison.');
            expect(() => Comparison.isLessThanOrEqual('5' as any, 10)).toThrow('Both values must be numbers for comparison.');
        });
    });

    describe('between', () => {
        test('should return true when value is within range (inclusive)', () => {
            expect(Comparison.between(5, 1, 10)).toBe(true);
            expect(Comparison.between(1, 1, 10)).toBe(true); // min boundary
            expect(Comparison.between(10, 1, 10)).toBe(true); // max boundary
            expect(Comparison.between(0, -5, 5)).toBe(true);
            expect(Comparison.between(-3, -5, 5)).toBe(true);
            expect(Comparison.between(3.5, 1.0, 10.0)).toBe(true);
        });

        test('should return false when value is outside range', () => {
            expect(Comparison.between(0, 1, 10)).toBe(false);
            expect(Comparison.between(15, 1, 10)).toBe(false);
            expect(Comparison.between(-1, 1, 10)).toBe(false);
            expect(Comparison.between(11, 1, 10)).toBe(false);
            expect(Comparison.between(-10, -5, 5)).toBe(false);
            expect(Comparison.between(10, -5, 5)).toBe(false);
        });

        test('should handle negative ranges correctly', () => {
            expect(Comparison.between(-3, -5, -1)).toBe(true);
            expect(Comparison.between(-5, -5, -1)).toBe(true);
            expect(Comparison.between(-1, -5, -1)).toBe(true);
            expect(Comparison.between(-6, -5, -1)).toBe(false);
            expect(Comparison.between(0, -5, -1)).toBe(false);
        });

        test('should handle decimal ranges correctly', () => {
            expect(Comparison.between(2.5, 1.1, 3.9)).toBe(true);
            expect(Comparison.between(1.1, 1.1, 3.9)).toBe(true);
            expect(Comparison.between(3.9, 1.1, 3.9)).toBe(true);
            expect(Comparison.between(1.0, 1.1, 3.9)).toBe(false);
            expect(Comparison.between(4.0, 1.1, 3.9)).toBe(false);
        });

        test('should handle single point range (min equals max)', () => {
            expect(Comparison.between(5, 5, 5)).toBe(true);
            expect(Comparison.between(4, 5, 5)).toBe(false);
            expect(Comparison.between(6, 5, 5)).toBe(false);
        });

        test('should throw error for null or undefined values', () => {
            expect(() => Comparison.between(null as any, 1, 10)).toThrow('All three values must be provided for comparison.');
            expect(() => Comparison.between(5, null as any, 10)).toThrow('All three values must be provided for comparison.');
            expect(() => Comparison.between(5, 1, null as any)).toThrow('All three values must be provided for comparison.');
            expect(() => Comparison.between(undefined as any, 1, 10)).toThrow('All three values must be provided for comparison.');
        });

        test('should throw error for non-number values', () => {
            expect(() => Comparison.between('5' as any, 1, 10)).toThrow('All three values must be numbers for comparison.');
            expect(() => Comparison.between(5, '1' as any, 10)).toThrow('All three values must be numbers for comparison.');
            expect(() => Comparison.between(5, 1, '10' as any)).toThrow('All three values must be numbers for comparison.');
            expect(() => Comparison.between(NaN, 1, 10)).toThrow('All three values must be numbers for comparison.');
        });
    });

    describe('notBetween', () => {
        test('should return true when value is outside range', () => {
            expect(Comparison.notBetween(0, 1, 10)).toBe(true);
            expect(Comparison.notBetween(15, 1, 10)).toBe(true);
            expect(Comparison.notBetween(-1, 1, 10)).toBe(true);
            expect(Comparison.notBetween(11, 1, 10)).toBe(true);
            expect(Comparison.notBetween(-10, -5, 5)).toBe(true);
            expect(Comparison.notBetween(10, -5, 5)).toBe(true);
        });

        test('should return false when value is within range (inclusive)', () => {
            expect(Comparison.notBetween(5, 1, 10)).toBe(false);
            expect(Comparison.notBetween(1, 1, 10)).toBe(false); // min boundary
            expect(Comparison.notBetween(10, 1, 10)).toBe(false); // max boundary
            expect(Comparison.notBetween(0, -5, 5)).toBe(false);
            expect(Comparison.notBetween(-3, -5, 5)).toBe(false);
            expect(Comparison.notBetween(3.5, 1.0, 10.0)).toBe(false);
        });

        test('should handle negative ranges correctly', () => {
            expect(Comparison.notBetween(-6, -5, -1)).toBe(true);
            expect(Comparison.notBetween(0, -5, -1)).toBe(true);
            expect(Comparison.notBetween(-3, -5, -1)).toBe(false);
            expect(Comparison.notBetween(-5, -5, -1)).toBe(false);
            expect(Comparison.notBetween(-1, -5, -1)).toBe(false);
        });

        test('should handle decimal ranges correctly', () => {
            expect(Comparison.notBetween(1.0, 1.1, 3.9)).toBe(true);
            expect(Comparison.notBetween(4.0, 1.1, 3.9)).toBe(true);
            expect(Comparison.notBetween(2.5, 1.1, 3.9)).toBe(false);
            expect(Comparison.notBetween(1.1, 1.1, 3.9)).toBe(false);
            expect(Comparison.notBetween(3.9, 1.1, 3.9)).toBe(false);
        });

        test('should handle single point range (min equals max)', () => {
            expect(Comparison.notBetween(4, 5, 5)).toBe(true);
            expect(Comparison.notBetween(6, 5, 5)).toBe(true);
            expect(Comparison.notBetween(5, 5, 5)).toBe(false);
        });

        test('should throw error for invalid values', () => {
            expect(() => Comparison.notBetween(null as any, 1, 10)).toThrow('All three values must be provided for comparison.');
            expect(() => Comparison.notBetween(5, undefined as any, 10)).toThrow('All three values must be provided for comparison.');
            expect(() => Comparison.notBetween('5' as any, 1, 10)).toThrow('All three values must be numbers for comparison.');
            expect(() => Comparison.notBetween(NaN, 1, 10)).toThrow('All three values must be numbers for comparison.');
        });
    });

    describe('integration tests', () => {
        test('should work correctly with all comparison methods together', () => {
            const value = 5;
            const min = 1;
            const max = 10;

            // Value should be greater than min
            expect(Comparison.isGreaterThan(value, min)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(value, min)).toBe(true);

            // Value should be less than max
            expect(Comparison.isLessThan(value, max)).toBe(true);
            expect(Comparison.isLessThanOrEqual(value, max)).toBe(true);

            // Value should be in range
            expect(Comparison.between(value, min, max)).toBe(true);
            expect(Comparison.notBetween(value, min, max)).toBe(false);
        });

        test('should handle boundary values consistently', () => {
            const min = 1;
            const max = 10;

            // Test min boundary
            expect(Comparison.isGreaterThanOrEqual(min, min)).toBe(true);
            expect(Comparison.isLessThanOrEqual(min, max)).toBe(true);
            expect(Comparison.between(min, min, max)).toBe(true);
            expect(Comparison.notBetween(min, min, max)).toBe(false);

            // Test max boundary
            expect(Comparison.isLessThanOrEqual(max, max)).toBe(true);
            expect(Comparison.isGreaterThanOrEqual(max, min)).toBe(true);
            expect(Comparison.between(max, min, max)).toBe(true);
            expect(Comparison.notBetween(max, min, max)).toBe(false);
        });

        test('should handle special numeric values consistently', () => {
            // Test with Infinity
            expect(Comparison.isGreaterThan(Infinity, 1000)).toBe(true);
            expect(Comparison.isLessThan(-Infinity, -1000)).toBe(true);
            expect(Comparison.between(0, -Infinity, Infinity)).toBe(true);

            // Test with very large numbers
            const large = Number.MAX_VALUE;
            const small = Number.MIN_VALUE;
            expect(Comparison.isGreaterThan(large, small)).toBe(true);
            expect(Comparison.between(1000, small, large)).toBe(true);
        });
    });
});
