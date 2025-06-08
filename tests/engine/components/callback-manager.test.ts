import { describe, expect, it, vi } from 'vitest';
import { CallbackManager } from '../../../src/engine/components/callback-manager';

describe('CallbackManager', () => {
  it('registers and triggers callbacks', () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    const id = manager.registerCallbacks({ onComplete: cb });
    manager['registrations'].delete(id); // simula removeCallbacks
    manager.triggerComplete({ isValid: true, data: {} });
    expect(cb).not.toHaveBeenCalled();
    expect(typeof id).toBe('string');
  });

  it('triggers complete callback', () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onComplete: cb });
    manager.triggerComplete({ isValid: true, data: {} });
    expect(cb).toHaveBeenCalled();
  });

  it('debounces progress callback', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onProgress: cb }, { debounceMs: 10 });
    manager.triggerProgress({ completed: 1, total: 2, percentage: 50, elapsedTime: 10 });
    manager.triggerProgress({ completed: 2, total: 2, percentage: 100, elapsedTime: 20 });
    await new Promise(r => setTimeout(r, 20));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should handle registering empty or null callbacks', async () => {
    const manager = new CallbackManager();
    const id1 = manager.registerCallbacks(undefined as any);
    const id2 = manager.registerCallbacks({});
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
    // No error al trigger
    await expect(manager.triggerComplete({ isValid: true, data: {} })).resolves.toBeUndefined();
    await expect(
      manager.triggerProgress({ completed: 1, total: 1, percentage: 100, elapsedTime: 1 }),
    ).resolves.toBeUndefined();
    await expect(
      manager.triggerError(new Error('fail'), { totalRules: 0, processedRules: 0, timestamp: Date.now() }),
    ).resolves.toBeUndefined();
  });

  it('should trigger error callback', async () => {
    const onError = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onError });
    const ctx = { totalRules: 1, processedRules: 0, timestamp: Date.now() };
    await manager.triggerError(new Error('fail'), ctx);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), ctx);
  });

  it('should allow unregistering callbacks and not trigger after removal', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    const id = manager.registerCallbacks({ onComplete: cb });
    manager.unregisterCallbacks(id);
    await manager.triggerComplete({ isValid: true, data: {} });
    expect(cb).not.toHaveBeenCalled();
  });

  it('should trigger progress callback without debounce', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onProgress: cb });
    await manager.triggerProgress({ completed: 1, total: 2, percentage: 50, elapsedTime: 10 });
    await manager.triggerProgress({ completed: 2, total: 2, percentage: 100, elapsedTime: 20 });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple registrations and removals', async () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const manager = new CallbackManager();
    const id1 = manager.registerCallbacks({ onComplete: cb1 });
    const id2 = manager.registerCallbacks({ onComplete: cb2 });
    await manager.triggerComplete({ isValid: true, data: {} });
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
    manager.unregisterCallbacks(id1);
    manager.unregisterCallbacks(id2);
    // No error al trigger después de eliminar
    await expect(manager.triggerComplete({ isValid: true, data: {} })).resolves.toBeUndefined();
  });

  it('should clear all callbacks and not trigger any', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onComplete: cb });
    manager.clearCallbacks();
    await manager.triggerComplete({ isValid: true, data: {} });
    expect(cb).not.toHaveBeenCalled();
    expect(manager.getActiveCallbackCount()).toBe(0);
  });

  it('should trigger onRuleStart callback', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onRuleStart: cb });
    await manager.triggerRuleStart({ op: 'eq', field: 'x' } as any, 123, ['x']);
    expect(cb).toHaveBeenCalledWith({ op: 'eq', field: 'x' }, 123, ['x']);
  });

  it('should trigger onRuleSuccess callback', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onRuleSuccess: cb });
    await manager.triggerRuleSuccess({ op: 'eq', field: 'x' } as any, 123, ['x']);
    expect(cb).toHaveBeenCalledWith({ op: 'eq', field: 'x' }, 123, ['x']);
  });

  it('should trigger onRuleFailure callback', async () => {
    const cb = vi.fn();
    const manager = new CallbackManager();
    manager.registerCallbacks({ onRuleFailure: cb });
    await manager.triggerRuleFailure({ op: 'eq', field: 'x' } as any, 123, ['x'], 'fail');
    expect(cb).toHaveBeenCalledWith({ op: 'eq', field: 'x' }, 123, ['x'], 'fail');
  });

  it('should clear debounce timer on unregisterCallbacks (branch coverage)', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const manager = new CallbackManager();
    const id = manager.registerCallbacks({ onProgress: cb }, { debounceMs: 50 });
    manager.triggerProgress({ completed: 1, total: 2, percentage: 50, elapsedTime: 10 });
    // Avanza el ciclo de eventos para que el timer esté programado
    await Promise.resolve();
    manager.unregisterCallbacks(id);
    // Avanza todos los timers
    vi.runAllTimers();
    expect(cb).not.toHaveBeenCalled();
    expect((manager as any).debounceTimers.has(id)).toBe(false);
    vi.useRealTimers();
  });
});
