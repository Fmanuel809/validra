/**
 * @fileoverview Tests for utility functions - focusing on edge cases and fallback scenarios
 * 
 * This test suite specifically targets the fallback behavior of utility functions
 * when modern browser APIs are not available, ensuring backward compatibility
 * and robust operation in constrained environments.
 * 
 * @module UtilityFunctionsTest
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { countGraphemes } from '../../src/utils/utility-functions';

describe('countGraphemes - Fallback Edge Case', () => {
    let originalIntl: typeof Intl;
    
    beforeEach(() => {
        // Store original Intl for restoration
        originalIntl = global.Intl;
    });
    
    afterEach(() => {
        // Restore original Intl
        global.Intl = originalIntl;
    });

    describe('Fallback Scenario - No Intl.Segmenter Support', () => {
        beforeEach(() => {
            // Mock scenario where Intl.Segmenter is not available
            global.Intl = {
                ...originalIntl,
                Segmenter: undefined as any
            };
        });

        it('should fallback to Array.from for basic string counting', () => {
            const result = countGraphemes('hello');
            expect(result).toBe(5);
        });

        it('should handle empty string in fallback mode', () => {
            const result = countGraphemes('');
            expect(result).toBe(0);
        });

        it('should handle single character in fallback mode', () => {
            const result = countGraphemes('a');
            expect(result).toBe(1);
        });

        it('should handle basic Unicode characters in fallback mode', () => {
            const result = countGraphemes('café');
            expect(result).toBe(4); // c-a-f-é
        });

        it('should handle emojis in fallback mode (basic support)', () => {
            // In fallback mode, simple emojis should be counted correctly
            const result = countGraphemes('😀');
            expect(result).toBe(1);
        });

        it('should handle mixed content in fallback mode', () => {
            const result = countGraphemes('Hello 👋 World!');
            expect(result).toBe(14); // Basic counting with Array.from (emoji handled correctly)
        });

        it('should handle whitespace and special chars in fallback mode', () => {
            const result = countGraphemes('  \t\n  ');
            expect(result).toBe(6);
        });

        it('should handle Unicode combining characters (limited support)', () => {
            // In fallback mode, combining characters might not be handled perfectly
            // but Array.from provides better support than .length
            const result = countGraphemes('e̊'); // e + combining ring above
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(2); // Could be 1 or 2 depending on support
        });
    });

    describe('No Intl Object Available (Extreme Edge Case)', () => {
        beforeEach(() => {
            // Simulate environment where Intl is completely undefined
            global.Intl = undefined as any;
        });

        it('should still work when Intl is completely undefined', () => {
            const result = countGraphemes('test');
            expect(result).toBe(4);
        });

        it('should handle Unicode in extreme fallback', () => {
            const result = countGraphemes('café');
            expect(result).toBe(4);
        });

        it('should handle empty string in extreme fallback', () => {
            const result = countGraphemes('');
            expect(result).toBe(0);
        });
    });

    describe('Performance Edge Cases in Fallback', () => {
        beforeEach(() => {
            // Disable Intl.Segmenter for performance testing
            global.Intl = {
                ...originalIntl,
                Segmenter: undefined as any
            };
        });

        it('should handle very long strings efficiently in fallback mode', () => {
            const longString = 'a'.repeat(10000);
            const startTime = performance.now();
            const result = countGraphemes(longString);
            const endTime = performance.now();
            
            expect(result).toBe(10000);
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });

        it('should handle strings with repeated Unicode chars in fallback', () => {
            const unicodeString = '🎉'.repeat(1000);
            const result = countGraphemes(unicodeString);
            expect(result).toBe(1000);
        });
    });

    describe('Error Resilience in Fallback', () => {
        beforeEach(() => {
            global.Intl = {
                ...originalIntl,
                Segmenter: undefined as any
            };
        });

        it('should handle null-like inputs gracefully', () => {
            expect(() => countGraphemes('')).not.toThrow();
        });

        it('should handle strings with null characters', () => {
            const result = countGraphemes('a\0b\0c');
            expect(result).toBe(5); // a, null, b, null, c
        });
    });
});

describe('countGraphemes - Normal Operation (for comparison)', () => {
    // Only test if Intl.Segmenter is actually available in test environment
    const hasSegmenterSupport = typeof Intl !== 'undefined' && Intl.Segmenter;
    
    describe.skipIf(!hasSegmenterSupport)('With Intl.Segmenter Support', () => {
        it('should count basic characters correctly', () => {
            const result = countGraphemes('hello');
            expect(result).toBe(5);
        });

        it('should handle complex emojis correctly', () => {
            // Complex emoji that might be multiple code points
            const result = countGraphemes('👨‍👩‍👧‍👦'); // Family emoji
            expect(result).toBe(1); // Should be counted as single grapheme cluster
        });

        it('should handle combining characters correctly', () => {
            const result = countGraphemes('e̊'); // e + combining ring above
            expect(result).toBe(1); // Should be counted as single grapheme
        });
    });
});
