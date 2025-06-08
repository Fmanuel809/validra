import { describe, expect, it } from 'vitest';
import { DataExtractor } from '../../../src/engine/components/data-extractor';

describe('DataExtractor', () => {
  it('extracts value for single segment', () => {
    const de = new DataExtractor();
    expect(de.getValue({ a: 1 }, ['a'])).toBe(1);
  });

  it('returns undefined for missing path', () => {
    const de = new DataExtractor();
    expect(de.getValue({}, ['b'])).toBeUndefined();
  });

  it('extracts nested value', () => {
    const de = new DataExtractor();
    expect(de.getValue({ a: { b: 2 } }, ['a', 'b'])).toBe(2);
  });

  it('extracts array index', () => {
    const de = new DataExtractor();
    expect(de.getValue({ arr: [10, 20] }, ['arr', '1'])).toBe(20);
  });

  it('returns undefined for out-of-bounds array', () => {
    const de = new DataExtractor();
    expect(de.getValue({ arr: [10] }, ['arr', '2'])).toBeUndefined();
  });

  it('does not evict anything if cache is empty and a new entry is added', () => {
    const de = new DataExtractor();
    // The cache is empty, the branch condition is evaluated but nothing is evicted
    de.getPathSegments('first');
    expect((de as any).pathCache.has('first')).toBe(true);
    // Size is 1, nothing evicted
    expect((de as any).pathCache.size).toBe(1);
  });

  it('evicts the least recently used (LRU) entry when exceeding max cache size', () => {
    const de = new DataExtractor();
    // Fill the cache to its maximum allowed size
    for (let i = 0; i < 50; i++) {
      de.getPathSegments(`key${i}`);
    }
    // The first key should be in the cache
    expect((de as any).pathCache.has('key0')).toBe(true);
    // Add a new entry, should evict the first (key0)
    de.getPathSegments('new_key');
    expect((de as any).pathCache.has('key0')).toBe(false);
    expect((de as any).pathCache.has('new_key')).toBe(true);
  });

  it('evicts only the first (oldest) entry, not others, when cache is full', () => {
    const de = new DataExtractor();
    // Fill the cache
    for (let i = 0; i < 50; i++) {
      de.getPathSegments(`k${i}`);
    }
    // Add a new entry to trigger eviction
    de.getPathSegments('extra');
    // Only the oldest should be evicted
    expect((de as any).pathCache.has('k0')).toBe(false);
    for (let i = 1; i < 50; i++) {
      expect((de as any).pathCache.has(`k${i}`)).toBe(true);
    }
    expect((de as any).pathCache.has('extra')).toBe(true);
  });

  it('evicts the correct entry after LRU usage pattern', () => {
    const de = new DataExtractor();
    // Fill the cache
    for (let i = 0; i < 50; i++) {
      de.getPathSegments(`item${i}`);
    }
    // Access the first entry to make it most recently used
    de.getPathSegments('item0');
    // Add a new entry, should evict the second oldest (item1)
    de.getPathSegments('overflow');
    expect((de as any).pathCache.has('item0')).toBe(true);
    expect((de as any).pathCache.has('item1')).toBe(false);
    expect((de as any).pathCache.has('overflow')).toBe(true);
  });

  it('splits dot notation path into multiple segments (covers path.includes ".") branch)', () => {
    const de = new DataExtractor();
    const segments = de.getPathSegments('user.profile.name');
    expect(segments).toEqual(['user', 'profile', 'name']);
    // Also check that the cache stores the correct segments
    expect((de as any).pathCache.get('user.profile.name')).toEqual(['user', 'profile', 'name']);
  });

  it('returns single segment array if path does not contain dot (covers else branch)', () => {
    const de = new DataExtractor();
    const segments = de.getPathSegments('username');
    expect(segments).toEqual(['username']);
    expect((de as any).pathCache.get('username')).toEqual(['username']);
  });

  it('returns the correct cache size using getCacheSize()', () => {
    const de = new DataExtractor();
    expect(de.getCacheSize()).toBe(0);
    de.getPathSegments('a');
    expect(de.getCacheSize()).toBe(1);
    de.getPathSegments('b');
    expect(de.getCacheSize()).toBe(2);
    de.clearCache();
    expect(de.getCacheSize()).toBe(0);
  });

  it('returns undefined if a segment in the path is null or undefined (covers null/undefined branch in getValue)', () => {
    const de = new DataExtractor();
    // Path leads to a null value
    expect(de.getValue({ a: null }, ['a', 'b'])).toBeUndefined();
    // Path leads to an undefined value
    expect(de.getValue({ a: undefined }, ['a', 'b'])).toBeUndefined();
    // Path leads to a missing nested property
    expect(de.getValue({ a: {} }, ['a', 'b'])).toBeUndefined();
  });
});
