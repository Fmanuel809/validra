/**
 * Common ValidationCallbacks fixtures for integration tests.
 * Provides reusable ValidationCallbacks configurations for different testing scenarios.
 *
 * @category Test Fixtures
 */

import { ValidationCallbacks, ValidraResult } from '@/engine/interfaces';
import { expect, vi } from 'vitest';

/**
 * Basic success ValidationCallbacks for testing
 */
export const createSuccessCallbacks = (_name: string = 'successCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn().mockImplementation(data => {
    console.log('Validation started for:', data);
  }),
  onComplete: vi.fn().mockImplementation((result: ValidraResult) => {
    console.log(`Validation completed: ${result.isValid}`);
  }),
});

/**
 * Error-throwing ValidationCallbacks for testing
 */
export const createErrorCallbacks = (_name: string = 'errorCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn(),
  onComplete: vi.fn().mockImplementation(() => {
    throw new Error('Callback error');
  }),
});

/**
 * Async ValidationCallbacks for testing asynchronous operations
 */
export const createAsyncCallbacks = (_name: string = 'asyncCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn().mockImplementation(async data => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('Async start completed for:', data);
  }),
  onComplete: vi.fn().mockImplementation(async (result: ValidraResult) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('Async complete finished:', result.isValid);
    return result;
  }),
});

/**
 * ValidationCallbacks that modifies result data
 */
export const createModifyingCallbacks = (_name: string = 'modifyingCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn().mockImplementation(data => {
    if (data && typeof data === 'object') {
      (data as any).startTimestamp = Date.now();
    }
  }),
  onComplete: vi.fn().mockImplementation((result: ValidraResult) => {
    if (result.data && typeof result.data === 'object') {
      (result.data as any).modified = true;
      (result.data as any).endTimestamp = Date.now();
    }
    return result;
  }),
});

/**
 * ValidationCallbacks that tracks validation metrics
 */
export const createMetricsCallbacks = (_name: string = 'metricsCallbacks'): ValidationCallbacks => {
  const metrics = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    startTime: 0,
    endTime: 0,
  };

  return {
    onStart: vi.fn().mockImplementation(() => {
      metrics.totalValidations++;
      metrics.startTime = Date.now();
    }),
    onComplete: vi.fn().mockImplementation((result: ValidraResult) => {
      metrics.endTime = Date.now();
      if (result.isValid) {
        metrics.successfulValidations++;
      } else {
        metrics.failedValidations++;
      }
      return metrics;
    }),
  };
};

/**
 * ValidationCallbacks that logs detailed validation results
 */
export const createLoggingCallbacks = (_name: string = 'loggingCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn().mockImplementation(data => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'validation_start',
      dataFields: data ? Object.keys(data as object) : [],
    };
    console.log('Validation start log:', logEntry);
  }),
  onComplete: vi.fn().mockImplementation((result: ValidraResult) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'validation_complete',
      isValid: result.isValid,
      errorCount: result.errors ? Object.keys(result.errors).length : 0,
      dataFields: result.data ? Object.keys(result.data as object) : [],
    };
    console.log('Validation complete log:', logEntry);
    return logEntry;
  }),
});

/**
 * ValidationCallbacks that throws specific error types
 */
export const createSpecificErrorCallbacks = (
  errorType: 'TypeError' | 'ReferenceError' | 'Error' = 'Error',
  _name: string = 'specificErrorCallbacks',
): ValidationCallbacks => ({
  onStart: vi.fn(),
  onComplete: vi.fn().mockImplementation(() => {
    switch (errorType) {
      case 'TypeError':
        throw new TypeError('Type error in callback');
      case 'ReferenceError':
        throw new ReferenceError('Reference error in callback');
      default:
        throw new Error('Generic error in callback');
    }
  }),
});

/**
 * ValidationCallbacks that validates callback was called with correct parameters
 */
export const createValidationCallbacks = (_name: string = 'validationCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn().mockImplementation(data => {
    expect(data).toBeDefined();
  }),
  onComplete: vi.fn().mockImplementation((result: ValidraResult) => {
    // Validate that result has expected structure
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('errors');
    expect(typeof result.isValid).toBe('boolean');
    return result;
  }),
});

/**
 * ValidationCallbacks that simulates slow processing
 */
export const createSlowCallbacks = (delay: number = 100, _name: string = 'slowCallbacks'): ValidationCallbacks => ({
  onStart: vi.fn().mockImplementation(async data => {
    await new Promise(resolve => setTimeout(resolve, delay / 2));
    console.log('Slow start completed for:', data);
  }),
  onComplete: vi.fn().mockImplementation(async (result: ValidraResult) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log('Slow complete finished:', result.isValid);
    return result;
  }),
});

/**
 * ValidationCallbacks collections for different test scenarios
 */
export const callbackCollections = {
  success: createSuccessCallbacks(),
  error: createErrorCallbacks(),
  async: createAsyncCallbacks(),
  modifying: createModifyingCallbacks(),
  metrics: createMetricsCallbacks(),
  logging: createLoggingCallbacks(),
};

/**
 * Helper function to create ValidationCallbacks that expects specific validation results
 */
export function createExpectedResultCallbacks(
  expectedIsValid: boolean,
  _name: string = 'expectedResultCallbacks',
): ValidationCallbacks {
  return {
    onStart: vi.fn(),
    onComplete: vi.fn().mockImplementation((result: ValidraResult) => {
      expect(result.isValid).toBe(expectedIsValid);
      if (expectedIsValid) {
        expect(result.errors).toEqual({});
      } else {
        expect(result.errors).toBeDefined();
        expect(Object.keys(result.errors!).length).toBeGreaterThan(0);
      }
      return result;
    }),
  };
}

/**
 * Helper function to get ValidationCallbacks by scenario name
 */
export function getCallbacks(scenario: keyof typeof callbackCollections): ValidationCallbacks {
  return callbackCollections[scenario];
}

/**
 * Mock callback manager for testing ValidationCallbacks
 */
export const createMockCallbackManager = () => ({
  setCallbacks: vi.fn(),
  triggerStart: vi.fn(),
  triggerComplete: vi.fn(),
  hasCallbacks: vi.fn().mockReturnValue(false),
});
