/**
 * @fileoverview Provides comprehensive string validation and manipulation utilities
 * @module StringChecker
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { countGraphemes, isNumber } from '@/utils';
import { TypeChecker } from './type-checker';

/**
 * Utility class providing static methods for string validation and manipulation operations.
 * Includes methods for checking string properties, format validation, and pattern matching.
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic string checks
 * StringChecker.isEmpty("   "); // true
 * StringChecker.contains("hello world", "world"); // true
 *
 * // Format validation
 * StringChecker.isEmail("user@example.com"); // true
 * StringChecker.isURL("https://example.com"); // true
 * ```
 */
export class StringChecker {
  /**
   * Checks if a string is empty after trimming whitespace.
   *
   * @public
   * @static
   * @param {string} value - The string to check for emptiness
   * @returns {boolean} True if the string is empty or contains only whitespace, false otherwise
   * @throws {string} Throws if value is not a string
   *
   * @example
   * ```typescript
   * StringChecker.isEmpty(""); // true
   * StringChecker.isEmpty("   "); // true
   * StringChecker.isEmpty("hello"); // false
   * StringChecker.isEmpty("\t\n  "); // true
   * ```
   *
   * @since 1.0.0
   */
  static isEmpty(value: string): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check if it is empty.';
    }

    return value.trim().length === 0;
  }

  /**
   * Checks if a string is not empty after trimming whitespace.
   *
   * @public
   * @static
   * @param {string} value - The string to check for non-emptiness
   * @returns {boolean} True if the string is not empty and contains non-whitespace characters, false otherwise
   * @throws {string} Throws if value is not a string
   *
   * @example
   * ```typescript
   * StringChecker.isNonEmpty("hello"); // true
   * StringChecker.isNonEmpty("   test   "); // true
   * StringChecker.isNonEmpty(""); // false
   * StringChecker.isNonEmpty("   "); // false
   * StringChecker.isNonEmpty("\t\n  "); // false
   * ```
   *
   * @since 1.0.0
   */
  static isNonEmpty(value: string): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check if it is non-empty.';
    }

    return value.trim().length > 0;
  }

  /**
   * Checks if a string has a specific length after trimming whitespace.
   *
   * @public
   * @static
   * @param {string} value - The string to check the length of
   * @param {number} expectedLength - The expected length to compare against
   * @returns {boolean} True if the trimmed string has the expected length, false otherwise
   * @throws {string} Throws if value is not a string or expectedLength is not a non-negative number
   *
   * @example
   * ```typescript
   * StringChecker.hasLength("hello", 5); // true
   * StringChecker.hasLength("  test  ", 4); // true (trimmed)
   * StringChecker.hasLength("abc", 5); // false
   * StringChecker.hasLength("", 0); // true
   * ```
   *
   * @since 1.0.0
   */
  static hasLength(value: string, expectedLength: number): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check its length.';
    }
    if (!isNumber(expectedLength) || expectedLength < 0) {
      throw 'Expected length must be a non-negative number.';
    }

    // Use countGraphemes to properly count Unicode characters (including complex emojis)
    return countGraphemes(value.trim()) === expectedLength;
  }

  /**
   * Checks if a string contains a specified substring.
   *
   * @public
   * @static
   * @param {string} value - The string to search within
   * @param {string} substring - The substring to search for
   * @returns {boolean} True if the substring is found within the value, false otherwise
   * @throws {string} Throws if either value or substring is not a string
   *
   * @example
   * ```typescript
   * StringChecker.contains("hello world", "world"); // true
   * StringChecker.contains("JavaScript", "Script"); // true
   * StringChecker.contains("test", "TEST"); // false (case-sensitive)
   * StringChecker.contains("abc", "xyz"); // false
   * ```
   *
   * @since 1.0.0
   */
  static contains(value: string, substring: string): boolean {
    if (!TypeChecker.isString(value) || !TypeChecker.isString(substring)) {
      throw 'Both value and substring must be strings for containment check.';
    }

    return value.includes(substring);
  }

  /**
   * Checks if a string starts with a specified prefix.
   *
   * @public
   * @static
   * @param {string} value - The string to check
   * @param {string} prefix - The prefix to check for
   * @returns {boolean} True if the string starts with the prefix, false otherwise
   * @throws {string} Throws if either value or prefix is not a string
   *
   * @example
   * ```typescript
   * StringChecker.startsWith("hello world", "hello"); // true
   * StringChecker.startsWith("JavaScript", "Java"); // true
   * StringChecker.startsWith("test", "TEST"); // false (case-sensitive)
   * StringChecker.startsWith("abc", "xyz"); // false
   * ```
   *
   * @since 1.0.0
   */
  static startsWith(value: string, prefix: string): boolean {
    if (!TypeChecker.isString(value) || !TypeChecker.isString(prefix)) {
      throw 'Both value and prefix must be strings for startsWith check.';
    }

    return value.startsWith(prefix);
  }

  /**
   * Checks if a string ends with a specified suffix.
   *
   * @public
   * @static
   * @param {string} value - The string to check
   * @param {string} suffix - The suffix to check for
   * @returns {boolean} True if the string ends with the suffix, false otherwise
   * @throws {string} Throws if either value or suffix is not a string
   *
   * @example
   * ```typescript
   * StringChecker.endsWith("hello world", "world"); // true
   * StringChecker.endsWith("filename.txt", ".txt"); // true
   * StringChecker.endsWith("test", "TEST"); // false (case-sensitive)
   * StringChecker.endsWith("abc", "xyz"); // false
   * ```
   *
   * @since 1.0.0
   */
  static endsWith(value: string, suffix: string): boolean {
    if (!TypeChecker.isString(value) || !TypeChecker.isString(suffix)) {
      throw 'Both value and suffix must be strings for endsWith check.';
    }

    return value.endsWith(suffix);
  }

  /**
   * Tests if a string matches a regular expression pattern.
   *
   * @public
   * @static
   * @param {string} value - The string to test against the pattern
   * @param {RegExp} pattern - The regular expression pattern to match
   * @returns {boolean} True if the string matches the pattern, false otherwise
   * @throws {string} Throws if value is not a string or pattern is not a RegExp
   *
   * @example
   * ```typescript
   * const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   * StringChecker.regexMatch("user@domain.com", emailPattern); // true
   *
   * const digitPattern = /^\d+$/;
   * StringChecker.regexMatch("12345", digitPattern); // true
   * StringChecker.regexMatch("abc123", digitPattern); // false
   * ```
   *
   * @since 1.0.0
   */
  static regexMatch(value: string, pattern: RegExp): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string for regex match.';
    }
    if (!(pattern instanceof RegExp)) {
      throw 'Pattern must be a valid RegExp object.';
    }

    return pattern.test(value);
  }

  /**
   * Validates if a string is a properly formatted email address.
   * Uses RFC-compliant email pattern for validation.
   *
   * @public
   * @static
   * @param {string} value - The string to validate as an email
   * @returns {boolean} True if the string is a valid email format, false otherwise
   * @throws {string} Throws if value is not a string
   *
   * @example
   * ```typescript
   * StringChecker.isEmail("user@example.com"); // true
   * StringChecker.isEmail("test.email+tag@domain.co.uk"); // true
   * StringChecker.isEmail("invalid.email"); // false
   * StringChecker.isEmail("@domain.com"); // false
   * StringChecker.isEmail("user@"); // false
   * ```
   *
   * @since 1.0.0
   */
  static isEmail(value: string): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check if it is an email.';
    }

    const emailPattern = new RegExp(
      '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+(?:[a-zA-Z0-9-]*[a-zA-Z0-9])?' +
        '(?:\\.[a-zA-Z0-9]+(?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.[a-zA-Z]{2,}$',
    );
    return emailPattern.test(value);
  }

  /**
   * Validates if a string is a properly formatted URL.
   * Supports common protocols: http, https, ftp, file, ws, wss, ldap.
   *
   * @public
   * @static
   * @param {string} value - The string to validate as a URL
   * @returns {boolean} True if the string is a valid URL format, false otherwise
   * @throws {string} Throws if value is not a string
   *
   * @example
   * ```typescript
   * StringChecker.isURL("https://www.example.com"); // true
   * StringChecker.isURL("http://localhost:3000/path"); // true
   * StringChecker.isURL("ftp://files.example.com"); // true
   * StringChecker.isURL("ws://socket.example.com"); // true
   * StringChecker.isURL("invalid-url"); // false
   * StringChecker.isURL("www.example.com"); // false (missing protocol)
   * ```
   *
   * @since 1.0.0
   */
  static isURL(value: string): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check if it is a URL.';
    }
    const urlPattern = /^(https?|ftp|file|ws|wss|ldap|file):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(value);
  }

  /**
   * Validates if a string is a properly formatted UUID (Universally Unique Identifier).
   * Supports UUID versions 1-5 in standard hyphenated format.
   *
   * @public
   * @static
   * @param {string} value - The string to validate as a UUID
   * @returns {boolean} True if the string is a valid UUID format, false otherwise
   * @throws {string} Throws if value is not a string
   *
   * @example
   * ```typescript
   * StringChecker.isUUID("123e4567-e89b-12d3-a456-426614174000"); // true
   * StringChecker.isUUID("550e8400-e29b-41d4-a716-446655440000"); // true
   * StringChecker.isUUID("invalid-uuid"); // false
   * StringChecker.isUUID("123e4567e89b12d3a456426614174000"); // false (missing hyphens)
   * StringChecker.isUUID("123e4567-e89b-12d3-a456"); // false (incomplete)
   * ```
   *
   * @since 1.0.0
   */
  static isUUID(value: string): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check if it is a UUID.';
    }
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(value);
  }

  /**
   * Checks if a string meets the minimum length requirement after trimming whitespace.
   *
   * @public
   * @static
   * @param {string} value - The string to check
   * @param {number} minLength - The minimum required length (must be non-negative)
   * @returns {boolean} True if the trimmed string length is greater than or equal to minLength, false otherwise
   * @throws {string} Throws if value is not a string or minLength is not a non-negative number
   *
   * @example
   * ```typescript
   * StringChecker.minLength("hello", 3); // true (5 >= 3)
   * StringChecker.minLength("hi", 3); // false (2 < 3)
   * StringChecker.minLength("  hello  ", 5); // true (trimmed: "hello" = 5 >= 5)
   * StringChecker.minLength("", 0); // true (0 >= 0)
   * StringChecker.minLength("test", 0); // true (4 >= 0)
   * ```
   *
   * @since 1.0.0
   */
  static minLength(value: string, minLength: number): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check its minimum length.';
    }
    if (!isNumber(minLength) || minLength < 0) {
      throw 'Minimum length must be a non-negative number.';
    }

    // Use countGraphemes to properly count Unicode characters (including complex emojis)
    return countGraphemes(value.trim()) >= minLength;
  }

  /**
   * Checks if a string does not exceed the maximum length requirement after trimming whitespace.
   *
   * @public
   * @static
   * @param {string} value - The string to check
   * @param {number} maxLength - The maximum allowed length (must be non-negative)
   * @returns {boolean} True if the trimmed string length is less than or equal to maxLength, false otherwise
   * @throws {string} Throws if value is not a string or maxLength is not a non-negative number
   *
   * @example
   * ```typescript
   * StringChecker.maxLength("hello", 10); // true (5 <= 10)
   * StringChecker.maxLength("hello world", 5); // false (11 > 5)
   * StringChecker.maxLength("  hello  ", 5); // true (trimmed: "hello" = 5 <= 5)
   * StringChecker.maxLength("", 0); // true (0 <= 0)
   * StringChecker.maxLength("test", 100); // true (4 <= 100)
   * ```
   *
   * @since 1.0.0
   */
  static maxLength(value: string, maxLength: number): boolean {
    if (!TypeChecker.isString(value)) {
      throw 'Value must be a string to check its maximum length.';
    }
    if (!isNumber(maxLength) || maxLength < 0) {
      throw 'Maximum length must be a non-negative number.';
    }

    // Use countGraphemes to properly count Unicode characters (including complex emojis)
    return countGraphemes(value.trim()) <= maxLength;
  }
}
