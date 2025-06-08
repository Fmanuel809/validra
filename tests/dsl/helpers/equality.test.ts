import { Equality } from '@/dsl/helpers/equality';
import { describe, expect, it } from 'vitest';

describe('Equality', () => {
  describe('isEqual', () => {
    it('returns true for equal primitives', () => {
      expect(Equality.isEqual(1, 1)).toBe(true);
      expect(Equality.isEqual('a', 'a')).toBe(true);
      expect(Equality.isEqual(true, true)).toBe(true);
    });
    it('returns false for different primitives', () => {
      expect(Equality.isEqual(1, 2)).toBe(false);
      expect(Equality.isEqual('a', 'b')).toBe(false);
      expect(Equality.isEqual(true, false)).toBe(false);
    });
    it('returns true for equal Date objects (same timestamp)', () => {
      const d1 = new Date('2025-01-01T00:00:00Z');
      const d2 = new Date('2025-01-01T00:00:00Z');
      expect(Equality.isEqual(d1, d2)).toBe(true);
    });
    it('returns false for different Date objects', () => {
      const d1 = new Date('2025-01-01T00:00:00Z');
      const d2 = new Date('2025-01-02T00:00:00Z');
      expect(Equality.isEqual(d1, d2)).toBe(false);
    });
    it('returns false for different types', () => {
      expect(Equality.isEqual(1, '1')).toBe(false);
      expect(Equality.isEqual(false, 0)).toBe(false);
    });
    it('throws if either value is null or undefined', () => {
      expect(() => Equality.isEqual(null as any, 1)).toThrow();
      expect(() => Equality.isEqual(1, undefined as any)).toThrow();
      expect(() => Equality.isEqual(undefined as any, null as any)).toThrow();
    });
  });

  describe('isNotEqual', () => {
    it('returns false for equal primitives', () => {
      expect(Equality.isNotEqual(1, 1)).toBe(false);
      expect(Equality.isNotEqual('a', 'a')).toBe(false);
      expect(Equality.isNotEqual(true, true)).toBe(false);
    });
    it('returns true for different primitives', () => {
      expect(Equality.isNotEqual(1, 2)).toBe(true);
      expect(Equality.isNotEqual('a', 'b')).toBe(true);
      expect(Equality.isNotEqual(true, false)).toBe(true);
    });
    it('returns false for equal Date objects (same timestamp)', () => {
      const d1 = new Date('2025-01-01T00:00:00Z');
      const d2 = new Date('2025-01-01T00:00:00Z');
      expect(Equality.isNotEqual(d1, d2)).toBe(false);
    });
    it('returns true for different Date objects', () => {
      const d1 = new Date('2025-01-01T00:00:00Z');
      const d2 = new Date('2025-01-02T00:00:00Z');
      expect(Equality.isNotEqual(d1, d2)).toBe(true);
    });
    it('returns true for different types', () => {
      expect(Equality.isNotEqual(1, '1')).toBe(true);
      expect(Equality.isNotEqual(false, 0)).toBe(true);
    });
    it('throws if either value is null or undefined', () => {
      expect(() => Equality.isNotEqual(null as any, 1)).toThrow();
      expect(() => Equality.isNotEqual(1, undefined as any)).toThrow();
      expect(() => Equality.isNotEqual(undefined as any, null as any)).toThrow();
    });
  });
});
