import { describe, it, expect } from 'vitest';
import { Rule } from '@/engine/rule';
import { ValidraEngine } from '@/engine/validra-engine';

describe('Rule Type Definition - Coverage', () => {
  describe('Rule interface usage', () => {
    it('should create rules with all properties', () => {
      const rule: Rule = {
        field: 'email',
        op: 'isEmail',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
        negative: false
      };

      expect(rule.field).toBe('email');
      expect(rule.op).toBe('isEmail');
      expect(rule.message).toBe('Invalid email format');
      expect(rule.code).toBe('INVALID_EMAIL');
      expect(rule.negative).toBe(false);
    });

    it('should create rules with minimal properties', () => {
      const rule: Rule = {
        field: 'name',
        op: 'isString'
      };

      expect(rule.field).toBe('name');
      expect(rule.op).toBe('isString');
      expect(rule.message).toBeUndefined();
      expect(rule.code).toBeUndefined();
      expect(rule.negative).toBeUndefined();
    });

    it('should create negative rules', () => {
      const rule: Rule = {
        field: 'username',
        op: 'contains',
        params: { value: 'admin' },
        negative: true,
        message: 'Username cannot contain admin'
      };

      expect(rule.negative).toBe(true);
      expect(rule.message).toBe('Username cannot contain admin');
    });

    it('should work with ValidraEngine', () => {
      const rules: Rule[] = [
        {
          field: 'email',
          op: 'isEmail',
          message: 'Please provide a valid email',
          code: 'EMAIL_INVALID'
        },
        {
          field: 'age',
          op: 'gte',
          params: { value: 18 },
          message: 'Must be 18 or older',
          code: 'AGE_TOO_LOW'
        }
      ];

      const engine = new ValidraEngine(rules);
      
      const validData = {
        email: 'test@example.com',
        age: 25
      };

      const result = engine.validate(validData);
      expect(result.isValid).toBe(true);

      const invalidData = {
        email: 'invalid-email',
        age: 16
      };

      const invalidResult = engine.validate(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors?.email?.[0]?.message).toBe('Please provide a valid email');
      expect(invalidResult.errors?.email?.[0]?.code).toBe('EMAIL_INVALID');
      expect(invalidResult.errors?.age?.[0]?.message).toBe('Must be 18 or older');
      expect(invalidResult.errors?.age?.[0]?.code).toBe('AGE_TOO_LOW');
    });

    it('should handle complex params in rules', () => {
      const rule: Rule = {
        field: 'score',
        op: 'between',
        params: {
          min: 0,
          max: 100
        },
        message: 'Score must be between 0 and 100',
        code: 'SCORE_OUT_OF_RANGE'
      };

      expect(rule.params).toEqual({
        min: 0,
        max: 100
      });
    });

    it('should create rules for nested field paths', () => {
      const rule: Rule = {
        field: 'user.profile.settings.theme',
        op: 'isString',
        message: 'Theme must be a valid string'
      };

      expect(rule.field).toBe('user.profile.settings.theme');
      
      const engine = new ValidraEngine([rule]);
      const data = {
        user: {
          profile: {
            settings: {
              theme: 'dark'
            }
          }
        }
      };

      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('should create rules for array access patterns', () => {
      const rule: Rule = {
        field: 'items.0.name',
        op: 'isString',
        message: 'First item name must be a string'
      };

      expect(rule.field).toBe('items.0.name');
      
      const engine = new ValidraEngine([rule]);
      const data = {
        items: [
          { name: 'First Item' },
          { name: 'Second Item' }
        ]
      };

      const result = engine.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('should handle rule inheritance from Helper type', () => {
      // Test that Rule extends Helper properly
      const rule: Rule = {
        field: 'data',
        op: 'eq',
        params: { value: 'test' },
        // Additional Rule-specific properties
        message: 'Custom validation failed',
        code: 'CUSTOM_ERROR',
        negative: false
      };

      // Verify both Helper and Rule properties are present
      expect(rule.field).toBe('data');
      expect(rule.op).toBe('eq');
      expect(rule.params).toEqual({ value: 'test' });
      expect(rule.message).toBe('Custom validation failed');
      expect(rule.code).toBe('CUSTOM_ERROR');
      expect(rule.negative).toBe(false);
    });
  });

  describe('Rule array operations', () => {
    it('should work with arrays of rules', () => {
      const rules: Rule[] = [
        { field: 'name', op: 'isString', message: 'Name is required' },
        { field: 'email', op: 'isEmail', message: 'Valid email required' },
        { field: 'age', op: 'isNumber', message: 'Age must be a number' }
      ];

      expect(rules.length).toBe(3);
      expect(rules.every(rule => typeof rule.field === 'string')).toBe(true);
      expect(rules.every(rule => typeof rule.op === 'string')).toBe(true);
      expect(rules.every(rule => rule.message !== undefined)).toBe(true);
    });

    it('should filter rules by properties', () => {
      const rules: Rule[] = [
        { field: 'name', op: 'isString' },
        { field: 'email', op: 'isEmail', code: 'EMAIL_ERROR' },
        { field: 'admin', op: 'contains', params: { value: 'admin' }, negative: true }
      ];

      const rulesWithCodes = rules.filter(rule => rule.code !== undefined);
      expect(rulesWithCodes.length).toBe(1);

      const negativeRules = rules.filter(rule => rule.negative === true);
      expect(negativeRules.length).toBe(1);

      const rulesWithParams = rules.filter(rule => {
        // Check if the rule type has params property
        return 'params' in rule;
      });
      expect(rulesWithParams.length).toBe(1);
    });
  });
});
