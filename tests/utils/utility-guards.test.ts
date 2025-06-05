import { describe, test, expect } from 'vitest';
import { isNullOrUndefined } from '../../src/utils/utility-guards';

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
});
