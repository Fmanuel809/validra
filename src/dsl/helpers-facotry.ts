// Factory configuration for available helper functions in the Validra framework.
// This module exports a comprehensive collection of available helper functions with their
// metadata, resolver functions, and type definitions. It serves as the central registry
// for all validation and utility operations that can be dynamically executed within
// the Validra validation framework.

import { CollectionChecker, Comparison, DateMatcher, Equality, StringChecker, TypeChecker } from './helpers';
import { HelperResolverSchema, HelperSchema } from './interfaces/helper-schema';

/**
 * Array containing all available helper operations with their metadata, including names, descriptions, examples, parameter definitions, and resolver functions.
 *
 * Each helper represents a reusable validation or utility operation that can be dynamically invoked based on validation rules.
 *
 * @public
 */
export const AVAILABLE_HELPERS = [
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'eq',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if two values are equal.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "eq", field: "<facts.field>", params: { value: 30 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'equality',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Equality.isEqual,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'neq',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if two values are not equal.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "neq", field: "<facts.field>", params: { value: 30 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'equality',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Equality.isNotEqual,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isEmpty',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string is empty or contains only whitespace.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isEmpty", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.isEmpty,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'contains',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string contains a substring.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "contains", field: "<facts.field>", params: { value: "substring" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.contains,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'startsWith',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string starts with a specific prefix.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "startsWith", field: "<facts.field>", params: { value: "prefix" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.startsWith,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'endsWith',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string ends with a specific suffix.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "endsWith", field: "<facts.field>", params: { value: "suffix" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.endsWith,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'regexMatch',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string matches a regular expression pattern.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "regexMatch", field: "<facts.field>", params: { regex: "/pattern/" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['regex'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.regexMatch,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isEmail',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Validates if a string is a properly formatted email address.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isEmail", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.isEmail,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isURL',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Validates if a string is a properly formatted URL.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isURL", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.isURL,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isUUID',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Validates if a string is a properly formatted UUID.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isUUID", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.isUUID,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'minLength',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string has at least the specified minimum length.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "minLength", field: "<facts.field>", params: { value: 5 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.minLength,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'maxLength',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a string has at most the specified maximum length.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "maxLength", field: "<facts.field>", params: { value: 10 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'string',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: StringChecker.maxLength,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isString',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is a string.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isString", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'type',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: TypeChecker.isString,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isNumber',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is a valid number.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isNumber", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'type',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: TypeChecker.isNumber,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isBoolean',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is a boolean.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isBoolean", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'type',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: TypeChecker.isBoolean,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isDate',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is a Date instance.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isDate", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'type',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: TypeChecker.isDate,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isArray',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is an array.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isArray", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'type',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: TypeChecker.isArray,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isObject',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is an object (excluding arrays and null).',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isObject", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'type',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: TypeChecker.isObject,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isAfter',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a date is after another reference date.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isAfter", field: "<facts.field>", params: { refDate: "2025-06-06" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'date',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['refDate'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: DateMatcher.isAfter,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isBefore',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a date is before another reference date.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isBefore", field: "<facts.field>", params: { refDate: "2025-06-06" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'date',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['refDate'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: DateMatcher.isBefore,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isToday',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a date is today (UTC comparison).',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isToday", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'date',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: DateMatcher.isToday,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isWeekend',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a date falls on a weekend (Saturday or Sunday).',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isWeekend", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'date',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: DateMatcher.isWeekend,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isWeekday',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a date falls on a weekday (Monday to Friday).',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isWeekday", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'date',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: DateMatcher.isWeekday,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isLeapYear',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a date year is a leap year.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isLeapYear", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'date',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: DateMatcher.isLeapYear,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'isEmptyCollection',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a collection (array or object) is empty.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "isEmptyCollection", field: "<facts.field>" }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'collection',
    /**
     * The names of parameters accepted by the helper.
     */
    params: [],
    /**
     * The function that performs the helper's logic.
     */
    resolver: CollectionChecker.isEmpty,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'hasProperty',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if an object has a specific property.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "hasProperty", field: "<facts.field>", params: { prop: "propertyName" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'collection',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['prop'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: CollectionChecker.hasProperty,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'containsItem',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a collection contains a specific item.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "containsItem", field: "<facts.field>", params: { value: "item" } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'collection',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: CollectionChecker.contains,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'gt',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is greater than another value.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "gt", field: "<facts.field>", params: { value: 10 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'comparison',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Comparison.isGreaterThan,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'gte',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is greater than or equal to another value.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "gte", field: "<facts.field>", params: { value: 10 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'comparison',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Comparison.isGreaterThanOrEqual,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'lt',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is less than another value.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "lt", field: "<facts.field>", params: { value: 10 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'comparison',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Comparison.isLessThan,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'lte',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is less than or equal to another value.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "lte", field: "<facts.field>", params: { value: 10 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'comparison',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['value'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Comparison.isLessThanOrEqual,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'between',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is between two other values (inclusive).',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "between", field: "<facts.field>", params: { min: 10, max: 20 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'comparison',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['min', 'max'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Comparison.between,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
  {
    /**
     * The unique name of the helper operation.
     */
    name: 'notBetween',
    /**
     * A human-readable description of the helper's purpose.
     */
    description: 'Checks if a value is not between two other values.',
    /**
     * Example usage of the helper in a rule.
     */
    example: '{ "op": "notBetween", field: "<facts.field>", params: { min: 10, max: 20 } }',
    /**
     * The category this helper belongs to (e.g., 'string', 'date', 'equality').
     */
    category: 'comparison',
    /**
     * The names of parameters accepted by the helper.
     */
    params: ['min', 'max'],
    /**
     * The function that performs the helper's logic.
     */
    resolver: Comparison.notBetween,
    /**
     * Whether the helper is asynchronous.
     */
    async: false,
  },
] as const;

/**
 * Optimized Map for O(1) helper lookups
 * Pre-built Map containing all helpers for fast access
 */
const HELPERS_MAP = new Map(AVAILABLE_HELPERS.map(helper => [helper.name, helper]));

/**
 * Union type representing all available helper names.
 *
 * This type is dynamically derived from the AVAILABLE_HELPERS array,
 * ensuring type safety when referencing helper names throughout the application.
 *
 * @public
 */
export type HelperName = (typeof AVAILABLE_HELPERS)[number]['name'];

/**
 * Utility type to extract parameter names for a specific helper.
 *
 * Given a helper name, this type extracts the parameter array from the
 * corresponding helper definition, enabling type-safe parameter handling.
 *
 * @template T - The helper name to extract parameters for
 * @public
 *
 * @property name The name of the helper for which to extract parameter names.
 */
export type GetHelperParams<T extends HelperName> = Extract<(typeof AVAILABLE_HELPERS)[number], { name: T }>['params'];

/**
 * Discriminated union type representing all possible helper operations.
 *
 * Each helper has its specific parameter requirements. Helpers with no parameters don't require a params object, while helpers with parameters require a params object with the correct parameter names.
 *
 * @example
 * // Valid helper configurations
 * const equalityHelper: Helper = {
 *   op: 'eq',
 *   field: 'user.age',
 *   params: { value: 30 }
 * };
 *
 * const emailHelper: Helper = {
 *   op: 'isEmail',
 *   field: 'user.email'
 *   // No params needed for helpers with empty params array
 * };
 */
export type Helper = {
  /**
   * The operation name, corresponding to a helper.
   */
  [K in HelperName]: {
    /** The helper operation name. */
    op: K;
    /** The field to which the helper applies. */
    field: string;
  } & (GetHelperParams<K> extends readonly []
    ? {}
    : {
        /**
         * Parameters required by the helper operation.
         * The keys correspond to the parameter names defined for the helper.
         */
        params: Record<GetHelperParams<K>[number], any>;
      });
}[HelperName];

/**
 * Collection of helper actions for managing and retrieving helper schemas and resolvers.
 */
export const helpersActions = {
  /**
   * Retrieves all available helpers with their basic information.
   * Maps the available helpers to a simplified schema containing name, description, example, and category.
   *
   * @returns An array of HelperSchema objects containing helper metadata.
   */
  getHelpers: (): HelperSchema[] => {
    const helpers: HelperSchema[] = AVAILABLE_HELPERS.map(helper => {
      return {
        name: helper.name,
        description: helper.description,
        example: helper.example,
        category: helper.category,
      };
    });
    return helpers;
  },
  /**
   * Retrieves the resolver schema for a specific helper by name.
   * Finds the helper with the given name and returns its resolver, async flag, and parameter names.
   *
   * @template T - The helper name type extending HelperName
   * @param helperName - The name of the helper to retrieve the resolver schema for
   * @returns The HelperResolverSchema containing the resolver function, async flag, and parameter names.
   * @throws {Error} When no helper with the specified name is found
   */
  getHelperResolverSchema: <T extends HelperName>(helperName: T): HelperResolverSchema => {
    const helper = HELPERS_MAP.get(helperName);
    if (!helper) {
      throw new Error(`Helper with name "${helperName}" not found.`);
    }
    return {
      resolver: helper.resolver,
      async: helper.async,
      params: helper.params,
    };
  },
};
