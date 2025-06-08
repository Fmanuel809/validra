import { Comparison } from '@/dsl/helpers/comparison';
import { describe, expect, it } from 'vitest';

describe('Comparison', () => {
  describe('isGreaterThan', () => {
    it('returns true if valueA > valueB', () => {
      expect(Comparison.isGreaterThan(10, 5)).toBe(true);
    });
    it('returns false if valueA <= valueB', () => {
      expect(Comparison.isGreaterThan(5, 10)).toBe(false);
      expect(Comparison.isGreaterThan(5, 5)).toBe(false);
    });
    it('throws if any value is null or undefined', () => {
      expect(() => Comparison.isGreaterThan(null as any, 1)).toThrow('Both values must be provided for comparison.');
      expect(() => Comparison.isGreaterThan(1, undefined as any)).toThrow(
        'Both values must be provided for comparison.',
      );
    });
    it('throws if any value is not a number', () => {
      expect(() => Comparison.isGreaterThan('a' as any, 1)).toThrow('Both values must be numbers for comparison.');
      expect(() => Comparison.isGreaterThan(1, 'b' as any)).toThrow('Both values must be numbers for comparison.');
    });
  });

  describe('isLessThan', () => {
    it('returns true if valueA < valueB', () => {
      expect(Comparison.isLessThan(1, 5)).toBe(true);
    });
    it('returns false if valueA >= valueB', () => {
      expect(Comparison.isLessThan(5, 1)).toBe(false);
      expect(Comparison.isLessThan(5, 5)).toBe(false);
    });
    it('throws if any value is null or undefined', () => {
      expect(() => Comparison.isLessThan(null as any, 1)).toThrow('Both values must be provided for comparison.');
      expect(() => Comparison.isLessThan(1, undefined as any)).toThrow('Both values must be provided for comparison.');
    });
    it('throws if any value is not a number', () => {
      expect(() => Comparison.isLessThan('a' as any, 1)).toThrow('Both values must be numbers for comparison.');
      expect(() => Comparison.isLessThan(1, 'b' as any)).toThrow('Both values must be numbers for comparison.');
    });
  });

  describe('isGreaterThanOrEqual', () => {
    it('returns true if valueA >= valueB', () => {
      expect(Comparison.isGreaterThanOrEqual(10, 5)).toBe(true);
      expect(Comparison.isGreaterThanOrEqual(5, 5)).toBe(true);
    });
    it('returns false if valueA < valueB', () => {
      expect(Comparison.isGreaterThanOrEqual(1, 5)).toBe(false);
    });
    it('throws if any value is null or undefined', () => {
      expect(() => Comparison.isGreaterThanOrEqual(null as any, 1)).toThrow(
        'Both values must be provided for comparison.',
      );
      expect(() => Comparison.isGreaterThanOrEqual(1, undefined as any)).toThrow(
        'Both values must be provided for comparison.',
      );
    });
    it('throws if any value is not a number', () => {
      expect(() => Comparison.isGreaterThanOrEqual('a' as any, 1)).toThrow(
        'Both values must be numbers for comparison.',
      );
      expect(() => Comparison.isGreaterThanOrEqual(1, 'b' as any)).toThrow(
        'Both values must be numbers for comparison.',
      );
    });
  });

  describe('isLessThanOrEqual', () => {
    it('returns true if valueA <= valueB', () => {
      expect(Comparison.isLessThanOrEqual(1, 5)).toBe(true);
      expect(Comparison.isLessThanOrEqual(5, 5)).toBe(true);
    });
    it('returns false if valueA > valueB', () => {
      expect(Comparison.isLessThanOrEqual(10, 5)).toBe(false);
    });
    it('throws if any value is null or undefined', () => {
      expect(() => Comparison.isLessThanOrEqual(null as any, 1)).toThrow(
        'Both values must be provided for comparison.',
      );
      expect(() => Comparison.isLessThanOrEqual(1, undefined as any)).toThrow(
        'Both values must be provided for comparison.',
      );
    });
    it('throws if any value is not a number', () => {
      expect(() => Comparison.isLessThanOrEqual('a' as any, 1)).toThrow('Both values must be numbers for comparison.');
      expect(() => Comparison.isLessThanOrEqual(1, 'b' as any)).toThrow('Both values must be numbers for comparison.');
    });
  });

  describe('between', () => {
    it('returns true if value is between min and max (inclusive)', () => {
      expect(Comparison.between(5, 1, 10)).toBe(true);
      expect(Comparison.between(1, 1, 10)).toBe(true);
      expect(Comparison.between(10, 1, 10)).toBe(true);
    });
    it('returns false if value is outside min and max', () => {
      expect(Comparison.between(0, 1, 10)).toBe(false);
      expect(Comparison.between(15, 1, 10)).toBe(false);
    });
    it('throws if any value is null or undefined', () => {
      expect(() => Comparison.between(null as any, 1, 10)).toThrow('All three values must be provided for comparison.');
      expect(() => Comparison.between(1, undefined as any, 10)).toThrow(
        'All three values must be provided for comparison.',
      );
      expect(() => Comparison.between(1, 1, undefined as any)).toThrow(
        'All three values must be provided for comparison.',
      );
    });
    it('throws if any value is not a number', () => {
      expect(() => Comparison.between('a' as any, 1, 10)).toThrow('All three values must be numbers for comparison.');
      expect(() => Comparison.between(1, 'b' as any, 10)).toThrow('All three values must be numbers for comparison.');
      expect(() => Comparison.between(1, 1, 'c' as any)).toThrow('All three values must be numbers for comparison.');
    });
  });

  describe('notBetween', () => {
    it('returns true if value is outside min and max', () => {
      expect(Comparison.notBetween(0, 1, 10)).toBe(true);
      expect(Comparison.notBetween(15, 1, 10)).toBe(true);
    });
    it('returns false if value is between min and max (inclusive)', () => {
      expect(Comparison.notBetween(5, 1, 10)).toBe(false);
      expect(Comparison.notBetween(1, 1, 10)).toBe(false);
      expect(Comparison.notBetween(10, 1, 10)).toBe(false);
    });
    it('throws if any value is null or undefined', () => {
      expect(() => Comparison.notBetween(null as any, 1, 10)).toThrow(
        'All three values must be provided for comparison.',
      );
      expect(() => Comparison.notBetween(1, undefined as any, 10)).toThrow(
        'All three values must be provided for comparison.',
      );
      expect(() => Comparison.notBetween(1, 1, undefined as any)).toThrow(
        'All three values must be provided for comparison.',
      );
    });
    it('throws if any value is not a number', () => {
      expect(() => Comparison.notBetween('a' as any, 1, 10)).toThrow(
        'All three values must be numbers for comparison.',
      );
      expect(() => Comparison.notBetween(1, 'b' as any, 10)).toThrow(
        'All three values must be numbers for comparison.',
      );
      expect(() => Comparison.notBetween(1, 1, 'c' as any)).toThrow('All three values must be numbers for comparison.');
    });
  });
});
