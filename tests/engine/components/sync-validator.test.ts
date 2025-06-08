import * as helpersActionsModule from '@/dsl';
import { describe, expect, it, vi } from 'vitest';
import { SyncValidator } from '../../../src/engine/components/sync-validator';

describe('SyncValidator', () => {
  const mockDataExtractor = {
    getValue: (data: any, path: string[]) => (data && path[0] ? data[path[0]] : undefined),
    getPathSegments: (field: string) => [field],
  };
  const rule = { op: 'eq', field: 'x', params: { value: 1 } } as any;

  it('applies rule and returns true', () => {
    const validator = new SyncValidator({}, mockDataExtractor as any);
    const result = validator.applyRule(rule as any, 1, [1]);
    expect(typeof result).toBe('boolean');
  });

  it('throws error for unknown operation (mocked helper)', () => {
    const validator = new SyncValidator({}, mockDataExtractor as any);
    const spy = vi
      .spyOn(helpersActionsModule.helpersActions, 'getHelperResolverSchema')
      .mockReturnValueOnce(undefined as any);
    const badRule = { ...rule, op: 'unknownop' };
    expect(() => validator.applyRule(badRule as any, { x: 1 }, [])).toThrow('Unknown operation: unknownop');
    spy.mockRestore();
  });

  it('logs debug message when debug is enabled and rule fails', () => {
    const loggerSpy = { debug: vi.fn() };
    const validator = new SyncValidator({ debug: true }, mockDataExtractor as any);
    // @ts-expect-error: override logger for test
    validator.logger = loggerSpy;
    const badRule = { ...rule, op: 'nonexistent' };
    try {
      validator.applyRule(badRule as any, { x: 1 }, []);
    } catch {
      // ignore
    }
    expect(loggerSpy.debug).toHaveBeenCalledWith(
      expect.stringContaining('Rule application failed: Error in operation'),
    );
  });

  it('logs debug message when stopping early (failFast)', () => {
    const loggerSpy = { debug: vi.fn(), warn: vi.fn() };
    const validator = new SyncValidator({ debug: true }, mockDataExtractor as any);
    // @ts-expect-error: override logger for test
    validator.logger = loggerSpy;
    const alwaysFailRule = { ...rule, op: 'eq', negative: true };
    validator.validate({ x: 1 }, [alwaysFailRule], { failFast: true });
    expect(loggerSpy.debug).toHaveBeenCalledWith(
      'Stopping validation early',
      expect.objectContaining({ reason: 'failFast' }),
    );
  });

  it('logs warn when error in rule and debug enabled', () => {
    const loggerSpy = { debug: vi.fn(), warn: vi.fn() };
    const validator = new SyncValidator({ debug: true }, mockDataExtractor as any);
    // @ts-expect-error: override logger for test
    validator.logger = loggerSpy;
    const badRule = { ...rule, op: 'nonexistent' };
    try {
      validator.validate({ x: 1 }, [badRule]);
    } catch {
      // ignore
    }
    expect(loggerSpy.warn).toHaveBeenCalledWith(
      expect.stringContaining('Error applying rule nonexistent on field x'),
      expect.objectContaining({ rule: badRule }),
    );
  });

  it('throws if throwOnUnknownField and !allowPartialValidation', () => {
    const validator = new SyncValidator({ throwOnUnknownField: true }, mockDataExtractor as any);
    const badRule = { ...rule, op: 'nonexistent' };
    expect(() => validator.validate({ x: 1 }, [badRule])).toThrow('Rule validation failed for field "x"');
  });

  it('throws if throwOnUnknownField is true and allowPartialValidation is false', () => {
    const validator = new SyncValidator(
      { throwOnUnknownField: true, allowPartialValidation: false },
      mockDataExtractor as any,
    );
    const badRule = { ...rule, op: 'nonexistent' };
    expect(() => validator.validate({ x: 1 }, [badRule])).toThrow('Rule validation failed for field "x"');
  });

  it('addError initializes errors if undefined', () => {
    const validator = new SyncValidator({}, mockDataExtractor as any);
    const result: any = { isValid: false, data: { x: 1 } };
    validator['addError'](result, rule, 'custom');
    expect(result.errors).toBeDefined();
    expect(result.errors.x[0].message).toBe('custom');
  });

  it('stops validation early when maxErrors is reached', () => {
    const loggerSpy = { debug: vi.fn(), warn: vi.fn() };
    const validator = new SyncValidator({ debug: true }, mockDataExtractor as any);
    // @ts-expect-error: override logger for test
    validator.logger = loggerSpy;
    const alwaysFailRule = { ...rule, op: 'eq', negative: true };
    const result = validator.validate({ x: 1 }, [alwaysFailRule, alwaysFailRule, alwaysFailRule], { maxErrors: 1 });
    expect(result.isValid).toBe(false);
    expect(loggerSpy.debug).toHaveBeenCalledWith(
      'Stopping validation early',
      expect.objectContaining({ reason: 'maxErrors' }),
    );
  });
});
