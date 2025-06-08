import { StringChecker } from '@/dsl/helpers/string-checker';
import { describe, expect, it } from 'vitest';

describe('StringChecker', () => {
  describe('isEmpty', () => {
    it('returns true for empty string', () => {
      expect(StringChecker.isEmpty('')).toBe(true);
    });
    it('returns true for whitespace only', () => {
      expect(StringChecker.isEmpty('   ')).toBe(true);
      expect(StringChecker.isEmpty('\t\n  ')).toBe(true);
    });
    it('returns false for non-empty string', () => {
      expect(StringChecker.isEmpty('hello')).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.isEmpty(123)).toThrow();
    });
  });

  describe('isNonEmpty', () => {
    it('returns true for non-empty string', () => {
      expect(StringChecker.isNonEmpty('hello')).toBe(true);
      expect(StringChecker.isNonEmpty('   test   ')).toBe(true);
    });
    it('returns false for empty or whitespace', () => {
      expect(StringChecker.isNonEmpty('')).toBe(false);
      expect(StringChecker.isNonEmpty('   ')).toBe(false);
      expect(StringChecker.isNonEmpty('\t\n  ')).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.isNonEmpty(null)).toThrow();
    });
  });

  describe('hasLength', () => {
    it('returns true if trimmed string has expected length', () => {
      expect(StringChecker.hasLength('hello', 5)).toBe(true);
      expect(StringChecker.hasLength('  test  ', 4)).toBe(true);
      expect(StringChecker.hasLength('', 0)).toBe(true);
    });
    it('returns false if trimmed string does not have expected length', () => {
      expect(StringChecker.hasLength('abc', 5)).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.hasLength(123, 3)).toThrow();
    });
    it('throws if expectedLength is not a non-negative number', () => {
      expect(() => StringChecker.hasLength('abc', -1)).toThrow();
      // @ts-expect-error Testing error branch: not a number
      expect(() => StringChecker.hasLength('abc', '3')).toThrow();
    });
  });

  describe('contains', () => {
    it('returns true if substring is found', () => {
      expect(StringChecker.contains('hello world', 'world')).toBe(true);
    });
    it('returns false if substring is not found', () => {
      expect(StringChecker.contains('abc', 'xyz')).toBe(false);
    });
    it('is case-sensitive', () => {
      expect(StringChecker.contains('test', 'TEST')).toBe(false);
    });
    it('throws if either argument is not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.contains(123, 'a')).toThrow();
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.contains('abc', 1)).toThrow();
    });
  });

  describe('startsWith', () => {
    it('returns true if string starts with prefix', () => {
      expect(StringChecker.startsWith('hello world', 'hello')).toBe(true);
    });
    it('returns false if string does not start with prefix', () => {
      expect(StringChecker.startsWith('abc', 'xyz')).toBe(false);
    });
    it('is case-sensitive', () => {
      expect(StringChecker.startsWith('test', 'TEST')).toBe(false);
    });
    it('throws if either argument is not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.startsWith(123, 'a')).toThrow();
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.startsWith('abc', 1)).toThrow();
    });
  });

  describe('endsWith', () => {
    it('returns true if string ends with suffix', () => {
      expect(StringChecker.endsWith('hello world', 'world')).toBe(true);
      expect(StringChecker.endsWith('filename.txt', '.txt')).toBe(true);
    });
    it('returns false if string does not end with suffix', () => {
      expect(StringChecker.endsWith('abc', 'xyz')).toBe(false);
    });
    it('is case-sensitive', () => {
      expect(StringChecker.endsWith('test', 'TEST')).toBe(false);
    });
    it('throws if either argument is not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.endsWith(123, 'a')).toThrow();
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.endsWith('abc', 1)).toThrow();
    });
  });

  describe('regexMatch', () => {
    it('returns true if string matches pattern', () => {
      expect(StringChecker.regexMatch('user@domain.com', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBe(true);
      expect(StringChecker.regexMatch('12345', /^\d+$/)).toBe(true);
    });
    it('returns false if string does not match pattern', () => {
      expect(StringChecker.regexMatch('abc123', /^\d+$/)).toBe(false);
    });
    it('throws if value is not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.regexMatch(123, /abc/)).toThrow();
    });
    it('throws if pattern is not a RegExp', () => {
      // @ts-expect-error Testing error branch: not a RegExp
      expect(() => StringChecker.regexMatch('abc', 'abc')).toThrow();
    });
  });

  describe('isEmail', () => {
    it('returns true for valid emails', () => {
      expect(StringChecker.isEmail('user@example.com')).toBe(true);
      expect(StringChecker.isEmail('test.email+tag@domain.co.uk')).toBe(true);
    });
    it('returns false for invalid emails', () => {
      expect(StringChecker.isEmail('invalid.email')).toBe(false);
      expect(StringChecker.isEmail('@domain.com')).toBe(false);
      expect(StringChecker.isEmail('user@')).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.isEmail(123)).toThrow();
    });
  });

  describe('isURL', () => {
    it('returns true for valid URLs', () => {
      expect(StringChecker.isURL('https://www.example.com')).toBe(true);
      expect(StringChecker.isURL('http://localhost:3000/path')).toBe(true);
      expect(StringChecker.isURL('ftp://files.example.com')).toBe(true);
      expect(StringChecker.isURL('ws://socket.example.com')).toBe(true);
    });
    it('returns false for invalid URLs', () => {
      expect(StringChecker.isURL('invalid-url')).toBe(false);
      expect(StringChecker.isURL('www.example.com')).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.isURL(123)).toThrow();
    });
  });

  describe('isUUID', () => {
    it('returns true for valid UUIDs', () => {
      expect(StringChecker.isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(StringChecker.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });
    it('returns false for invalid UUIDs', () => {
      expect(StringChecker.isUUID('invalid-uuid')).toBe(false);
      expect(StringChecker.isUUID('123e4567e89b12d3a456426614174000')).toBe(false);
      expect(StringChecker.isUUID('123e4567-e89b-12d3-a456')).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.isUUID(123)).toThrow();
    });
  });

  describe('minLength', () => {
    it('returns true if trimmed string length >= minLength', () => {
      expect(StringChecker.minLength('hello', 3)).toBe(true);
      expect(StringChecker.minLength('  hello  ', 5)).toBe(true);
      expect(StringChecker.minLength('', 0)).toBe(true);
      expect(StringChecker.minLength('test', 0)).toBe(true);
    });
    it('returns false if trimmed string length < minLength', () => {
      expect(StringChecker.minLength('hi', 3)).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.minLength(123, 3)).toThrow();
    });
    it('throws if minLength is not a non-negative number', () => {
      expect(() => StringChecker.minLength('abc', -1)).toThrow();
      // @ts-expect-error Testing error branch: not a number
      expect(() => StringChecker.minLength('abc', '3')).toThrow();
    });
  });

  describe('maxLength', () => {
    it('returns true if trimmed string length <= maxLength', () => {
      expect(StringChecker.maxLength('hello', 10)).toBe(true);
      expect(StringChecker.maxLength('  hello  ', 5)).toBe(true);
      expect(StringChecker.maxLength('', 0)).toBe(true);
      expect(StringChecker.maxLength('test', 100)).toBe(true);
    });
    it('returns false if trimmed string length > maxLength', () => {
      expect(StringChecker.maxLength('hello world', 5)).toBe(false);
    });
    it('throws if not a string', () => {
      // @ts-expect-error Testing error branch: not a string
      expect(() => StringChecker.maxLength(123, 3)).toThrow();
    });
    it('throws if maxLength is not a non-negative number', () => {
      expect(() => StringChecker.maxLength('abc', -1)).toThrow();
      // @ts-expect-error Testing error branch: not a number
      expect(() => StringChecker.maxLength('abc', '3')).toThrow();
    });
  });
});
