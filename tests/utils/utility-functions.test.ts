import { describe, expect, it } from 'vitest';
import { countGraphemes } from '../../src/utils/utility-functions';

describe('countGraphemes', () => {
  it('counts ASCII characters', () => {
    expect(countGraphemes('abc')).toBe(3);
    expect(countGraphemes('')).toBe(0);
  });

  it('counts Unicode characters (emojis, accents)', () => {
    expect(countGraphemes('👍👍')).toBe(2);
    expect(countGraphemes('á')).toBe(1); // a +  ́ (combining)
    expect(countGraphemes('👨‍👩‍👧‍👦')).toBe(1); // family emoji (single grapheme)
  });

  it('counts mixed text', () => {
    expect(countGraphemes('a👍b')).toBe(3);
    expect(countGraphemes('áb́')).toBe(2);
  });

  it('handles fallback if Intl.Segmenter is unavailable', () => {
    const orig = globalThis.Intl;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    globalThis.Intl = undefined;
    expect(countGraphemes('abc')).toBe(3);
    globalThis.Intl = orig;
  });
});
