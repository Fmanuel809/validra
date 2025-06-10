import { describe, expect, it } from 'vitest';
import { ErrorHandler } from '../../../src/engine/components/error-handler';

describe('ErrorHandler', () => {
  it('handles string error and context', () => {
    const handler = new ErrorHandler();
    expect(() => handler.handleError('fail', { field: 'x' })).toThrow();
  });

  it('handles Error object', () => {
    const handler = new ErrorHandler();
    expect(() => handler.handleError(new Error('fail'), {})).toThrow();
  });

  it('configures options', () => {
    const handler = new ErrorHandler();
    handler.configure({ maxErrors: 1 });
    expect(handler.getStatistics().totalErrors).toBeDefined();
  });

  it('clears errors', () => {
    const handler = new ErrorHandler();
    try {
      handler.handleError('fail', {});
    } catch {
      /* ignorar error */
    }
    handler.clearErrors();
    expect(handler.getStatistics().totalErrors).toBe(0);
  });

  it('adds and retrieves errors, filters by field, category, and severity', () => {
    const handler = new ErrorHandler();
    // Add multiple errors with different fields, categories, and severities
    handler.addError({
      message: 'Validation failed',
      code: 'VAL_001',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
      field: 'a',
    });
    handler.addError({
      message: 'Timeout',
      code: 'TMO_001',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
      field: 'b',
    });
    handler.addError({
      message: 'System error',
      code: 'SYS_001',
      severity: 'critical',
      category: 'system',
      timestamp: Date.now(),
      recoverable: false,
    });
    expect(handler.getErrors().length).toBe(3);
    expect(handler.getErrorsByField('a').length).toBe(1);
    expect(handler.getErrorsByCategory('timeout').length).toBe(1);
    expect(handler.getErrorsBySeverity('critical').length).toBe(1);
  });

  it('enforces maxErrors limit and adds limit error only once', () => {
    const handler = new ErrorHandler(undefined, { maxErrors: 2 });
    handler.addError({
      message: 'Error 1',
      code: 'E1',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });
    handler.addError({
      message: 'Error 2',
      code: 'E2',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });
    handler.addError({
      message: 'Error 3',
      code: 'E3',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });
    const errors = handler.getErrors();
    expect(errors.length).toBe(3);
    expect(errors[2]?.code).toBe('ERROR_LIMIT_EXCEEDED');
    // Should not add the limit error again
    handler.addError({
      message: 'Error 4',
      code: 'E4',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });
    expect(handler.getErrors().length).toBe(3);
  });

  it('throws on failFast with critical error', () => {
    const handler = new ErrorHandler(undefined, { failFast: true });
    expect(() =>
      handler.addError({
        message: 'Critical!',
        code: 'C',
        severity: 'critical',
        category: 'system',
        timestamp: Date.now(),
        recoverable: false,
      }),
    ).toThrow();
  });

  it('hasReachedLimit returns true when error limit is reached', () => {
    const handler = new ErrorHandler(undefined, { maxErrors: 1 });
    handler.addError({
      message: 'Error',
      code: 'E',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });
    expect(handler.hasReachedLimit()).toBe(true);
  });

  it('hasReachedLimit returns false when maxErrors is not set', () => {
    const handler = new ErrorHandler();

    // Add some errors
    handler.addError({
      message: 'Error 1',
      code: 'ERR_001',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });

    // This should test line 306 - when maxErrors is not set, return false
    expect(handler.hasReachedLimit()).toBe(false);
  });

  it('getStatistics returns correct stats for errors', () => {
    const handler = new ErrorHandler();
    handler.addError({
      message: 'Validation',
      code: 'V',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
    });
    handler.addError({
      message: 'System',
      code: 'S',
      severity: 'critical',
      category: 'system',
      timestamp: Date.now(),
      recoverable: false,
    });
    const stats = handler.getStatistics();
    expect(stats.totalErrors).toBe(2);
    expect(stats.errorsByCategory['validation']).toBe(1);
    expect(stats.errorsByCategory['system']).toBe(1);
    expect(stats.errorsBySeverity['high']).toBe(1);
    expect(stats.errorsBySeverity['critical']).toBe(1);
    expect(stats.fatalErrors).toBe(1);
  });

  it('formatErrorMessage formats with field, code, and severity', () => {
    const handler = new ErrorHandler();
    const error = {
      message: 'msg',
      code: 'C',
      severity: 'high' as const,
      category: 'validation' as const,
      timestamp: Date.now(),
      recoverable: true,
      field: 'f',
    };
    const msg = handler.formatErrorMessage(error);
    expect(msg).toContain('HIGH:');
    expect(msg).toContain('[C]');
    // eslint-disable-next-line quotes
    expect(msg).toContain("Field 'f':");
  });

  it('createValidationError handles string, Error, and context', () => {
    const handler = new ErrorHandler();
    // Use a valid Rule type (op: 'eq', field: string, params: { value: any })
    const rule = { op: 'eq', field: 'x', params: { value: 1 } } as import('../../../src/engine/rule').Rule;
    const err1 = handler['createValidationError']('fail', { field: 'x', rule });
    expect(err1.field).toBe('x');
    expect(err1.code).toContain('VAL_EQ');
    const err2 = handler['createValidationError'](new Error('fail'), { field: 'y' });
    expect(err2.field).toBe('y');
    expect(typeof err2.stack === 'string' || err2.stack === undefined).toBe(true);
  });

  it('determineSeverity, determineCategory, determineRecoverability, generateErrorCode', () => {
    const handler = new ErrorHandler();
    const rule = { op: 'eq', field: 'x', params: { value: 1 } } as import('../../../src/engine/rule').Rule;
    expect(handler['determineSeverity']('critical error')).toBe('critical');
    expect(handler['determineSeverity']('validation failed')).toBe('high');
    expect(handler['determineSeverity']('deprecated')).toBe('medium');
    expect(handler['determineSeverity']('info')).toBe('low');
    expect(handler['determineCategory']('validation', { rule })).toBe('validation');
    expect(handler['determineCategory']('timeout', {})).toBe('timeout');
    expect(handler['determineCategory']('memory', {})).toBe('memory');
    expect(handler['determineCategory']('network', {})).toBe('network');
    expect(handler['determineCategory']('config', {})).toBe('configuration');
    expect(handler['determineCategory']('other', {})).toBe('system');
    expect(handler['determineCategory']('compile error', {})).toBe('compilation');
    expect(handler['determineCategory']('parse failed', {})).toBe('compilation');
    expect(handler['determineRecoverability']('critical', 'system')).toBe(false);
    expect(handler['determineRecoverability']('medium', 'timeout')).toBe(true);
    expect(handler['determineRecoverability']('low', 'system')).toBe(false);
    expect(handler['determineRecoverability']('medium', 'system')).toBe(false);
    expect(handler['determineRecoverability']('low', 'validation')).toBe(true);
    expect(handler['determineRecoverability']('medium', 'timeout')).toBe(true);
    expect(handler['determineRecoverability']('high', 'validation')).toBe(true);
    expect(handler['determineRecoverability']('critical', 'timeout')).toBe(false);
    // New test for unknown category
    expect(handler['determineRecoverability']('low', 'custom' as any)).toBe(true);
    expect(handler['determineRecoverability']('medium', 'custom' as any)).toBe(true);
    expect(handler['determineRecoverability']('high', 'custom' as any)).toBe(false);
    expect(handler['determineRecoverability']('critical', 'custom' as any)).toBe(false);
    expect(handler['generateErrorCode']('validation', rule)).toMatch(/^VAL_EQ_\d{4}$/);
  });

  it('formatForResult returns valid result with only field errors', () => {
    const handler = new ErrorHandler();
    handler.addError({
      message: 'Field error',
      code: 'F',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
      field: 'foo',
    });
    const result = handler.formatForResult({ foo: 1 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.message).toBeUndefined();
    expect(result.errors).toHaveProperty('foo');
  });

  it('formatForResult returns valid result with only general errors', () => {
    const handler = new ErrorHandler();
    handler.addError({
      message: 'General error',
      code: 'G',
      severity: 'high',
      category: 'system',
      timestamp: Date.now(),
      recoverable: false,
    });
    const result = handler.formatForResult({ foo: 2 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeUndefined();
    expect(result.message).toContain('General error');
  });

  it('formatForResult returns valid result with both field and general errors', () => {
    const handler = new ErrorHandler();
    handler.addError({
      message: 'Field error',
      code: 'F',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
      field: 'bar',
    });
    handler.addError({
      message: 'General error',
      code: 'G',
      severity: 'high',
      category: 'system',
      timestamp: Date.now(),
      recoverable: false,
    });
    const result = handler.formatForResult({ foo: 3 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('bar');
    expect(result.message).toContain('General error');
  });

  it('formatForResult returns valid result when no errors', () => {
    const handler = new ErrorHandler();
    const result = handler.formatForResult({ foo: 4 });
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual({ foo: 4 });
    expect(result.errors).toBeUndefined();
    expect(result.message).toBeUndefined();
  });

  it('attemptRecovery returns 0 if recovery is disabled', async () => {
    const handler = new ErrorHandler(undefined, { enableRecovery: false });
    handler.addError({
      message: 'Timeout',
      code: 'T',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
    });
    const count = await handler.attemptRecovery();
    expect(count).toBe(0);
  });

  it('attemptRecovery recovers errors with strategy', async () => {
    const handler = new ErrorHandler(undefined, { enableRecovery: true });
    let recovered = false;
    handler.addError({
      message: 'Timeout',
      code: 'T',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
    });
    handler.registerRecoveryStrategy('timeout', {
      canRecover: () => true,
      recover: _error => {
        recovered = true;
        return true;
      },
      timeout: 100,
    });
    const count = await handler.attemptRecovery();
    expect(count).toBe(1);
    expect(recovered).toBe(true);
  });

  it('attemptRecovery skips unrecoverable and already recovered errors', async () => {
    const handler = new ErrorHandler(undefined, { enableRecovery: true });
    handler.addError({
      message: 'Not recoverable',
      code: 'N',
      severity: 'high',
      category: 'system',
      timestamp: Date.now(),
      recoverable: false,
    });
    handler.addError({
      message: 'Already recovered',
      code: 'A',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
      context: { recovered: true },
    });
    handler.registerRecoveryStrategy('timeout', {
      canRecover: () => true,
      recover: _error => true,
      timeout: 100,
    });
    const count = await handler.attemptRecovery();
    expect(count).toBe(0);
  });

  it('attemptRecovery handles timeout and recovery errors', async () => {
    const handler = new ErrorHandler(undefined, { enableRecovery: true });
    handler.addError({
      message: 'Timeout',
      code: 'T',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
    });
    // Simulate a recovery that never returns by using a recover function that returns false (simulate failure quickly)
    handler.registerRecoveryStrategy('timeout', {
      canRecover: () => true,
      recover: _error => false,
      timeout: 10,
    });
    const count = await handler.attemptRecovery();
    expect(count).toBe(0);

    // Now test recovery throws
    handler.clearErrors();
    handler.addError({
      message: 'Timeout',
      code: 'T',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
    });
    handler.registerRecoveryStrategy('timeout', {
      canRecover: () => true,
      recover(_error) {
        throw new Error('fail');
      },
      timeout: 100,
    });
    const count2 = await handler.attemptRecovery();
    expect(count2).toBe(0);
  });

  it('handleError returns validationError when logErrors is false', () => {
    const handler = new ErrorHandler(undefined, { logErrors: false });
    // No debe lanzar, debe retornar el error
    const result = handler.handleError('fail', { field: 'x' });
    expect(result).toBeDefined();
    expect(result.field).toBe('x');
    expect(result.code).toContain('SYS_GEN');
  });

  it('createValidationError covers all ternary branches', () => {
    const handler = new ErrorHandler();
    // code branch: code presente y ausente
    const rule = { op: 'eq', field: 'x', params: { value: 1 } } as import('../../../src/engine/rule').Rule;
    const errWithRule = handler['createValidationError']('fail', { field: 'x', rule });
    expect(errWithRule.code).toContain('VAL_EQ');
    // field branch: field presente y ausente
    const errNoField = handler['createValidationError']('fail', { rule });
    expect(errNoField.field).toBeUndefined();
    // rule branch: rule presente y ausente
    expect(errWithRule.rule).toBe(rule);
    const errNoRule = handler['createValidationError']('fail', { field: 'x' });
    expect(errNoRule.rule).toBeUndefined();
    // metadata/context branch: metadata presente y ausente
    const errWithMeta = handler['createValidationError']('fail', { field: 'x', metadata: { foo: 1 } });
    expect(errWithMeta.context).toEqual({ foo: 1 });
    const errNoMeta = handler['createValidationError']('fail', { field: 'x' });
    expect(errNoMeta.context).toBeUndefined();
    // stack branch: string y Error
    const errStack = handler['createValidationError'](new Error('fail'), { field: 'x' });
    expect(typeof errStack.stack === 'string' || errStack.stack === undefined).toBe(true);
  });

  it('getStatistics counts recoveredErrors when error is recoverable and context.recovered is true', () => {
    const handler = new ErrorHandler();
    handler.addError({
      message: 'Recovered',
      code: 'R',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
      context: { recovered: true },
    });
    const stats = handler.getStatistics();
    expect(stats.recoveredErrors).toBe(1);
  });

  it('attemptRecovery skips errors when no strategy is registered for the category', async () => {
    const handler = new ErrorHandler(undefined, { enableRecovery: true });
    handler.addError({
      message: 'Timeout',
      code: 'T',
      severity: 'medium',
      category: 'timeout',
      timestamp: Date.now(),
      recoverable: true,
    });
    // No strategy registered for 'timeout'
    const count = await handler.attemptRecovery();
    expect(count).toBe(0);
  });

  it('should handle errors with missing code property', () => {
    const handler = new ErrorHandler();

    // Add error without code to test line 377 - default to 'UNKNOWN_ERROR'
    handler.addError({
      message: 'Error without code',
      severity: 'high',
      category: 'validation',
      timestamp: Date.now(),
      recoverable: true,
      field: 'testField',
      // code is intentionally omitted
    } as any);

    const result = handler.formatForResult({ testField: 'value' });
    expect(result.errors).toBeDefined();
    expect(result.errors!.testField).toBeDefined();
    expect(result.errors!.testField?.[0]).toEqual({
      // eslint-disable-next-line quotes
      message: "HIGH: Field 'testField': Error without code",
      code: 'UNKNOWN_ERROR', // Should default to this
    });
  });
});
