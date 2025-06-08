/**
 * @fileoverview Factory configuration for available helper functions in the Validra framework
 *
 * This module exports a comprehensive collection of available helper functions with their
 * metadata, resolver functions, and type definitions. It serves as the central registry
 * for all validation and utility operations that can be dynamically executed within
 * the Validra validation framework.
 *
 * @module HelpersFactory
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import {
  CollectionChecker,
  Comparison,
  DateMatcher,
  Equality,
  StringChecker,
  TypeChecker,
} from "./helpers";
import { HelperResolverSchema, HelperSchema } from "./interfaces/helper-schema";

/**
 * Comprehensive registry of available helper functions for the Validra validation framework.
 *
 * This constant array defines all available helper operations with their metadata,
 * including names, descriptions, examples, parameter definitions, and resolver functions.
 * Each helper represents a reusable validation or utility operation that can be
 * dynamically invoked based on validation rules.
 *
 * @readonly
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Using equality helpers
 * const equalHelper = AVAILABLE_HELPERS.find(h => h.name === 'eq');
 * const result = equalHelper.resolver(value1, value2);
 *
 * // Using string validation helpers
 * const emailHelper = AVAILABLE_HELPERS.find(h => h.name === 'isEmail');
 * const isValid = emailHelper.resolver(emailString);
 *
 * // Using date comparison helpers
 * const afterHelper = AVAILABLE_HELPERS.find(h => h.name === 'isAfter');
 * const isAfterDate = afterHelper.resolver(date1, date2);
 * ```
 */
const AVAILABLE_HELPERS = [
  {
    name: "eq",
    description: "Checks if two values are equal.",
    example: `{ "op": "eq", field: "<facts.field>", params: { value: 30 } }`,
    category: "equality",
    params: ["value"],
    resolver: Equality.isEqual,
    async: false,
  },
  {
    name: "neq",
    description: "Checks if two values are not equal.",
    example: `{ "op": "neq", field: "<facts.field>", params: { value: 30 } }`,
    category: "equality",
    params: ["value"],
    resolver: Equality.isNotEqual,
    async: false,
  },
  {
    name: "isEmpty",
    description: "Checks if a string is empty or contains only whitespace.",
    example: `{ "op": "isEmpty", field: "<facts.field>" }`,
    category: "string",
    params: [],
    resolver: StringChecker.isEmpty,
    async: false,
  },
  {
    name: "contains",
    description: "Checks if a string contains a substring.",
    example: `{ "op": "contains", field: "<facts.field>", params: { value: "substring" } }`,
    category: "string",
    params: ["value"],
    resolver: StringChecker.contains,
    async: false,
  },
  {
    name: "startsWith",
    description: "Checks if a string starts with a specific prefix.",
    example: `{ "op": "startsWith", field: "<facts.field>", params: { value: "prefix" } }`,
    category: "string",
    params: ["value"],
    resolver: StringChecker.startsWith,
    async: false,
  },
  {
    name: "endsWith",
    description: "Checks if a string ends with a specific suffix.",
    example: `{ "op": "endsWith", field: "<facts.field>", params: { value: "suffix" } }`,
    category: "string",
    params: ["value"],
    resolver: StringChecker.endsWith,
    async: false,
  },
  {
    name: "regexMatch",
    description: "Checks if a string matches a regular expression pattern.",
    example: `{ "op": "regexMatch", field: "<facts.field>", params: { regex: "/pattern/" } }`,
    category: "string",
    params: ["regex"],
    resolver: StringChecker.regexMatch,
    async: false,
  },
  {
    name: "isEmail",
    description: "Validates if a string is a properly formatted email address.",
    example: `{ "op": "isEmail", field: "<facts.field>" }`,
    category: "string",
    params: [],
    resolver: StringChecker.isEmail,
    async: false,
  },
  {
    name: "isURL",
    description: "Validates if a string is a properly formatted URL.",
    example: `{ "op": "isURL", field: "<facts.field>" }`,
    category: "string",
    params: [],
    resolver: StringChecker.isURL,
    async: false,
  },
  {
    name: "isUUID",
    description: "Validates if a string is a properly formatted UUID.",
    example: `{ "op": "isUUID", field: "<facts.field>" }`,
    category: "string",
    params: [],
    resolver: StringChecker.isUUID,
    async: false,
  },
  {
    name: "minLength",
    description:
      "Checks if a string has at least the specified minimum length.",
    example: `{ "op": "minLength", field: "<facts.field>", params: { value: 5 } }`,
    category: "string",
    params: ["value"],
    resolver: StringChecker.minLength,
    async: false,
  },
  {
    name: "maxLength",
    description: "Checks if a string has at most the specified maximum length.",
    example: `{ "op": "maxLength", field: "<facts.field>", params: { value: 10 } }`,
    category: "string",
    params: ["value"],
    resolver: StringChecker.maxLength,
    async: false,
  },
  {
    name: "isString",
    description: "Checks if a value is a string.",
    example: `{ "op": "isString", field: "<facts.field>" }`,
    category: "type",
    params: [],
    resolver: TypeChecker.isString,
    async: false,
  },
  {
    name: "isNumber",
    description: "Checks if a value is a valid number.",
    example: `{ "op": "isNumber", field: "<facts.field>" }`,
    category: "type",
    params: [],
    resolver: TypeChecker.isNumber,
    async: false,
  },
  {
    name: "isBoolean",
    description: "Checks if a value is a boolean.",
    example: `{ "op": "isBoolean", field: "<facts.field>" }`,
    category: "type",
    params: [],
    resolver: TypeChecker.isBoolean,
    async: false,
  },
  {
    name: "isDate",
    description: "Checks if a value is a Date instance.",
    example: `{ "op": "isDate", field: "<facts.field>" }`,
    category: "type",
    params: [],
    resolver: TypeChecker.isDate,
    async: false,
  },
  {
    name: "isArray",
    description: "Checks if a value is an array.",
    example: `{ "op": "isArray", field: "<facts.field>" }`,
    category: "type",
    params: [],
    resolver: TypeChecker.isArray,
    async: false,
  },
  {
    name: "isObject",
    description: "Checks if a value is an object (excluding arrays and null).",
    example: `{ "op": "isObject", field: "<facts.field>" }`,
    category: "type",
    params: [],
    resolver: TypeChecker.isObject,
    async: false,
  },
  {
    name: "isAfter",
    description: "Checks if a date is after another reference date.",
    example: `{ "op": "isAfter", field: "<facts.field>", params: { refDate: "2025-06-06" } }`,
    category: "date",
    params: ["refDate"],
    resolver: DateMatcher.isAfter,
    async: false,
  },
  {
    name: "isBefore",
    description: "Checks if a date is before another reference date.",
    example: `{ "op": "isBefore", field: "<facts.field>", params: { refDate: "2025-06-06" } }`,
    category: "date",
    params: ["refDate"],
    resolver: DateMatcher.isBefore,
    async: false,
  },
  {
    name: "isToday",
    description: "Checks if a date is today (UTC comparison).",
    example: `{ "op": "isToday", field: "<facts.field>" }`,
    category: "date",
    params: [],
    resolver: DateMatcher.isToday,
    async: false,
  },
  {
    name: "isWeekend",
    description: "Checks if a date falls on a weekend (Saturday or Sunday).",
    example: `{ "op": "isWeekend", field: "<facts.field>" }`,
    category: "date",
    params: [],
    resolver: DateMatcher.isWeekend,
    async: false,
  },
  {
    name: "isWeekday",
    description: "Checks if a date falls on a weekday (Monday to Friday).",
    example: `{ "op": "isWeekday", field: "<facts.field>" }`,
    category: "date",
    params: [],
    resolver: DateMatcher.isWeekday,
    async: false,
  },
  {
    name: "isLeapYear",
    description: "Checks if a date's year is a leap year.",
    example: `{ "op": "isLeapYear", field: "<facts.field>" }`,
    category: "date",
    params: [],
    resolver: DateMatcher.isLeapYear,
    async: false,
  },
  {
    name: "isEmptyCollection",
    description: "Checks if a collection (array or object) is empty.",
    example: `{ "op": "isEmptyCollection", field: "<facts.field>" }`,
    category: "collection",
    params: [],
    resolver: CollectionChecker.isEmpty,
    async: false,
  },
  {
    name: "hasProperty",
    description: "Checks if an object has a specific property.",
    example: `{ "op": "hasProperty", field: "<facts.field>", params: { prop: "propertyName" } }`,
    category: "collection",
    params: ["prop"],
    resolver: CollectionChecker.hasProperty,
    async: false,
  },
  {
    name: "containsItem",
    description: "Checks if a collection contains a specific item.",
    example: `{ "op": "containsItem", field: "<facts.field>", params: { value: "item" } }`,
    category: "collection",
    params: ["value"],
    resolver: CollectionChecker.contains,
    async: false,
  },
  {
    name: "gt",
    description: "Checks if a value is greater than another value.",
    example: `{ "op": "gt", field: "<facts.field>", params: { value: 10 } }`,
    category: "comparison",
    params: ["value"],
    resolver: Comparison.isGreaterThan,
    async: false,
  },
  {
    name: "gte",
    description: "Checks if a value is greater than or equal to another value.",
    example: `{ "op": "gte", field: "<facts.field>", params: { value: 10 } }`,
    category: "comparison",
    params: ["value"],
    resolver: Comparison.isGreaterThanOrEqual,
    async: false,
  },
  {
    name: "lt",
    description: "Checks if a value is less than another value.",
    example: `{ "op": "lt", field: "<facts.field>", params: { value: 10 } }`,
    category: "comparison",
    params: ["value"],
    resolver: Comparison.isLessThan,
    async: false,
  },
  {
    name: "lte",
    description: "Checks if a value is less than or equal to another value.",
    example: `{ "op": "lte", field: "<facts.field>", params: { value: 10 } }`,
    category: "comparison",
    params: ["value"],
    resolver: Comparison.isLessThanOrEqual,
    async: false,
  },
  {
    name: "between",
    description: "Checks if a value is between two other values (inclusive).",
    example: `{ "op": "between", field: "<facts.field>", params: { min: 10, max: 20 } }`,
    category: "comparison",
    params: ["min", "max"],
    resolver: Comparison.between,
    async: false,
  },
  {
    name: "notBetween",
    description: "Checks if a value is not between two other values.",
    example: `{ "op": "notBetween", field: "<facts.field>", params: { min: 10, max: 20 } }`,
    category: "comparison",
    params: ["min", "max"],
    resolver: Comparison.notBetween,
    async: false,
  },
] as const;

/**
 * Optimized Map for O(1) helper lookups
 * Pre-built Map containing all helpers for fast access
 */
const HELPERS_MAP = new Map(
  AVAILABLE_HELPERS.map((helper) => [helper.name, helper]),
);

/**
 * Union type representing all available helper names.
 *
 * This type is dynamically derived from the AVAILABLE_HELPERS array,
 * ensuring type safety when referencing helper names throughout the application.
 *
 * @private
 * @since 1.0.0
 *
 */
type HelperName = (typeof AVAILABLE_HELPERS)[number]["name"];

/**
 * Utility type to extract parameter names for a specific helper.
 *
 * Given a helper name, this type extracts the parameter array from the
 * corresponding helper definition, enabling type-safe parameter handling.
 *
 * @template T - The helper name to extract parameters for
 * @private
 * @since 1.0.0
 *
 */
type GetHelperParams<T extends HelperName> = Extract<
  (typeof AVAILABLE_HELPERS)[number],
  { name: T }
>["params"];

/**
 * Discriminated union type representing all possible helper operations.
 *
 * This type provides compile-time type safety for helper operations by creating
 * a discriminated union where each helper has its specific parameter requirements.
 * Helpers with no parameters don't require a params object, while helpers with
 * parameters require a params object with the correct parameter names.
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
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
 *
 * const betweenHelper: Helper = {
 *   op: 'between',
 *   field: 'user.score',
 *   params: { min: 0, max: 100 }
 * };
 *
 * // Type errors for invalid configurations
 * const invalidHelper: Helper = {
 *   op: 'eq',
 *   field: 'user.age'
 *   // ✗ Missing required params for 'eq' operation
 * };
 * ```
 */
export type Helper = {
  [K in HelperName]: {
    op: K;
    field: string;
  } & (GetHelperParams<K> extends readonly []
    ? {}
    : { params: Record<GetHelperParams<K>[number], any> });
}[HelperName];

/**
 * Collection of helper actions for managing and retrieving helper schemas and resolvers.
 * Provides utilities to get available helpers and their corresponding resolver schemas.
 */
export const helpersActions = {
  /**
   * Retrieves all available helpers with their basic information.
   * Maps the available helpers to a simplified schema containing name, description, example, and category.
   *
   * @returns An array of HelperSchema objects containing helper metadata
   */
  getHelpers: (): HelperSchema[] => {
    const helpers: HelperSchema[] = AVAILABLE_HELPERS.map((helper) => {
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
   * Finds the helper with the given name and returns its resolver and async configuration.
   *
   * @template T - The helper name type extending HelperName
   * @param helperName - The name of the helper to retrieve the resolver schema for
   * @returns The HelperResolverSchema containing the resolver function and async flag
   * @throws {Error} When no helper with the specified name is found
   */
  getHelperResolverSchema: <T extends HelperName>(
    helperName: T,
  ): HelperResolverSchema => {
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
