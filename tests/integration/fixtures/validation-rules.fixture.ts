/**
 * Common validation rules fixtures for integration tests.
 * Provides reusable rule sets for different validation scenarios.
 *
 * @category Test Fixtures
 */

import { Rule } from '@/engine/rule';

/**
 * Basic validation rules for user data
 */
export const basicUserRules: Rule[] = [
  { op: 'isString', field: 'name' },
  { op: 'isEmail', field: 'email' },
  { op: 'minLength', field: 'name', params: { value: 2 } },
  { op: 'isNumber', field: 'age' },
  { op: 'gte', field: 'age', params: { value: 0 } },
];

/**
 * Strict validation rules with additional constraints
 */
export const strictUserRules: Rule[] = [
  { op: 'isString', field: 'name' },
  { op: 'minLength', field: 'name', params: { value: 2 } },
  { op: 'maxLength', field: 'name', params: { value: 50 } },
  { op: 'isEmail', field: 'email' },
  { op: 'isNumber', field: 'age' },
  { op: 'gte', field: 'age', params: { value: 0 } },
  { op: 'lte', field: 'age', params: { value: 150 } },
];

/**
 * Nested object validation rules
 */
export const nestedUserRules: Rule[] = [
  { op: 'isString', field: 'user.personalInfo.firstName' },
  { op: 'isString', field: 'user.personalInfo.lastName' },
  { op: 'isEmail', field: 'user.contact.email' },
  { op: 'isNumber', field: 'user.profile.age' },
  { op: 'isArray', field: 'user.roles' },
  { op: 'isObject', field: 'user.preferences' },
  { op: 'isBoolean', field: 'user.preferences.notifications' },
  { op: 'isDate', field: 'user.createdAt' },
];

/**
 * Complex validation rules with custom messages
 */
export const customMessageRules: Rule[] = [
  {
    op: 'isEmail',
    field: 'email',
    message: 'Please provide a valid email address',
    code: 'INVALID_EMAIL',
  },
  {
    op: 'minLength',
    field: 'password',
    params: { value: 8 },
    message: 'Password must be at least 8 characters long',
    code: 'WEAK_PASSWORD',
  },
  {
    op: 'isString',
    field: 'username',
    message: 'Username must be a string',
    code: 'INVALID_USERNAME_TYPE',
  },
];

/**
 * Negative validation rules
 */
export const negativeRules: Rule[] = [
  { op: 'isEmpty', field: 'username', negative: true }, // username should NOT be empty
  { op: 'contains', field: 'email', params: { value: 'spam' }, negative: true }, // email should NOT contain 'spam'
  { op: 'eq', field: 'password', params: { value: 'password123' }, negative: true }, // password should NOT be 'password123'
];

/**
 * Optional field validation rules (using isEmpty with negative for optional fields)
 */
export const optionalFieldRules: Rule[] = [
  { op: 'isString', field: 'name' },
  { op: 'isEmail', field: 'email' },
  { op: 'isNumber', field: 'age' },
  { op: 'isString', field: 'bio' },
  { op: 'isArray', field: 'tags' },
];

/**
 * Array validation rules
 */
export const arrayValidationRules: Rule[] = [
  { op: 'isArray', field: 'users' },
  { op: 'minLength', field: 'users', params: { value: 1 } },
  { op: 'isArray', field: 'tags' },
  { op: 'isString', field: 'tags.*' }, // Each tag should be a string
];

/**
 * Type checking rules
 */
export const typeCheckingRules: Rule[] = [
  { op: 'isString', field: 'stringField' },
  { op: 'isNumber', field: 'numberField' },
  { op: 'isBoolean', field: 'booleanField' },
  { op: 'isArray', field: 'arrayField' },
  { op: 'isObject', field: 'objectField' },
  { op: 'isDate', field: 'dateField' },
  { op: 'isEmpty', field: 'nullField' }, // Check if field is empty/null
  { op: 'isEmpty', field: 'undefinedField' }, // Check if field is empty/undefined
];

/**
 * String validation rules
 */
export const stringValidationRules: Rule[] = [
  { op: 'isString', field: 'text' },
  { op: 'minLength', field: 'text', params: { value: 5 } },
  { op: 'maxLength', field: 'text', params: { value: 100 } },
  { op: 'regexMatch', field: 'text', params: { regex: '^[A-Za-z]+$' } },
  { op: 'contains', field: 'text', params: { value: 'test' } },
  { op: 'startsWith', field: 'text', params: { value: 'prefix' } },
  { op: 'endsWith', field: 'text', params: { value: 'suffix' } },
];

/**
 * Number validation rules
 */
export const numberValidationRules: Rule[] = [
  { op: 'isNumber', field: 'value' },
  { op: 'gte', field: 'value', params: { value: 0 } },
  { op: 'lte', field: 'value', params: { value: 100 } },
  { op: 'gt', field: 'value', params: { value: -1 } },
  { op: 'lt', field: 'value', params: { value: 101 } },
  { op: 'eq', field: 'value', params: { value: 50 } },
];

/**
 * Date validation rules
 */
export const dateValidationRules: Rule[] = [
  { op: 'isDate', field: 'createdAt' },
  { op: 'lt', field: 'createdAt', params: { value: new Date().getTime() } }, // Before current date
  { op: 'gt', field: 'updatedAt', params: { value: new Date('2020-01-01').getTime() } }, // After specific date
];

/**
 * Performance testing rules (minimal for speed)
 */
export const performanceRules: Rule[] = [
  { op: 'isString', field: 'name' },
  { op: 'isEmail', field: 'email' },
  { op: 'isNumber', field: 'age' },
];

/**
 * Complex nested rules for deep validation
 */
export const deepNestedRules: Rule[] = [
  { op: 'isString', field: 'level1.level2.level3.level4.level5.name' },
  { op: 'isEmail', field: 'level1.level2.level3.level4.level5.email' },
  { op: 'isNumber', field: 'level1.level2.level3.level4.level5.age' },
];

/**
 * Problematic rules for error testing
 */
export const problematicRules: Rule[] = [
  { op: 'isString', field: 'name' },
  { op: 'regexMatch', field: 'code', params: { regex: '[invalid-regex' } }, // Invalid regex
];

/**
 * Rules collections for different test scenarios
 */
export const ruleCollections = {
  basic: basicUserRules,
  strict: strictUserRules,
  nested: nestedUserRules,
  customMessages: customMessageRules,
  negative: negativeRules,
  optional: optionalFieldRules,
  arrays: arrayValidationRules,
  types: typeCheckingRules,
  strings: stringValidationRules,
  numbers: numberValidationRules,
  dates: dateValidationRules,
  performance: performanceRules,
  deepNested: deepNestedRules,
  problematic: problematicRules,
};

/**
 * Helper function to get rules by name
 */
export function getRules(name: keyof typeof ruleCollections): Rule[] {
  return ruleCollections[name];
}

/**
 * Helper function to combine multiple rule sets
 */
export function combineRules(...ruleSets: Rule[][]): Rule[] {
  return ruleSets.flat();
}
