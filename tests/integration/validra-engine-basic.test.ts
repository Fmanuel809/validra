import type { ValidraCallback } from '@/engine/interfaces';
import type { Rule } from '@/engine/rule';
import { ValidraEngine } from '@/engine/validra-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  basicUserRules,
  createSuccessCallback,
  customMessageRules,
  invalidTestData,
  negativeRules,
  validTestData,
} from './fixtures';

describe('ValidraEngine - Basic Integration Tests', () => {
  let engine: ValidraEngine;
  let basicRules: Rule[];
  let callbacks: ValidraCallback[];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    basicRules = basicUserRules;
    callbacks = [createSuccessCallback('onValidation')];
    engine = new ValidraEngine(basicRules, callbacks, { debug: false });
  });

  describe('Synchronous Validation', () => {
    it('should validate valid user data successfully', () => {
      const result = engine.validate(validTestData.basicUser);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validTestData.basicUser);
      expect(result.errors).toBeUndefined();
    });

    it('should return validation errors for invalid data', () => {
      const result = engine.validate(invalidTestData.multipleErrors);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('age');
      expect(result.errors).toHaveProperty('name');
    });

    it('should execute named callback on validation completion', () => {
      engine.validate(validTestData.basicUser, 'onValidation');

      expect(callbacks[0]?.callback).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          data: validTestData.basicUser,
        }),
      );
    });

    it('should execute function callback on validation completion', () => {
      const callbackFn = vi.fn();
      engine.validate(validTestData.userWithMinimalName, callbackFn);

      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          data: validTestData.userWithMinimalName,
        }),
      );
    });

    it('should throw error for invalid data types', () => {
      expect(() => engine.validate(invalidTestData.nullData as any)).toThrow('Data must be a valid object');
      expect(() => engine.validate(invalidTestData.arrayData as any)).toThrow('Data must be a valid object');
      expect(() => engine.validate(invalidTestData.stringData as any)).toThrow('Data must be a valid object');
      expect(() => engine.validate(invalidTestData.numberData as any)).toThrow('Data must be a valid object');
      expect(() => engine.validate(invalidTestData.dateData as any)).toThrow('Data must be a valid object');
      expect(() => engine.validate(invalidTestData.functionData as any)).toThrow('Data must be a valid object');
    });

    it('should throw error for non-existent named callback', () => {
      expect(() => engine.validate(validTestData.basicUser, 'nonExistentCallback')).toThrow(
        'Callback with name "nonExistentCallback" not found.',
      );
    });

    it('should throw error for invalid callback type', () => {
      expect(() => engine.validate(validTestData.basicUser, 123 as any)).toThrow(
        'Callback must be a string or a function.',
      );
    });
  });

  describe('Validation Options', () => {
    it('should respect failFast option', () => {
      const invalidData = {
        email: 'invalid',
        age: 10,
        name: '',
        password: 'x',
        bio: 'designer',
      };

      const result = engine.validate(invalidData, undefined, { failFast: true });

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      // With failFast, should stop at first error
      expect(Object.keys(result.errors!).length).toBeGreaterThan(0);
    });

    it('should respect maxErrors option', () => {
      const invalidData = {
        email: 'invalid',
        age: 10,
        name: '',
        password: 'x',
        bio: 'designer',
      };

      const result = engine.validate(invalidData, undefined, { maxErrors: 2 });

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors!).length).toBeLessThanOrEqual(2);
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle negative rules correctly', () => {
      const negativeEngine = new ValidraEngine(negativeRules);

      // Valid case - username not empty, description doesn't contain spam
      const validData = { username: 'validuser', email: 'clean@example.com', password: 'strongpass123' };
      const validResult = negativeEngine.validate(validData);
      expect(validResult.isValid).toBe(true);

      // Invalid case - username empty
      const invalidData1 = { username: '', email: 'clean@example.com', password: 'strongpass123' };
      const invalidResult1 = negativeEngine.validate(invalidData1);
      expect(invalidResult1.isValid).toBe(false);
      expect(invalidResult1.errors).toHaveProperty('username');
    });

    it('should handle custom error messages and codes', () => {
      const customEngine = new ValidraEngine(customMessageRules);
      const result = customEngine.validate(invalidTestData.multipleErrors);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      const emailError = result.errors!.email;
      expect(emailError).toBeDefined();
    });
  });

  describe('Engine Metrics and Management', () => {
    it('should provide engine metrics', () => {
      const userData = {
        email: 'metrics@test.com',
        age: 30,
        name: 'Metrics Test',
        password: 'metricspass',
        bio: 'developer',
      };

      engine.validate(userData);
      const metrics = engine.getMetrics();

      expect(metrics).toHaveProperty('ruleCompiler');
      expect(metrics).toHaveProperty('dataExtractor');
      expect(metrics).toHaveProperty('memoryPool');
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('errorHandler');
      expect(metrics).toHaveProperty('callbackManager');

      expect(metrics.callbackManager).toHaveProperty('activeCallbacks');
      expect(typeof metrics.callbackManager.activeCallbacks).toBe('number');
    });

    it('should clear caches without errors', () => {
      const userData = {
        email: 'cache@test.com',
        age: 25,
        name: 'Cache Test',
        password: 'cachepass',
        bio: 'developer',
      };

      // Generate some cached data
      engine.validate(userData);

      // Clear caches should not throw
      expect(() => engine.clearCaches()).not.toThrow();

      // Should still work after clearing caches
      const result = engine.validate(userData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('String Validation Helpers', () => {
    it('should validate various string helpers correctly', () => {
      const stringRules: Rule[] = [
        { op: 'isEmail', field: 'email' },
        { op: 'isURL', field: 'website' },
        { op: 'isUUID', field: 'id' },
        { op: 'startsWith', field: 'title', params: { value: 'Dr.' } },
        { op: 'endsWith', field: 'filename', params: { value: '.pdf' } },
        { op: 'maxLength', field: 'summary', params: { value: 100 } },
      ];

      const stringEngine = new ValidraEngine(stringRules);
      const stringData = {
        email: 'doctor@hospital.com',
        website: 'https://www.doctor.com',
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Dr. Smith',
        filename: 'report.pdf',
        summary: 'Short medical summary',
      };

      const result = stringEngine.validate(stringData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Comparison Helpers', () => {
    it('should validate numerical comparisons correctly', () => {
      const comparisonRules: Rule[] = [
        { op: 'gt', field: 'score', params: { value: 70 } },
        { op: 'lt', field: 'attempts', params: { value: 5 } },
        { op: 'between', field: 'rating', params: { min: 1, max: 10 } },
        { op: 'notBetween', field: 'excluded', params: { min: 90, max: 100 } },
      ];

      const comparisonEngine = new ValidraEngine(comparisonRules);
      const comparisonData = {
        score: 85,
        attempts: 3,
        rating: 8,
        excluded: 75,
      };

      const result = comparisonEngine.validate(comparisonData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Collection Helpers', () => {
    it('should validate collections correctly', () => {
      const collectionRules: Rule[] = [
        { op: 'isEmptyCollection', field: 'tags', negative: true },
        { op: 'hasProperty', field: 'metadata', params: { prop: 'version' } },
        { op: 'containsItem', field: 'categories', params: { value: 'technology' } },
      ];

      const collectionEngine = new ValidraEngine(collectionRules);
      const collectionData = {
        tags: ['javascript', 'testing', 'validation'],
        metadata: { version: '1.0.0', author: 'dev' },
        categories: ['technology', 'programming', 'software'],
      };

      const result = collectionEngine.validate(collectionData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Type Validation Helpers', () => {
    it('should validate data types correctly', () => {
      const typeRules: Rule[] = [
        { op: 'isString', field: 'name' },
        { op: 'isNumber', field: 'count' },
        { op: 'isBoolean', field: 'active' },
        { op: 'isArray', field: 'items' },
        { op: 'isObject', field: 'config' },
      ];

      const typeEngine = new ValidraEngine(typeRules);
      const typeData = {
        name: 'Test Item',
        count: 42,
        active: true,
        items: [1, 2, 3],
        config: { debug: true, timeout: 5000 },
      };

      const result = typeEngine.validate(typeData);
      expect(result.isValid).toBe(true);
    });
  });
});
