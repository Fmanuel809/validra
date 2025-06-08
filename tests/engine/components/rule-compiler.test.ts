import { describe, expect, it, vi } from 'vitest';
import * as helpersActionsModule from '../../../src/dsl';
import { RuleCompiler } from '../../../src/engine/components/rule-compiler';
import type { Rule } from '../../../src/engine/rule';

describe('RuleCompiler', () => {
  const validRule: Rule = { op: 'eq', field: 'x', params: { value: 1 } } as any;

  it('compiles valid rules', () => {
    const compiler = new RuleCompiler();
    const rules = [validRule];
    const compiled = compiler.compile(rules);
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('warns and skips undefined rules', () => {
    const compiler = new RuleCompiler();
    const rules = [undefined, validRule];
    const compiled = compiler.compile(rules as any);
    expect(compiled.length).toBeGreaterThan(0);
  });

  it('handles error in compileRule', () => {
    const compiler = new RuleCompiler();
    const badRule = { op: undefined, field: 'x' } as any;
    expect(() => compiler.compile([badRule])).toThrow();
  });

  it('logs error and returns undefined if getHelper throws', () => {
    const loggerMock = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
    const compiler = new RuleCompiler(loggerMock as any);
    const spy = vi.spyOn(helpersActionsModule.helpersActions, 'getHelperResolverSchema').mockImplementation(() => {
      throw new Error('fail');
    });
    const result = compiler.getHelper('failop');
    expect(result).toBeUndefined();
    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to resolve helper for operation'),
      expect.objectContaining({ error: expect.any(Error) }),
    );
    spy.mockRestore();
  });

  it('compileRules calls compile and returns compiled rules', () => {
    const loggerMock = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
    const compiler = new RuleCompiler(loggerMock as any);
    const compiled = compiler.compileRules([validRule]);
    expect(Array.isArray(compiled)).toBe(true);
    expect(compiler.getMetrics().compiledRulesCount).toBeGreaterThan(0);
  });

  it('throws if helper is not found for operation', () => {
    const compiler = new RuleCompiler();
    // Mock getHelper to return undefined
    compiler.getHelper = () => undefined;
    expect(() => (compiler as any).compileRule(validRule)).toThrow('Helper not found for operation: eq');
  });

  it('validateRuleStructure returns false for non-object', () => {
    const compiler = new RuleCompiler();
    expect((compiler as any).validateRuleStructure(undefined)).toBe(false);
    expect((compiler as any).validateRuleStructure(null)).toBe(false);
    expect((compiler as any).validateRuleStructure(123)).toBe(false);
  });

  it('validateRuleStructure returns false for invalid field', () => {
    const compiler = new RuleCompiler();
    expect((compiler as any).validateRuleStructure({ op: 'eq', field: '' })).toBe(false);
    expect((compiler as any).validateRuleStructure({ op: 'eq', field: 123 })).toBe(false);
  });

  it('returns helper from cache and increments cacheHits', () => {
    const loggerMock = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
    const compiler = new RuleCompiler(loggerMock as any);
    // Primer acceso: miss, pobla el cache
    const helper1 = compiler.getHelper('eq');
    // Segundo acceso: hit
    const helper2 = compiler.getHelper('eq');
    expect(helper2).toBe(helper1);
    expect(compiler.getMetrics().cacheHits).toBe(1);
  });

  it('clearCache empties helperCache and resets counters', () => {
    const loggerMock = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
    const compiler = new RuleCompiler(loggerMock as any);
    // Poblar el cache y modificar los contadores
    compiler.getHelper('eq');
    compiler.getHelper('eq'); // cache hit
    expect(compiler.getMetrics().cacheHits).toBe(1);
    expect(compiler.getMetrics().cacheMisses).toBe(1);
    // Limpiar cache
    compiler.clearCache();
    expect(compiler.getMetrics().cacheHits).toBe(0);
    expect(compiler.getMetrics().cacheMisses).toBe(0);
    // El cache debe estar vacío
    expect((compiler as any).helperCache.size).toBe(0);
  });
});
