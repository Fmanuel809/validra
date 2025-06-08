/**
 * Counts the number of grapheme clusters (visible characters) in a string.
 * This properly handles complex Unicode sequences like combined emojis.
 *
 * @param {string} str - The string to count characters in
 * @returns {number} The number of grapheme clusters
 */
export function countGraphemes(str: string): number {
  // Use Intl.Segmenter if available (modern browsers/Node.js)
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(str)).length;
  }

  // Fallback to Array.from for basic Unicode support
  return Array.from(str).length;
}
