/**
 * @fileoverview Provides comprehensive collection validation and manipulation utilities
 * @module CollectionChecker
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { TypeChecker } from "./type-checker";

/**
 * Utility class providing static methods for collection validation and property checking operations.
 * Supports both arrays and objects as collections, providing consistent interfaces for
 * common collection operations.
 * 
 * @public
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Array operations
 * CollectionChecker.isEmpty([]); // true
 * CollectionChecker.contains([1, 2, 3], 2); // true
 * 
 * // Object operations
 * CollectionChecker.isEmpty({}); // true
 * CollectionChecker.hasProperty({ name: 'John' }, 'name'); // true
 * CollectionChecker.contains({ a: 1, b: 2 }, 2); // true
 * ```
 */
export class CollectionChecker {
    /**
     * Checks if a collection (array or object) is empty.
     * For arrays, checks if length is 0. For objects, checks if there are no enumerable properties
     * and no symbol properties.
     * 
     * @public
     * @static
     * @param {any[] | Record<string, any>} collection - The collection to check for emptiness
     * @returns {boolean} True if the collection is empty, false otherwise
     * @throws {string} Throws if the input is neither an array nor an object
     * 
     * @example
     * ```typescript
     * // Array examples
     * CollectionChecker.isEmpty([]); // true
     * CollectionChecker.isEmpty([1, 2, 3]); // false
     * 
     * // Object examples
     * CollectionChecker.isEmpty({}); // true
     * CollectionChecker.isEmpty({ name: 'John' }); // false
     * 
     * // Symbol properties are also considered
     * const sym = Symbol('test');
     * CollectionChecker.isEmpty({ [sym]: 'value' }); // false
     * 
     * // Error cases
     * CollectionChecker.isEmpty('string'); // throws: 'Input must be an array or an object.'
     * CollectionChecker.isEmpty(42); // throws: 'Input must be an array or an object.'
     * ```
     * 
     * @since 1.0.0
     */
    static isEmpty(collection: any[] | Record<string, any>): boolean {
        if (Array.isArray(collection)) {
            return collection.length === 0;
        } else if (TypeChecker.isObject(collection)) {
            return Object.keys(collection).length === 0 && Object.getOwnPropertySymbols(collection).length === 0;
        } else {
            throw 'Input must be an array or an object.';
        }
    }

    /**
     * Checks if an object has one or more specified properties.
     * Can check for a single property or multiple properties at once.
     * Uses the 'in' operator to check for property existence, including inherited properties.
     * 
     * @public
     * @static
     * @param {Record<string, any>} value - The object to check for properties
     * @param {string | string[]} prop - The property name(s) to check for
     * @returns {boolean} True if all specified properties exist in the object, false otherwise
     * @throws {string} Throws if the value is not an object
     * 
     * @example
     * ```typescript
     * const person = { name: 'John', age: 30, city: 'New York' };
     * 
     * // Single property checks
     * CollectionChecker.hasProperty(person, 'name'); // true
     * CollectionChecker.hasProperty(person, 'email'); // false
     * 
     * // Multiple property checks
     * CollectionChecker.hasProperty(person, ['name', 'age']); // true
     * CollectionChecker.hasProperty(person, ['name', 'email']); // false
     * 
     * // Error cases
     * CollectionChecker.hasProperty('not an object', 'prop'); // throws: 'Value must be an object.'
     * CollectionChecker.hasProperty(null, 'prop'); // throws: 'Value must be an object.'
     * ```
     * 
     * @since 1.0.0
     */
    static hasProperty(value: Record<string, any>, prop: string | string[]): boolean {
        if (!TypeChecker.isObject(value)) {
            throw 'Value must be an object.';
        }

        if (Array.isArray(prop)) {
            return prop.every(p => p in value);
        } else {
            return prop in value;
        }        
    }

    /**
     * Checks if a collection (array or object) contains a specific item.
     * For arrays, uses the includes() method. For objects, checks if any of the object's values
     * matches the specified item using strict equality (===).
     * 
     * @public
     * @static
     * @param {any[] | Record<string, any>} collection - The collection to search in
     * @param {any} item - The item to search for
     * @returns {boolean} True if the item is found in the collection, false otherwise
     * @throws {string} Throws if the collection is neither an array nor an object
     * 
     * @example
     * ```typescript
     * // Array examples
     * CollectionChecker.contains([1, 2, 3, 4], 3); // true
     * CollectionChecker.contains(['apple', 'banana'], 'orange'); // false
     * 
     * // Object examples (checks values, not keys)
     * CollectionChecker.contains({ a: 1, b: 2, c: 3 }, 2); // true
     * CollectionChecker.contains({ name: 'John', age: 30 }, 'John'); // true
     * CollectionChecker.contains({ name: 'John', age: 30 }, 'name'); // false (key, not value)
     * 
     * // Complex objects
     * const users = { user1: { id: 1 }, user2: { id: 2 } };
     * CollectionChecker.contains(users, { id: 1 }); // false (different object references)
     * 
     * // Error cases
     * CollectionChecker.contains('string', 'item'); // throws: 'Input must be an array or an object.'
     * CollectionChecker.contains(42, 'item'); // throws: 'Input must be an array or an object.'
     * ```
     * 
     * @since 1.0.0
     */
    static contains(collection: any[] | Record<string, any>, item: any): boolean {
        if (Array.isArray(collection)) {
            return collection.includes(item);
        } else if (TypeChecker.isObject(collection)) {
            return Object.values(collection).includes(item);
        } else {
            throw 'Input must be an array or an object.';
        }
    }
}