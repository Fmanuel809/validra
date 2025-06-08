import { describe, expect, it } from 'vitest';
import { AVAILABLE_HELPERS, helpersActions } from '../../src/dsl/helpers-facotry';

describe('helpersActions.getHelpers', () => {
  it('should return an array of helper metadata matching AVAILABLE_HELPERS', () => {
    const result = helpersActions.getHelpers();
    expect(result.length).toBe(AVAILABLE_HELPERS.length);
    // Check each result has a matching AVAILABLE_HELPERS entry by name
    result.forEach(meta => {
      const src = AVAILABLE_HELPERS.find(h => h.name === meta.name);
      expect(src).toBeDefined();
      expect(meta).toEqual({
        name: src!.name,
        description: src!.description,
        example: src!.example,
        category: src!.category,
      });
    });
  });

  it('should return only the metadata fields (no resolver, params, or async)', () => {
    const result = helpersActions.getHelpers();
    result.forEach(meta => {
      expect(meta).not.toHaveProperty('resolver');
      expect(meta).not.toHaveProperty('params');
      expect(meta).not.toHaveProperty('async');
    });
  });
});

describe('helpersActions.getHelperResolverSchema', () => {
  it('should return the correct resolver schema for a valid helper name', () => {
    const anyHelper = AVAILABLE_HELPERS[0];
    const schema = helpersActions.getHelperResolverSchema(anyHelper.name);
    expect(schema).toEqual({
      resolver: anyHelper.resolver,
      async: anyHelper.async,
      params: anyHelper.params,
    });
  });

  it('should throw an error if the helper name does not exist', () => {
    // @ts-expect-error purposely passing invalid name
    expect(() => helpersActions.getHelperResolverSchema('__not_a_real_helper__')).toThrow(
      'Helper with name "__not_a_real_helper__" not found.',
    );
  });
});
