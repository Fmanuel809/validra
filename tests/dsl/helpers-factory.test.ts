import { describe, it, expect } from 'vitest';
import { helpersActions } from '../../src/dsl/helpers-facotry';

describe('helpersActions', () => {
  describe('getHelpers()', () => {
    it('should return array of HelperSchema objects', () => {
      const helpers = helpersActions.getHelpers();
      
      expect(Array.isArray(helpers)).toBe(true);
      expect(helpers.length).toBe(33);
    });

    it('should return objects with required properties only', () => {
      const helpers = helpersActions.getHelpers();
      const firstHelper = helpers[0];
      
      expect(firstHelper).toHaveProperty('name');
      expect(firstHelper).toHaveProperty('description');
      expect(firstHelper).toHaveProperty('example');
      expect(firstHelper).toHaveProperty('category');
      expect(firstHelper).not.toHaveProperty('resolver');
      expect(firstHelper).not.toHaveProperty('params');
      expect(firstHelper).not.toHaveProperty('async');
    });

    it('should return valid string properties', () => {
      const helpers = helpersActions.getHelpers();
      
      helpers.forEach(helper => {
        expect(typeof helper.name).toBe('string');
        expect(typeof helper.description).toBe('string');
        expect(typeof helper.example).toBe('string');
        expect(typeof helper.category).toBe('string');
        expect(helper.name.length).toBeGreaterThan(0);
        expect(helper.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getHelperResolverSchema()', () => {
    it('should return HelperResolverSchema for valid helper', () => {
      const schema = helpersActions.getHelperResolverSchema('eq');
      
      expect(schema).toHaveProperty('resolver');
      expect(schema).toHaveProperty('async');
      expect(schema).toHaveProperty('params');
      expect(typeof schema.resolver).toBe('function');
      expect(typeof schema.async).toBe('boolean');
      expect(Array.isArray(schema.params)).toBe(true);
    });

    it('should throw error for invalid helper name', () => {
      expect(() => {
        helpersActions.getHelperResolverSchema('invalidHelper' as any);
      }).toThrow('Helper with name "invalidHelper" not found.');
    });

    it('should return correct async property', () => {
      const schema = helpersActions.getHelperResolverSchema('eq');
      expect(schema.async).toBe(false);
    });

    it('should work for all valid helper names', () => {
      const helpers = helpersActions.getHelpers();
      
      helpers.forEach(helper => {
        expect(() => {
          const schema = helpersActions.getHelperResolverSchema(helper.name as any);
          expect(typeof schema.resolver).toBe('function');
        }).not.toThrow();
      });
    });
  });
});