import { TypeChecker } from '@/dsl/helpers/type-checker';
import { describe, expect, it } from 'vitest';

describe('TypeChecker', () => {
  describe('isString', () => {
    it('returns true for string primitives', () => {
      expect(TypeChecker.isString('hello')).toBe(true);
      expect(TypeChecker.isString('')).toBe(true);
    });
    it('returns true for String objects', () => {
      expect(TypeChecker.isString(new String('abc'))).toBe(true);
    });
    it('returns false for non-strings', () => {
      expect(TypeChecker.isString(123)).toBe(false);
      expect(TypeChecker.isString(null)).toBe(false);
      expect(TypeChecker.isString(undefined)).toBe(false);
      expect(TypeChecker.isString({})).toBe(false);
      expect(TypeChecker.isString([])).toBe(false);
    });
  });

  describe('isDate', () => {
    it('returns true for Date instances', () => {
      expect(TypeChecker.isDate(new Date())).toBe(true);
      expect(TypeChecker.isDate(new Date('invalid'))).toBe(true);
    });
    it('returns false for non-Date values', () => {
      expect(TypeChecker.isDate('2025-01-01')).toBe(false);
      expect(TypeChecker.isDate(1735689600000)).toBe(false);
      expect(TypeChecker.isDate({})).toBe(false);
      expect(TypeChecker.isDate([])).toBe(false);
      expect(TypeChecker.isDate(null)).toBe(false);
      expect(TypeChecker.isDate(undefined)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('returns true for numbers', () => {
      expect(TypeChecker.isNumber(42)).toBe(true);
      expect(TypeChecker.isNumber(3.14)).toBe(true);
      expect(TypeChecker.isNumber(Infinity)).toBe(true);
      expect(TypeChecker.isNumber(-Infinity)).toBe(true);
    });
    it('returns false for NaN', () => {
      expect(TypeChecker.isNumber(NaN)).toBe(false);
    });
    it('returns false for non-numbers', () => {
      expect(TypeChecker.isNumber('123')).toBe(false);
      expect(TypeChecker.isNumber(null)).toBe(false);
      expect(TypeChecker.isNumber(undefined)).toBe(false);
      expect(TypeChecker.isNumber({})).toBe(false);
      expect(TypeChecker.isNumber([])).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('returns true for true and false', () => {
      expect(TypeChecker.isBoolean(true)).toBe(true);
      expect(TypeChecker.isBoolean(false)).toBe(true);
    });
    it('returns false for non-boolean values', () => {
      expect(TypeChecker.isBoolean(1)).toBe(false);
      expect(TypeChecker.isBoolean('')).toBe(false);
      expect(TypeChecker.isBoolean('true')).toBe(false);
      expect(TypeChecker.isBoolean(null)).toBe(false);
      expect(TypeChecker.isBoolean(undefined)).toBe(false);
      expect(TypeChecker.isBoolean({})).toBe(false);
      expect(TypeChecker.isBoolean([])).toBe(false);
    });
  });

  describe('isArray', () => {
    it('returns true for arrays', () => {
      expect(TypeChecker.isArray([])).toBe(true);
      expect(TypeChecker.isArray([1, 2, 3])).toBe(true);
      expect(TypeChecker.isArray(new Array(5))).toBe(true);
    });
    it('returns false for non-arrays', () => {
      expect(TypeChecker.isArray({})).toBe(false);
      expect(TypeChecker.isArray('string')).toBe(false);
      expect(TypeChecker.isArray(123)).toBe(false);
      expect(TypeChecker.isArray(null)).toBe(false);
      expect(TypeChecker.isArray(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('returns true for plain objects', () => {
      expect(TypeChecker.isObject({})).toBe(true);
      expect(TypeChecker.isObject({ key: 'value' })).toBe(true);
      expect(TypeChecker.isObject(new Date())).toBe(true);
      expect(TypeChecker.isObject(new RegExp('a'))).toBe(true);
    });
    it('returns false for arrays', () => {
      expect(TypeChecker.isObject([])).toBe(false);
      expect(TypeChecker.isObject([1, 2, 3])).toBe(false);
    });
    it('returns false for null', () => {
      expect(TypeChecker.isObject(null)).toBe(false);
    });
    it('returns false for non-objects', () => {
      expect(TypeChecker.isObject('string')).toBe(false);
      expect(TypeChecker.isObject(123)).toBe(false);
      expect(TypeChecker.isObject(undefined)).toBe(false);
      expect(TypeChecker.isObject(true)).toBe(false);
    });
  });
});
