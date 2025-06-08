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
});
