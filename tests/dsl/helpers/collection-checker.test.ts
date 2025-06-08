import { CollectionChecker } from '@/dsl/helpers/collection-checker';
import { describe, expect, it } from 'vitest';

describe('CollectionChecker', () => {
  describe('isEmpty', () => {
    it('returns true for empty array', () => {
      expect(CollectionChecker.isEmpty([])).toBe(true);
    });
    it('returns false for non-empty array', () => {
      expect(CollectionChecker.isEmpty([1])).toBe(false);
    });
    it('returns true for empty object', () => {
      expect(CollectionChecker.isEmpty({})).toBe(true);
    });
    it('returns false for object with properties', () => {
      expect(CollectionChecker.isEmpty({ a: 1 })).toBe(false);
    });
    it('returns false for object with symbol property', () => {
      const sym = Symbol('s');
      expect(CollectionChecker.isEmpty({ [sym]: 1 } as any)).toBe(false);
    });
    it('throws for string input', () => {
      expect(() => CollectionChecker.isEmpty('str' as any)).toThrow('Input must be an array or an object.');
    });
    it('throws for number input', () => {
      expect(() => CollectionChecker.isEmpty(42 as any)).toThrow('Input must be an array or an object.');
    });
  });

  describe('hasProperty', () => {
    it('returns true for single property', () => {
      expect(CollectionChecker.hasProperty({ a: 1 }, 'a')).toBe(true);
    });
    it('returns false for missing property', () => {
      expect(CollectionChecker.hasProperty({ a: 1 }, 'b')).toBe(false);
    });
    it('returns true for all properties in array', () => {
      expect(CollectionChecker.hasProperty({ a: 1, b: 2 }, ['a', 'b'])).toBe(true);
    });
    it('returns false if any property is missing', () => {
      expect(CollectionChecker.hasProperty({ a: 1 }, ['a', 'b'])).toBe(false);
    });
    it('works with inherited properties', () => {
      const base = { foo: 1 };
      const obj = Object.create(base);
      expect(CollectionChecker.hasProperty(obj, 'foo')).toBe(true);
    });
    it('throws for non-object', () => {
      expect(() => CollectionChecker.hasProperty('str' as any, 'a')).toThrow('Value must be an object.');
    });
    it('throws for null', () => {
      expect(() => CollectionChecker.hasProperty(null as any, 'a')).toThrow('Value must be an object.');
    });
  });

  describe('contains', () => {
    it('returns true if array contains item', () => {
      expect(CollectionChecker.contains([1, 2, 3], 2)).toBe(true);
    });
    it('returns false if array does not contain item', () => {
      expect(CollectionChecker.contains([1, 2, 3], 4)).toBe(false);
    });
    it('returns true if object values contain item', () => {
      expect(CollectionChecker.contains({ a: 1, b: 2 }, 2)).toBe(true);
    });
    it('returns false if object values do not contain item', () => {
      expect(CollectionChecker.contains({ a: 1, b: 2 }, 3)).toBe(false);
    });
    it('returns false for object key match (not value)', () => {
      expect(CollectionChecker.contains({ a: 1 }, 'a')).toBe(false);
    });
    it('returns false for different object reference', () => {
      const obj = { id: 1 };
      expect(CollectionChecker.contains({ a: obj }, { id: 1 })).toBe(false);
    });
    it('throws for string input', () => {
      expect(() => CollectionChecker.contains('str' as any, 's')).toThrow('Input must be an array or an object.');
    });
    it('throws for number input', () => {
      expect(() => CollectionChecker.contains(42 as any, 1)).toThrow('Input must be an array or an object.');
    });
  });
});
