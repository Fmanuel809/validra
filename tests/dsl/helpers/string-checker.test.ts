/**
 * @fileoverview Comprehensive test suite for StringChecker utility class
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { StringChecker } from '../../../src/dls/helpers/string-checker';

describe('StringChecker', () => {
    describe('isEmpty', () => {
        it('should return true for empty strings', () => {
            expect(StringChecker.isEmpty('')).toBe(true);
        });

        it('should return true for whitespace-only strings', () => {
            expect(StringChecker.isEmpty('   ')).toBe(true);
            expect(StringChecker.isEmpty('\t')).toBe(true);
            expect(StringChecker.isEmpty('\n')).toBe(true);
            expect(StringChecker.isEmpty('\r')).toBe(true);
            expect(StringChecker.isEmpty('  \t\n\r  ')).toBe(true);
        });

        it('should return false for non-empty strings', () => {
            expect(StringChecker.isEmpty('hello')).toBe(false);
            expect(StringChecker.isEmpty(' a ')).toBe(false);
            expect(StringChecker.isEmpty('0')).toBe(false);
            expect(StringChecker.isEmpty('false')).toBe(false);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.isEmpty(null as any)).toThrow('Value must be a string to check if it is empty.');
            expect(() => StringChecker.isEmpty(undefined as any)).toThrow('Value must be a string to check if it is empty.');
            expect(() => StringChecker.isEmpty(123 as any)).toThrow('Value must be a string to check if it is empty.');
            expect(() => StringChecker.isEmpty([] as any)).toThrow('Value must be a string to check if it is empty.');
            expect(() => StringChecker.isEmpty({} as any)).toThrow('Value must be a string to check if it is empty.');
        });
    });

    describe('contains', () => {
        it('should return true when substring is found', () => {
            expect(StringChecker.contains('hello world', 'world')).toBe(true);
            expect(StringChecker.contains('JavaScript', 'Script')).toBe(true);
            expect(StringChecker.contains('testing', 'test')).toBe(true);
            expect(StringChecker.contains('abc', 'abc')).toBe(true);
            expect(StringChecker.contains('hello', '')).toBe(true); // empty string is always contained
        });

        it('should return false when substring is not found', () => {
            expect(StringChecker.contains('hello world', 'xyz')).toBe(false);
            expect(StringChecker.contains('JavaScript', 'Python')).toBe(false);
            expect(StringChecker.contains('test', 'TEST')).toBe(false); // case-sensitive
        });

        it('should be case-sensitive', () => {
            expect(StringChecker.contains('Hello World', 'hello')).toBe(false);
            expect(StringChecker.contains('JAVASCRIPT', 'javascript')).toBe(false);
        });

        it('should handle special characters', () => {
            expect(StringChecker.contains('user@domain.com', '@')).toBe(true);
            expect(StringChecker.contains('path/to/file', '/')).toBe(true);
            expect(StringChecker.contains('$100.50', '$')).toBe(true);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.contains(null as any, 'test')).toThrow('Both value and substring must be strings for containment check.');
            expect(() => StringChecker.contains(123 as any, 'test')).toThrow('Both value and substring must be strings for containment check.');
        });

        it('should throw when substring is not a string', () => {
            expect(() => StringChecker.contains('test', null as any)).toThrow('Both value and substring must be strings for containment check.');
            expect(() => StringChecker.contains('test', 123 as any)).toThrow('Both value and substring must be strings for containment check.');
        });
    });

    describe('startsWith', () => {
        it('should return true when string starts with prefix', () => {
            expect(StringChecker.startsWith('hello world', 'hello')).toBe(true);
            expect(StringChecker.startsWith('JavaScript', 'Java')).toBe(true);
            expect(StringChecker.startsWith('testing', 'test')).toBe(true);
            expect(StringChecker.startsWith('abc', 'abc')).toBe(true);
            expect(StringChecker.startsWith('hello', '')).toBe(true); // empty prefix always matches
        });

        it('should return false when string does not start with prefix', () => {
            expect(StringChecker.startsWith('hello world', 'world')).toBe(false);
            expect(StringChecker.startsWith('JavaScript', 'Script')).toBe(false);
            expect(StringChecker.startsWith('test', 'TEST')).toBe(false); // case-sensitive
        });

        it('should be case-sensitive', () => {
            expect(StringChecker.startsWith('Hello World', 'hello')).toBe(false);
            expect(StringChecker.startsWith('JAVASCRIPT', 'java')).toBe(false);
        });

        it('should handle special characters', () => {
            expect(StringChecker.startsWith('@username', '@')).toBe(true);
            expect(StringChecker.startsWith('$100.50', '$')).toBe(true);
            expect(StringChecker.startsWith('#hashtag', '#')).toBe(true);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.startsWith(null as any, 'test')).toThrow('Both value and prefix must be strings for startsWith check.');
            expect(() => StringChecker.startsWith(123 as any, 'test')).toThrow('Both value and prefix must be strings for startsWith check.');
        });

        it('should throw when prefix is not a string', () => {
            expect(() => StringChecker.startsWith('test', null as any)).toThrow('Both value and prefix must be strings for startsWith check.');
            expect(() => StringChecker.startsWith('test', 123 as any)).toThrow('Both value and prefix must be strings for startsWith check.');
        });
    });

    describe('endsWith', () => {
        it('should return true when string ends with suffix', () => {
            expect(StringChecker.endsWith('hello world', 'world')).toBe(true);
            expect(StringChecker.endsWith('filename.txt', '.txt')).toBe(true);
            expect(StringChecker.endsWith('testing', 'ing')).toBe(true);
            expect(StringChecker.endsWith('abc', 'abc')).toBe(true);
            expect(StringChecker.endsWith('hello', '')).toBe(true); // empty suffix always matches
        });

        it('should return false when string does not end with suffix', () => {
            expect(StringChecker.endsWith('hello world', 'hello')).toBe(false);
            expect(StringChecker.endsWith('filename.txt', '.pdf')).toBe(false);
            expect(StringChecker.endsWith('test', 'TEST')).toBe(false); // case-sensitive
        });

        it('should be case-sensitive', () => {
            expect(StringChecker.endsWith('Hello World', 'WORLD')).toBe(false);
            expect(StringChecker.endsWith('filename.TXT', '.txt')).toBe(false);
        });

        it('should handle special characters', () => {
            expect(StringChecker.endsWith('sentence!', '!')).toBe(true);
            expect(StringChecker.endsWith('query?', '?')).toBe(true);
            expect(StringChecker.endsWith('price$', '$')).toBe(true);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.endsWith(null as any, 'test')).toThrow('Both value and suffix must be strings for endsWith check.');
            expect(() => StringChecker.endsWith(123 as any, 'test')).toThrow('Both value and suffix must be strings for endsWith check.');
        });

        it('should throw when suffix is not a string', () => {
            expect(() => StringChecker.endsWith('test', null as any)).toThrow('Both value and suffix must be strings for endsWith check.');
            expect(() => StringChecker.endsWith('test', 123 as any)).toThrow('Both value and suffix must be strings for endsWith check.');
        });
    });

    describe('regexMatch', () => {
        it('should return true when string matches pattern', () => {
            const digitPattern = /^\d+$/;
            expect(StringChecker.regexMatch('12345', digitPattern)).toBe(true);
            
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(StringChecker.regexMatch('user@domain.com', emailPattern)).toBe(true);
            
            const wordPattern = /^[a-zA-Z]+$/;
            expect(StringChecker.regexMatch('hello', wordPattern)).toBe(true);
        });

        it('should return false when string does not match pattern', () => {
            const digitPattern = /^\d+$/;
            expect(StringChecker.regexMatch('abc123', digitPattern)).toBe(false);
            expect(StringChecker.regexMatch('12.34', digitPattern)).toBe(false);
            
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(StringChecker.regexMatch('invalid-email', emailPattern)).toBe(false);
        });

        it('should handle case-sensitive patterns', () => {
            const upperPattern = /^[A-Z]+$/;
            expect(StringChecker.regexMatch('HELLO', upperPattern)).toBe(true);
            expect(StringChecker.regexMatch('hello', upperPattern)).toBe(false);
        });

        it('should handle case-insensitive patterns', () => {
            const caseInsensitivePattern = /^hello$/i;
            expect(StringChecker.regexMatch('HELLO', caseInsensitivePattern)).toBe(true);
            expect(StringChecker.regexMatch('hello', caseInsensitivePattern)).toBe(true);
            expect(StringChecker.regexMatch('HeLLo', caseInsensitivePattern)).toBe(true);
        });

        it('should throw when value is not a string', () => {
            const pattern = /test/;
            expect(() => StringChecker.regexMatch(null as any, pattern)).toThrow('Value must be a string for regex match.');
            expect(() => StringChecker.regexMatch(123 as any, pattern)).toThrow('Value must be a string for regex match.');
            expect(() => StringChecker.regexMatch([] as any, pattern)).toThrow('Value must be a string for regex match.');
        });

        it('should throw when pattern is not a RegExp', () => {
            expect(() => StringChecker.regexMatch('test', null as any)).toThrow('Pattern must be a valid RegExp object.');
            expect(() => StringChecker.regexMatch('test', 'pattern' as any)).toThrow('Pattern must be a valid RegExp object.');
            expect(() => StringChecker.regexMatch('test', {} as any)).toThrow('Pattern must be a valid RegExp object.');
        });
    });

    describe('isEmail', () => {
        it('should return true for valid email addresses', () => {
            expect(StringChecker.isEmail('user@example.com')).toBe(true);
            expect(StringChecker.isEmail('test.email@domain.org')).toBe(true);
            expect(StringChecker.isEmail('user+tag@example.co.uk')).toBe(true);
            expect(StringChecker.isEmail('firstname.lastname@company.com')).toBe(true);
            expect(StringChecker.isEmail('123@domain.net')).toBe(true);
            expect(StringChecker.isEmail('user_name@example-domain.com')).toBe(true); // underscore and hyphen
            expect(StringChecker.isEmail('user@example-domain.com')).toBe(true); // hyphen in domain
            expect(StringChecker.isEmail('test.email+tag@sub-domain.co.uk')).toBe(true); // complex valid email
            expect(StringChecker.isEmail('user@my-company.com')).toBe(true); // hyphen in domain
        });

        it('should return false for invalid email addresses', () => {
            expect(StringChecker.isEmail('invalid.email')).toBe(false);
            expect(StringChecker.isEmail('@domain.com')).toBe(false);
            expect(StringChecker.isEmail('user@')).toBe(false);
            expect(StringChecker.isEmail('user@domain')).toBe(false);
            expect(StringChecker.isEmail('user space@domain.com')).toBe(false);
            expect(StringChecker.isEmail('user@domain..com')).toBe(false); // consecutive dots
            expect(StringChecker.isEmail('user@.domain.com')).toBe(false); // starts with dot
            expect(StringChecker.isEmail('user@domain.')).toBe(false); // ends with dot
            expect(StringChecker.isEmail('user@-domain.com')).toBe(false); // starts with hyphen
            expect(StringChecker.isEmail('user@domain-.com')).toBe(false); // ends with hyphen
            expect(StringChecker.isEmail('user@@domain.com')).toBe(false);
            expect(StringChecker.isEmail('')).toBe(false);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.isEmail(null as any)).toThrow('Value must be a string to check if it is an email.');
            expect(() => StringChecker.isEmail(123 as any)).toThrow('Value must be a string to check if it is an email.');
            expect(() => StringChecker.isEmail([] as any)).toThrow('Value must be a string to check if it is an email.');
        });
    });

    describe('isURL', () => {
        it('should return true for valid URLs', () => {
            expect(StringChecker.isURL('https://www.example.com')).toBe(true);
            expect(StringChecker.isURL('http://localhost:3000')).toBe(true);
            expect(StringChecker.isURL('https://api.example.com/v1/users')).toBe(true);
            expect(StringChecker.isURL('ftp://files.example.com')).toBe(true);
            expect(StringChecker.isURL('ws://socket.example.com')).toBe(true);
            expect(StringChecker.isURL('wss://secure.socket.com')).toBe(true);
            expect(StringChecker.isURL('ldap://directory.example.com')).toBe(true);
        });

        it('should return false for invalid URLs', () => {
            expect(StringChecker.isURL('invalid-url')).toBe(false);
            expect(StringChecker.isURL('www.example.com')).toBe(false); // missing protocol
            expect(StringChecker.isURL('://example.com')).toBe(false); // missing protocol name
            expect(StringChecker.isURL('http://')).toBe(false); // incomplete
            expect(StringChecker.isURL('https://.com')).toBe(false); // invalid domain
            expect(StringChecker.isURL('mailto:user@example.com')).toBe(false); // unsupported protocol
            expect(StringChecker.isURL('')).toBe(false);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.isURL(null as any)).toThrow('Value must be a string to check if it is a URL.');
            expect(() => StringChecker.isURL(123 as any)).toThrow('Value must be a string to check if it is a URL.');
            expect(() => StringChecker.isURL({} as any)).toThrow('Value must be a string to check if it is a URL.');
        });
    });

    describe('isUUID', () => {
        it('should return true for valid UUIDs', () => {
            expect(StringChecker.isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
            expect(StringChecker.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(StringChecker.isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
            expect(StringChecker.isUUID('6ba7b811-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
            expect(StringChecker.isUUID('6ba7b812-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
            expect(StringChecker.isUUID('6ba7b814-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
            expect(StringChecker.isUUID('6ba7b815-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
        });

        it('should return true for UUIDs with different cases', () => {
            expect(StringChecker.isUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
            expect(StringChecker.isUUID('123e4567-E89B-12d3-A456-426614174000')).toBe(true);
        });

        it('should return false for invalid UUIDs', () => {
            expect(StringChecker.isUUID('invalid-uuid')).toBe(false);
            expect(StringChecker.isUUID('123e4567e89b12d3a456426614174000')).toBe(false); // missing hyphens
            expect(StringChecker.isUUID('123e4567-e89b-12d3-a456')).toBe(false); // incomplete
            expect(StringChecker.isUUID('123e4567-e89b-12d3-a456-426614174000-extra')).toBe(false); // too long
            expect(StringChecker.isUUID('123g4567-e89b-12d3-a456-426614174000')).toBe(false); // invalid character
            expect(StringChecker.isUUID('123e4567-e89b-62d3-a456-426614174000')).toBe(false); // invalid version
            expect(StringChecker.isUUID('123e4567-e89b-12d3-z456-426614174000')).toBe(false); // invalid variant
            expect(StringChecker.isUUID('')).toBe(false);
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.isUUID(null as any)).toThrow('Value must be a string to check if it is a UUID.');
            expect(() => StringChecker.isUUID(123 as any)).toThrow('Value must be a string to check if it is a UUID.');
            expect(() => StringChecker.isUUID({} as any)).toThrow('Value must be a string to check if it is a UUID.');
        });
    });

    describe('minLength', () => {
        it('should return true when string meets minimum length', () => {
            expect(StringChecker.minLength('hello', 3)).toBe(true); // 5 >= 3
            expect(StringChecker.minLength('hello', 5)).toBe(true); // 5 >= 5
            expect(StringChecker.minLength('test', 0)).toBe(true); // 4 >= 0
            expect(StringChecker.minLength('', 0)).toBe(true); // 0 >= 0
            expect(StringChecker.minLength('a', 1)).toBe(true); // 1 >= 1
        });

        it('should return false when string does not meet minimum length', () => {
            expect(StringChecker.minLength('hi', 3)).toBe(false); // 2 < 3
            expect(StringChecker.minLength('', 1)).toBe(false); // 0 < 1
            expect(StringChecker.minLength('abc', 5)).toBe(false); // 3 < 5
            expect(StringChecker.minLength('x', 10)).toBe(false); // 1 < 10
        });

        it('should trim whitespace before checking length', () => {
            expect(StringChecker.minLength('  hello  ', 5)).toBe(true); // trimmed: "hello" = 5 >= 5
            expect(StringChecker.minLength('  hi  ', 5)).toBe(false); // trimmed: "hi" = 2 < 5
            expect(StringChecker.minLength('\t\ntest\r\n', 4)).toBe(true); // trimmed: "test" = 4 >= 4
            expect(StringChecker.minLength('   ', 0)).toBe(true); // trimmed: "" = 0 >= 0
            expect(StringChecker.minLength('   ', 1)).toBe(false); // trimmed: "" = 0 < 1
        });

        it('should handle special characters and unicode correctly', () => {
            // Regular characters with accents
            expect(StringChecker.minLength('café', 4)).toBe(true); // 4 >= 4
            expect(StringChecker.minLength('niño', 4)).toBe(true); // 4 >= 4
            
            // Emojis should count as single characters
            expect(StringChecker.minLength('🙂', 1)).toBe(true); // 1 emoji = 1 character >= 1
            expect(StringChecker.minLength('🙂🎉', 2)).toBe(true); // 2 emojis = 2 characters >= 2
            expect(StringChecker.minLength('🙂🎉😀', 3)).toBe(true); // 3 emojis = 3 characters >= 3
            expect(StringChecker.minLength('hello🙂', 6)).toBe(true); // 5 chars + 1 emoji = 6 >= 6
            
            // Complex Unicode characters
            expect(StringChecker.minLength('👨‍👩‍👧‍👦', 1)).toBe(true); // Family emoji (combined) should count as 1
            expect(StringChecker.minLength('🇪🇸', 1)).toBe(true); // Flag emoji should count as 1
            
            // Mixed content
            expect(StringChecker.minLength('hello@world.com', 10)).toBe(true); // 15 >= 10
            expect(StringChecker.minLength('123!@#', 6)).toBe(true); // 6 >= 6
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.minLength(null as any, 5)).toThrow('Value must be a string to check its minimum length.');
            expect(() => StringChecker.minLength(undefined as any, 5)).toThrow('Value must be a string to check its minimum length.');
            expect(() => StringChecker.minLength(123 as any, 5)).toThrow('Value must be a string to check its minimum length.');
            expect(() => StringChecker.minLength([] as any, 5)).toThrow('Value must be a string to check its minimum length.');
        });

        it('should throw when minLength is not a valid number', () => {
            expect(() => StringChecker.minLength('test', 'invalid' as any)).toThrow('Minimum length must be a non-negative number.');
            expect(() => StringChecker.minLength('test', null as any)).toThrow('Minimum length must be a non-negative number.');
            expect(() => StringChecker.minLength('test', undefined as any)).toThrow('Minimum length must be a non-negative number.');
            expect(() => StringChecker.minLength('test', -1)).toThrow('Minimum length must be a non-negative number.');
            expect(() => StringChecker.minLength('test', -5)).toThrow('Minimum length must be a non-negative number.');
            expect(() => StringChecker.minLength('test', NaN)).toThrow('Minimum length must be a non-negative number.');
        });
    });

    describe('maxLength', () => {
        it('should return true when string does not exceed maximum length', () => {
            expect(StringChecker.maxLength('hello', 10)).toBe(true); // 5 <= 10
            expect(StringChecker.maxLength('hello', 5)).toBe(true); // 5 <= 5
            expect(StringChecker.maxLength('', 0)).toBe(true); // 0 <= 0
            expect(StringChecker.maxLength('', 5)).toBe(true); // 0 <= 5
            expect(StringChecker.maxLength('test', 100)).toBe(true); // 4 <= 100
        });

        it('should return false when string exceeds maximum length', () => {
            expect(StringChecker.maxLength('hello world', 5)).toBe(false); // 11 > 5
            expect(StringChecker.maxLength('test', 3)).toBe(false); // 4 > 3
            expect(StringChecker.maxLength('a', 0)).toBe(false); // 1 > 0
            expect(StringChecker.maxLength('hello', 4)).toBe(false); // 5 > 4
        });

        it('should trim whitespace before checking length', () => {
            expect(StringChecker.maxLength('  hello  ', 5)).toBe(true); // trimmed: "hello" = 5 <= 5
            expect(StringChecker.maxLength('  hello world  ', 5)).toBe(false); // trimmed: "hello world" = 11 > 5
            expect(StringChecker.maxLength('\t\ntest\r\n', 4)).toBe(true); // trimmed: "test" = 4 <= 4
            expect(StringChecker.maxLength('   ', 0)).toBe(true); // trimmed: "" = 0 <= 0
            expect(StringChecker.maxLength('  a  ', 0)).toBe(false); // trimmed: "a" = 1 > 0
        });

        it('should handle special characters and unicode correctly', () => {
            // Regular characters with accents
            expect(StringChecker.maxLength('café', 4)).toBe(true); // 4 <= 4
            expect(StringChecker.maxLength('niño', 5)).toBe(true); // 4 <= 5
            
            // Emojis should count as single characters
            expect(StringChecker.maxLength('🙂', 1)).toBe(true); // 1 emoji = 1 character <= 1
            expect(StringChecker.maxLength('🙂🎉', 2)).toBe(true); // 2 emojis = 2 characters <= 2
            expect(StringChecker.maxLength('🙂🎉😀', 2)).toBe(false); // 3 emojis = 3 characters > 2
            expect(StringChecker.maxLength('hello🙂', 6)).toBe(true); // 5 chars + 1 emoji = 6 <= 6
            expect(StringChecker.maxLength('hello🙂', 5)).toBe(false); // 5 chars + 1 emoji = 6 > 5
            
            // Complex Unicode characters
            expect(StringChecker.maxLength('👨‍👩‍👧‍👦', 1)).toBe(true); // Family emoji (combined) should count as 1
            expect(StringChecker.maxLength('🇪🇸', 1)).toBe(true); // Flag emoji should count as 1
            expect(StringChecker.maxLength('🇪🇸🇺🇸', 2)).toBe(true); // Two flag emojis = 2 characters <= 2
            
            // Mixed content
            expect(StringChecker.maxLength('hello@world.com', 20)).toBe(true); // 15 <= 20
            expect(StringChecker.maxLength('123!@#', 6)).toBe(true); // 6 <= 6
            expect(StringChecker.maxLength('very long string here', 10)).toBe(false); // 21 > 10
        });

        it('should throw when value is not a string', () => {
            expect(() => StringChecker.maxLength(null as any, 5)).toThrow('Value must be a string to check its maximum length.');
            expect(() => StringChecker.maxLength(undefined as any, 5)).toThrow('Value must be a string to check its maximum length.');
            expect(() => StringChecker.maxLength(123 as any, 5)).toThrow('Value must be a string to check its maximum length.');
            expect(() => StringChecker.maxLength([] as any, 5)).toThrow('Value must be a string to check its maximum length.');
        });

        it('should throw when maxLength is not a valid number', () => {
            expect(() => StringChecker.maxLength('test', 'invalid' as any)).toThrow('Maximum length must be a non-negative number.');
            expect(() => StringChecker.maxLength('test', null as any)).toThrow('Maximum length must be a non-negative number.');
            expect(() => StringChecker.maxLength('test', undefined as any)).toThrow('Maximum length must be a non-negative number.');
            expect(() => StringChecker.maxLength('test', -1)).toThrow('Maximum length must be a non-negative number.');
            expect(() => StringChecker.maxLength('test', -10)).toThrow('Maximum length must be a non-negative number.');
            expect(() => StringChecker.maxLength('test', NaN)).toThrow('Maximum length must be a non-negative number.');
        });
    });

    describe('Integration tests', () => {
        it('should work with chained validations', () => {
            const email = 'user@example.com';
            expect(StringChecker.isEmail(email)).toBe(true);
            expect(StringChecker.contains(email, '@')).toBe(true);
            expect(StringChecker.endsWith(email, '.com')).toBe(true);
        });

        it('should work with complex regex patterns', () => {
            const customPattern = /^[A-Z]{2}\d{4}$/; // Two uppercase letters followed by 4 digits
            expect(StringChecker.regexMatch('AB1234', customPattern)).toBe(true);
            expect(StringChecker.regexMatch('ab1234', customPattern)).toBe(false);
            expect(StringChecker.regexMatch('ABC123', customPattern)).toBe(false);
        });

        it('should handle edge cases consistently', () => {
            const emptyString = '';
            expect(StringChecker.isEmpty(emptyString)).toBe(true);
            expect(StringChecker.contains('hello', emptyString)).toBe(true);
            expect(StringChecker.startsWith('hello', emptyString)).toBe(true);
            expect(StringChecker.endsWith('hello', emptyString)).toBe(true);
        });
    });
});
