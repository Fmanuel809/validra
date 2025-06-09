/**
 * Common callback fixtures for integration tests.
 * Provides reusable callback configurations for different testing scenarios.
 *
 * @category Test Fixtures
 */

import { ValidraCallback, ValidraResult } from '@/engine/interfaces';
import { expect, vi } from 'vitest';

/**
 * Basic success callback for testing
 */
export const createSuccessCallback = (name: string = 'successCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation((result: ValidraResult) => {
    console.log(`Validation completed: ${result.isValid}`);
  }),
});

/**
 * Basic error callback for testing
 */
export const createErrorCallback = (name: string = 'errorCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation(() => {
    throw new Error('Callback error');
  }),
});

/**
 * Async callback for testing asynchronous operations
 */
export const createAsyncCallback = (name: string = 'asyncCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation(async (result: ValidraResult) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    return result;
  }),
});

/**
 * Callback that modifies result data
 */
export const createModifyingCallback = (name: string = 'modifyingCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation((result: ValidraResult) => {
    if (result.data && typeof result.data === 'object') {
      (result.data as any).modified = true;
    }
    return result;
  }),
});

/**
 * Callback that tracks validation metrics
 */
export const createMetricsCallback = (name: string = 'metricsCallback'): ValidraCallback => {
  const metrics = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
  };

  return {
    name,
    callback: vi.fn().mockImplementation((result: ValidraResult) => {
      metrics.totalValidations++;
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
 * Callback that logs detailed validation results
 */
export const createLoggingCallback = (name: string = 'loggingCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation((result: ValidraResult) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      isValid: result.isValid,
      errorCount: result.errors ? Object.keys(result.errors).length : 0,
      dataFields: result.data ? Object.keys(result.data as object) : [],
    };
    console.log('Validation log:', logEntry);
    return logEntry;
  }),
});

/**
 * Callback that throws specific error types
 */
export const createSpecificErrorCallback = (
  errorType: 'TypeError' | 'ReferenceError' | 'Error' = 'Error',
  name: string = 'specificErrorCallback',
): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation(() => {
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
 * Callback that validates callback was called with correct parameters
 */
export const createValidationCallback = (name: string = 'validationCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation((result: ValidraResult) => {
    // Validate that result has expected structure
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('errors');
    expect(typeof result.isValid).toBe('boolean');
    return result;
  }),
});

/**
 * Callback that simulates slow processing
 */
export const createSlowCallback = (delay: number = 100, name: string = 'slowCallback'): ValidraCallback => ({
  name,
  callback: vi.fn().mockImplementation(async (result: ValidraResult) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return result;
  }),
});

/**
 * Callback collections for different test scenarios
 */
export const callbackCollections = {
  success: [createSuccessCallback()],
  error: [createErrorCallback()],
  async: [createAsyncCallback()],
  modifying: [createModifyingCallback()],
  metrics: [createMetricsCallback()],
  logging: [createLoggingCallback()],
  mixed: [createSuccessCallback('success1'), createLoggingCallback('logger'), createMetricsCallback('metrics')],
  errorMixed: [
    createSuccessCallback('beforeError'),
    createErrorCallback('errorMiddle'),
    createSuccessCallback('afterError'),
  ],
};

/**
 * Helper function to create multiple callbacks with different names
 */
export function createMultipleCallbacks(
  count: number,
  callbackFactory: (name: string) => ValidraCallback = createSuccessCallback,
): ValidraCallback[] {
  return Array.from({ length: count }, (_, i) => callbackFactory(`callback${i + 1}`));
}

/**
 * Helper function to get callbacks by scenario name
 */
export function getCallbacks(scenario: keyof typeof callbackCollections): ValidraCallback[] {
  return callbackCollections[scenario];
}

/**
 * Helper function to create a callback that expects specific validation results
 */
export function createExpectedResultCallback(
  expectedIsValid: boolean,
  name: string = 'expectedResultCallback',
): ValidraCallback {
  return {
    name,
    callback: vi.fn().mockImplementation((result: ValidraResult) => {
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
 * Mock callback manager for testing
 */
export const createMockCallbackManager = () => ({
  addCallback: vi.fn(),
  removeCallback: vi.fn(),
  executeCallback: vi.fn(),
  getCallback: vi.fn(),
  getAllCallbacks: vi.fn().mockReturnValue([]),
  clearCallbacks: vi.fn(),
});
