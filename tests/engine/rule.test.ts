import { describe, it, expect } from 'vitest';
import { Rule } from '@/engine/rule';

describe('Rule', () => {
  describe('Type Definition', () => {
    it('should allow basic rule structure', () => {
      const rule: Rule = {
        field: 'name',
        op: 'isString'
      };
      
      expect(rule.field).toBe('name');
      expect(rule.op).toBe('isString');
    });

    it('should allow rule with message', () => {
      const rule: Rule = {
        field: 'email',
        op: 'isEmail',
        message: 'Please provide a valid email address'
      };
      
      expect(rule.field).toBe('email');
      expect(rule.op).toBe('isEmail');
      expect(rule.message).toBe('Please provide a valid email address');
    });

    it('should allow rule with error code', () => {
      const rule: Rule = {
        field: 'age',
        op: 'gte',
        params: { value: 18 },
        code: 'AGE_VALIDATION_ERROR'
      };
      
      expect(rule.field).toBe('age');
      expect(rule.op).toBe('gte');
      expect(rule.code).toBe('AGE_VALIDATION_ERROR');
      expect((rule as any).params).toEqual({ value: 18 });
    });

    it('should allow negative rule', () => {
      const rule: Rule = {
        field: 'username',
        op: 'contains',
        params: { value: 'admin' },
        negative: true,
        message: 'Username cannot contain "admin"'
      };
      
      expect(rule.field).toBe('username');
      expect(rule.op).toBe('contains');
      expect(rule.negative).toBe(true);
      expect(rule.message).toBe('Username cannot contain "admin"');
    });

    it('should allow rule with all optional properties', () => {
      const rule: Rule = {
        field: 'password',
        op: 'minLength',
        params: { value: 8 },
        message: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT',
        negative: false
      };
      
      expect(rule.field).toBe('password');
      expect(rule.op).toBe('minLength');
      expect((rule as any).params).toEqual({ value: 8 });
      expect(rule.message).toBe('Password must be at least 8 characters long');
      expect(rule.code).toBe('PASSWORD_TOO_SHORT');
      expect(rule.negative).toBe(false);
    });

    it('should work with nested field paths', () => {
      const rule: Rule = {
        field: 'user.profile.settings.theme',
        op: 'isString',
        message: 'Theme must be a string'
      };
      
      expect(rule.field).toBe('user.profile.settings.theme');
      expect(rule.op).toBe('isString');
    });

    it('should work with array index paths', () => {
      const rule: Rule = {
        field: 'users.0.email',
        op: 'isEmail',
        message: 'First user must have valid email'
      };
      
      expect(rule.field).toBe('users.0.email');
      expect(rule.op).toBe('isEmail');
    });

    it('should allow complex parameter structures', () => {
      const rule: Rule = {
        field: 'config',
        op: 'between',
        params: {
          min: 10,
          max: 100
        }
      };
      
      expect((rule as any).params).toEqual({
        min: 10,
        max: 100
      });
    });
  });

  describe('Rule Examples', () => {
    it('should define string validation rules', () => {
      const stringRules: Rule[] = [
        { field: 'name', op: 'isString' },
        { field: 'email', op: 'isEmail' },
        { field: 'phone', op: 'regexMatch', params: { regex: /^\d{10}$/ } },
        { field: 'username', op: 'minLength', params: { value: 3 } },
        { field: 'bio', op: 'maxLength', params: { value: 500 } }
      ];
      
      expect(stringRules).toHaveLength(5);
      expect(stringRules.every(rule => typeof rule.field === 'string')).toBe(true);
      expect(stringRules.every(rule => typeof rule.op === 'string')).toBe(true);
    });

    it('should define number validation rules', () => {
      const numberRules: Rule[] = [
        { field: 'age', op: 'isNumber' },
        { field: 'score', op: 'gte', params: { value: 0 } },
        { field: 'rating', op: 'lte', params: { value: 5 } },
        { field: 'price', op: 'gt', params: { value: 0 } },
        { field: 'discount', op: 'lt', params: { value: 100 } }
      ];
      
      expect(numberRules).toHaveLength(5);
      numberRules.forEach(rule => {
        expect(typeof rule.field).toBe('string');
        expect(typeof rule.op).toBe('string');
      });
    });

    it('should define boolean validation rules', () => {
      const booleanRules: Rule[] = [
        { field: 'isActive', op: 'isBoolean' },
        { field: 'termsAccepted', op: 'eq', params: { value: true } },
        { field: 'notifications', op: 'isBoolean', message: 'Notifications setting must be boolean' }
      ];
      
      expect(booleanRules).toHaveLength(3);
      expect(booleanRules[2]?.message).toBe('Notifications setting must be boolean');
    });

    it('should define array validation rules', () => {
      const arrayRules: Rule[] = [
        { field: 'tags', op: 'isArray' },
        { field: 'items', op: 'minLength', params: { value: 1 } },
        { field: 'categories', op: 'maxLength', params: { value: 10 } },
        { field: 'skills', op: 'contains', params: { value: 'JavaScript' } }
      ];
      
      expect(arrayRules).toHaveLength(4);
      expect(arrayRules.every(rule => (rule as any).params || rule.op === 'isArray')).toBe(true);
    });

    it('should define date validation rules', () => {
      const dateRules: Rule[] = [
        { field: 'birthDate', op: 'isDate' },
        { field: 'createdAt', op: 'isDate' },
        { field: 'expiryDate', op: 'gt', params: { value: new Date() } }
      ];
      
      expect(dateRules).toHaveLength(3);
      expect((dateRules[2] as any)?.params?.value).toBeInstanceOf(Date);
    });
  });

  describe('Rule Validation Scenarios', () => {
    it('should create rules for user registration', () => {
      const userRegistrationRules: Rule[] = [
        {
          field: 'email',
          op: 'isEmail',
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        },
        {
          field: 'password',
          op: 'minLength',
          params: { value: 8 },
          message: 'Password must be at least 8 characters long',
          code: 'PASSWORD_TOO_SHORT'
        },
        {
          field: 'age',
          op: 'gte',
          params: { value: 18 },
          message: 'Must be 18 or older to register',
          code: 'UNDERAGE'
        },
        {
          field: 'termsAccepted',
          op: 'eq',
          params: { value: true },
          message: 'You must accept the terms and conditions',
          code: 'TERMS_NOT_ACCEPTED'
        }
      ];
      
      expect(userRegistrationRules).toHaveLength(4);
      expect(userRegistrationRules.every(rule => rule.message)).toBe(true);
      expect(userRegistrationRules.every(rule => rule.code)).toBe(true);
    });

    it('should create rules for product validation', () => {
      const productValidationRules: Rule[] = [
        { field: 'name', op: 'isString', message: 'Product name is required' },
        { field: 'name', op: 'minLength', params: { value: 2 }, message: 'Product name too short' },
        { field: 'price', op: 'isNumber', message: 'Price must be a number' },
        { field: 'price', op: 'gt', params: { value: 0 }, message: 'Price must be positive' },
        { field: 'category', op: 'isString', message: 'Category is required' },
        { field: 'inStock', op: 'isBoolean', message: 'Stock status must be boolean' }
      ];
      
      expect(productValidationRules).toHaveLength(6);
      expect(productValidationRules.filter(rule => rule.field === 'name')).toHaveLength(2);
      expect(productValidationRules.filter(rule => rule.field === 'price')).toHaveLength(2);
    });

    it('should create rules with negative validation', () => {
      const negativeValidationRules: Rule[] = [
        {
          field: 'username',
          op: 'contains',
          params: { value: 'admin' },
          negative: true,
          message: 'Username cannot contain "admin"',
          code: 'RESERVED_USERNAME'
        },
        {
          field: 'email',
          op: 'contains',
          params: { value: 'test' },
          negative: true,
          message: 'Email cannot contain "test"',
          code: 'TEST_EMAIL_NOT_ALLOWED'
        }
      ];
      
      expect(negativeValidationRules).toHaveLength(2);
      expect(negativeValidationRules.every(rule => rule.negative)).toBe(true);
    });
  });
});
