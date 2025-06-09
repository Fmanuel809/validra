/**
 * @fileoverview Unicode-aware string manipulation and analysis utilities for international text processing
 * @module UtilityFunctions
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Counts the number of grapheme clusters (visible characters) in a string with full Unicode support.
 *
 * This function provides accurate character counting that properly handles complex Unicode
 * sequences, combining characters, emoji combinations, and multi-byte characters. Essential
 * for validation operations that need precise length calculations for international text,
 * emojis, and complex writing systems.
 *
 * Key features:
 * - **Unicode Support**: Handles all Unicode grapheme clusters correctly
 * - **Emoji Compatibility**: Properly counts complex emoji sequences as single characters
 * - **Combining Characters**: Correctly handles diacritics and combining marks
 * - **International Text**: Supports all writing systems and scripts
 * - **Modern Browser Support**: Uses Intl.Segmenter when available for optimal accuracy
 * - **Fallback Compatibility**: Graceful degradation for older environments
 *
 * Use cases:
 * - **Form Validation**: Accurate character limits for text inputs
 * - **Content Analysis**: Precise length validation for international content
 * - **Display Layout**: Character-based layout calculations for UI components
 * - **Data Processing**: Text analysis and manipulation with Unicode awareness
 * - **Accessibility**: Screen reader and internationalization support
 *
 * @public
 * @param {string} str - The input string to analyze for grapheme cluster count
 * @returns {number} The precise number of visible characters (grapheme clusters) in the string
 *
 * @example
 * ```typescript
 * // Simple ASCII text counting
 * countGraphemes("hello");           // Returns: 5
 * countGraphemes("world!");          // Returns: 6
 * ```
 *
 * @example
 * ```typescript
 * // Unicode and emoji character counting
 * countGraphemes("🚀");              // Returns: 1 (single emoji)
 * countGraphemes("👨‍👩‍👧‍👦");          // Returns: 1 (family emoji sequence)
 * countGraphemes("🇺🇸");              // Returns: 1 (flag emoji)
 * countGraphemes("Hello 🌍!");       // Returns: 9 (text + emoji + punctuation)
 * ```
 *
 * @example
 * ```typescript
 * // Combining characters and diacritics
 * countGraphemes("é");               // Returns: 1 (composed character)
 * countGraphemes("e\u0301");         // Returns: 1 (e + combining acute accent)
 * countGraphemes("naïve");           // Returns: 5 (including diaeresis)
 * ```
 *
 * @example
 * ```typescript
 * // International text support
 * countGraphemes("你好");            // Returns: 2 (Chinese characters)
 * countGraphemes("مرحبا");           // Returns: 5 (Arabic characters)
 * countGraphemes("हैलो");            // Returns: 4 (Hindi characters)
 * ```
 *
 * @example
 * ```typescript
 * // Form validation usage
 * function validateTextLength(input: string, maxLength: number): boolean {
 *   const actualLength = countGraphemes(input);
 *   return actualLength <= maxLength;
 * }
 *
 * const isValid = validateTextLength("Hello 🌍!", 10); // true (9 ≤ 10)
 * const tooLong = validateTextLength("👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦", 2);  // false (3 > 2)
 * ```
 *
 * @since 1.0.0
 */
export function countGraphemes(str: string): number {
  // Use Intl.Segmenter if available (modern browsers/Node.js)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(str)).length;
  }

  // Fallback to Array.from for basic Unicode support
  return Array.from(str).length;
}
