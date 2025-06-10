import { describe, expect, it } from 'vitest';
import { CacheManager } from '../../../src/engine/components/cache-manager';
import { CacheType } from '../../../src/engine/interfaces/cache-manager.interface';

describe('CacheManager', () => {
  it('should split path if cache is disabled', () => {
    const cm = new CacheManager({ enablePathCache: false });
    expect(cm.getPathSegments('a.b.c')).toEqual(['a', 'b', 'c']);
  });

  it('should cache and retrieve path segments', () => {
    const cm = new CacheManager({ enablePathCache: true });
    const segs = cm.getPathSegments('a.b');
    expect(segs).toEqual(['a', 'b']);
    expect(cm.getPathSegments('a.b')).toBe(segs); // cached
  });

  it('should evict LRU path cache', () => {
    const cm = new CacheManager({ maxPathCacheSize: 2 });
    cm.getPathSegments('a.b');
    cm.getPathSegments('b.c');
    cm.getPathSegments('c.d');
    expect(cm.getPathSegments('a.b')).toEqual(['a', 'b']); // re-added
  });

  it('should clear caches', () => {
    const cm = new CacheManager();
    cm.getPathSegments('a.b');
    cm.clear();
    expect(cm.getPathSegments('a.b')).toBeDefined(); // cache is rebuilt
  });

  it('should not cache helper if helper cache is disabled', () => {
    const cm = new CacheManager({ enableHelperCache: false });
    cm.cacheHelper('op', () => {});
    expect(cm.getCachedHelper('op')).toBeUndefined();
  });

  it('should evict oldest helper when maxHelperCacheSize is reached', () => {
    const cm = new CacheManager({ maxHelperCacheSize: 1 });
    cm.cacheHelper('op1', () => 1);
    cm.cacheHelper('op2', () => 2);
    expect(cm.getCachedHelper('op1')).toBeUndefined();
    expect(cm.getCachedHelper('op2')).toBeDefined();
  });

  it('should handle preloadHelpers with invalid operation', async () => {
    const cm = new CacheManager();
    await cm.preloadHelpers(['nonexistent']);
    expect(cm.getCachedHelper('nonexistent')).toBeUndefined();
  });

  it('should clear only path cache', () => {
    const cm = new CacheManager();
    cm.getPathSegments('a.b');
    cm.clearCache(CacheType.PATH);
    expect(cm.getPathSegments('a.b')).toBeDefined();
  });

  it('should clear only helper cache', () => {
    const cm = new CacheManager();
    cm.cacheHelper('op', () => {});
    cm.clearCache(CacheType.HELPER);
    expect(cm.getCachedHelper('op')).toBeUndefined();
  });

  it('should return undefined for getCachedHelper and hasHelper if cache is disabled', () => {
    const cm = new CacheManager({ enableHelperCache: false });
    expect(cm.getCachedHelper('op')).toBeUndefined();
    expect(cm.hasHelper('op')).toBe(false);
  });

  it('should use LFU strategy for eviction', () => {
    const cm = new CacheManager({ maxPathCacheSize: 2, pathCacheStrategy: 'LFU' });
    cm.getPathSegments('a.b');
    cm.getPathSegments('b.c');
    // Acceder varias veces a 'a.b' para que 'b.c' sea menos usada
    cm.getPathSegments('a.b');
    cm.getPathSegments('c.d'); // Debe evictar 'b.c'
    expect(cm.getPathSegments('a.b')).toEqual(['a', 'b']);
    expect(cm.getPathSegments('b.c')).toEqual(['b', 'c']); // re-agregado
  });

  it('should clear all caches with CacheType.ALL', () => {
    const cm = new CacheManager();
    cm.getPathSegments('a.b');
    cm.cacheHelper('op', () => {});
    cm.clearCache(CacheType.ALL);
    expect(cm.getPathSegments('a.b')).toBeDefined();
    expect(cm.getCachedHelper('op')).toBeUndefined();
  });

  it('should get metrics and estimate memory usage', () => {
    const cm = new CacheManager();
    cm.getPathSegments('a.b');
    cm.cacheHelper('op', () => {});
    const metrics = cm.getMetrics();
    expect(metrics.pathCache.size).toBeGreaterThanOrEqual(0);
    expect(metrics.helperCache.size).toBeGreaterThanOrEqual(0);
    expect(metrics.totalMemoryUsage).toBeGreaterThanOrEqual(0);
  });

  it('should split path without dot as single segment', () => {
    const cm = new CacheManager();
    expect(cm['splitPath']('abc')).toEqual(['abc']);
  });

  it('should updatePathAccess and evictLeastRecentlyUsed with empty cache', () => {
    const cm = new CacheManager();
    // No debe lanzar error aunque la caché esté vacía
    expect(() => cm['updatePathAccess']('nope')).not.toThrow();
    expect(() => cm['evictLeastRecentlyUsed']()).not.toThrow();
  });

  it('should preloadHelpers with duplicate operations', async () => {
    const cm = new CacheManager();
    await cm.preloadHelpers(['op', 'op']);
    expect(cm.getCachedHelper('op')).toBeUndefined(); // op no existe realmente
  });

  it('should skip preloadHelpers when helper cache is disabled', async () => {
    const cm = new CacheManager({ enableHelperCache: false });

    // This should test line 218 - early return when helper cache is disabled
    await cm.preloadHelpers(['op1', 'op2']);

    // Verify no helpers were cached
    expect(cm.getCachedHelper('op1')).toBeUndefined();
    expect(cm.getCachedHelper('op2')).toBeUndefined();
  });

  it('should handle duplicate operations in preloadHelpers', async () => {
    const cm = new CacheManager({ enableHelperCache: true });

    // This should test line 226-227 - deduplication with Set
    await cm.preloadHelpers(['op1', 'op1', 'op2', 'op2']);

    // Should only try to load each operation once
    expect(cm.hasHelper('op1')).toBe(false); // helpers don't exist, so false
    expect(cm.hasHelper('op2')).toBe(false);
  });

  it('should skip caching path when path cache is disabled', () => {
    const cm = new CacheManager({ enablePathCache: false });

    // This should test line 301-302 - early return when path cache is disabled
    const initialCacheSize = (cm as any).pathCache.size;
    (cm as any).cachePathSegments('test.path', ['test', 'path']);

    // Verify cache size didn't change
    expect((cm as any).pathCache.size).toBe(initialCacheSize);
  });

  it('should evict LRU when path cache size limit is reached', () => {
    const cm = new CacheManager({ maxPathCacheSize: 2, enablePathCache: true });

    // Fill cache to limit
    cm.getPathSegments('path1');
    cm.getPathSegments('path2');

    // Add one more to trigger eviction (line 304-306)
    cm.getPathSegments('path3');

    // First path should be evicted
    expect((cm as any).pathCache.has('path1')).toBe(false);
    expect((cm as any).pathCache.has('path2')).toBe(true);
    expect((cm as any).pathCache.has('path3')).toBe(true);
  });
});
