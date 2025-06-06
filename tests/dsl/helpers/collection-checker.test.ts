/**
 * @fileoverview Comprehensive test suite for CollectionChecker utility class
 * @module CollectionCheckerTests
 * @version 1.0.0
 * @author Felix M. Martinez
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { CollectionChecker } from '../../../src/dls/helpers/collection-checker';

describe('CollectionChecker', () => {
    describe('isEmpty', () => {
        describe('Array tests', () => {
            it('should return true for empty arrays', () => {
                expect(CollectionChecker.isEmpty([])).toBe(true);
            });

            it('should return false for non-empty arrays', () => {
                expect(CollectionChecker.isEmpty([1])).toBe(false);
                expect(CollectionChecker.isEmpty([1, 2, 3])).toBe(false);
                expect(CollectionChecker.isEmpty(['a', 'b'])).toBe(false);
                expect(CollectionChecker.isEmpty([null])).toBe(false);
                expect(CollectionChecker.isEmpty([undefined])).toBe(false);
                expect(CollectionChecker.isEmpty([false])).toBe(false);
                expect(CollectionChecker.isEmpty([0])).toBe(false);
            });

            it('should handle arrays with mixed types', () => {
                expect(CollectionChecker.isEmpty([1, 'string', null, undefined, {}])).toBe(false);
                expect(CollectionChecker.isEmpty([[], {}])).toBe(false);
            });

            it('should handle nested arrays', () => {
                expect(CollectionChecker.isEmpty([[]])).toBe(false);
                expect(CollectionChecker.isEmpty([[1, 2], [3, 4]])).toBe(false);
            });
        });

        describe('Object tests', () => {
            it('should return true for empty objects', () => {
                expect(CollectionChecker.isEmpty({})).toBe(true);
                expect(CollectionChecker.isEmpty(Object.create(null))).toBe(true);
            });

            it('should return false for non-empty objects', () => {
                expect(CollectionChecker.isEmpty({ a: 1 })).toBe(false);
                expect(CollectionChecker.isEmpty({ name: 'John', age: 30 })).toBe(false);
                expect(CollectionChecker.isEmpty({ 0: 'zero' })).toBe(false);
                expect(CollectionChecker.isEmpty({ null: null })).toBe(false);
                expect(CollectionChecker.isEmpty({ undefined: undefined })).toBe(false);
            });

            it('should handle objects with various property types', () => {
                expect(CollectionChecker.isEmpty({ 
                    string: 'value',
                    number: 42,
                    boolean: true,
                    array: [],
                    object: {},
                    null: null,
                    undefined: undefined
                })).toBe(false);
            });

            it('should not count inherited properties', () => {
                const parent = { inherited: 'value' };
                const child = Object.create(parent);
                expect(CollectionChecker.isEmpty(child)).toBe(true);
                
                child.own = 'property';
                expect(CollectionChecker.isEmpty(child)).toBe(false);
            });

            it('should handle objects with symbol keys', () => {
                const sym = Symbol('test');
                const obj = { [sym]: 'value' };
                expect(CollectionChecker.isEmpty(obj)).toBe(false);
            });
        });

        describe('Error handling', () => {
            it('should throw error for invalid input types', () => {
                expect(() => CollectionChecker.isEmpty('string' as any)).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.isEmpty(42 as any)).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.isEmpty(true as any)).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.isEmpty(null as any)).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.isEmpty(undefined as any)).toThrow('Input must be an array or an object.');
            });

            it('should handle edge cases', () => {
                // Date and RegExp are treated as objects by TypeChecker.isObject()
                expect(CollectionChecker.isEmpty(new Date() as any)).toBe(true); // Date has no enumerable properties
                expect(CollectionChecker.isEmpty(/regex/ as any)).toBe(true); // RegExp has no enumerable properties
                expect(() => CollectionChecker.isEmpty(function() {} as any)).toThrow('Input must be an array or an object.');
            });
        });
    });

    describe('hasProperty', () => {
        const testObject = {
            name: 'John',
            age: 30,
            city: 'New York',
            hobbies: ['reading', 'coding'],
            address: {
                street: '123 Main St',
                zip: '10001'
            },
            isActive: true,
            score: 0,
            data: null,
            info: undefined
        };

        describe('Single property checks', () => {
            it('should return true for existing properties', () => {
                expect(CollectionChecker.hasProperty(testObject, 'name')).toBe(true);
                expect(CollectionChecker.hasProperty(testObject, 'age')).toBe(true);
                expect(CollectionChecker.hasProperty(testObject, 'hobbies')).toBe(true);
                expect(CollectionChecker.hasProperty(testObject, 'address')).toBe(true);
            });

            it('should return true for properties with falsy values', () => {
                expect(CollectionChecker.hasProperty(testObject, 'score')).toBe(true); // 0
                expect(CollectionChecker.hasProperty(testObject, 'data')).toBe(true); // null
                expect(CollectionChecker.hasProperty(testObject, 'info')).toBe(true); // undefined
            });

            it('should return false for non-existing properties', () => {
                expect(CollectionChecker.hasProperty(testObject, 'email')).toBe(false);
                expect(CollectionChecker.hasProperty(testObject, 'phone')).toBe(false);
                expect(CollectionChecker.hasProperty(testObject, 'nonExistent')).toBe(false);
            });

            it('should handle numeric property names', () => {
                const obj = { 0: 'zero', 1: 'one', '2': 'two' };
                expect(CollectionChecker.hasProperty(obj, '0')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, '1')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, '2')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, '3')).toBe(false);
            });

            it('should handle special property names', () => {
                const obj = { 
                    '': 'empty',
                    ' ': 'space',
                    'key with spaces': 'value',
                    'key-with-dashes': 'value',
                    'key_with_underscores': 'value'
                };
                expect(CollectionChecker.hasProperty(obj, '')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, ' ')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, 'key with spaces')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, 'key-with-dashes')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, 'key_with_underscores')).toBe(true);
            });
        });

        describe('Multiple property checks', () => {
            it('should return true when all properties exist', () => {
                expect(CollectionChecker.hasProperty(testObject, ['name', 'age'])).toBe(true);
                expect(CollectionChecker.hasProperty(testObject, ['name', 'age', 'city'])).toBe(true);
                expect(CollectionChecker.hasProperty(testObject, ['score', 'data', 'info'])).toBe(true);
            });

            it('should return false when any property is missing', () => {
                expect(CollectionChecker.hasProperty(testObject, ['name', 'email'])).toBe(false);
                expect(CollectionChecker.hasProperty(testObject, ['name', 'age', 'phone'])).toBe(false);
                expect(CollectionChecker.hasProperty(testObject, ['nonExistent'])).toBe(false);
            });

            it('should handle empty property arrays', () => {
                expect(CollectionChecker.hasProperty(testObject, [])).toBe(true);
            });

            it('should handle duplicate properties in array', () => {
                expect(CollectionChecker.hasProperty(testObject, ['name', 'name', 'age'])).toBe(true);
                expect(CollectionChecker.hasProperty(testObject, ['name', 'email', 'email'])).toBe(false);
            });
        });

        describe('Inherited properties', () => {
            it('should detect inherited properties', () => {
                const parent = { inherited: 'value' };
                const child = Object.create(parent);
                child.own = 'property';

                expect(CollectionChecker.hasProperty(child, 'own')).toBe(true);
                expect(CollectionChecker.hasProperty(child, 'inherited')).toBe(true);
                expect(CollectionChecker.hasProperty(child, ['own', 'inherited'])).toBe(true);
            });

            it('should detect Object.prototype properties', () => {
                const obj = { custom: 'value' };
                expect(CollectionChecker.hasProperty(obj, 'toString')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, 'hasOwnProperty')).toBe(true);
                expect(CollectionChecker.hasProperty(obj, 'valueOf')).toBe(true);
            });
        });

        describe('Symbol properties', () => {
            it('should handle symbol properties', () => {
                const sym1 = Symbol('test1');
                const sym2 = Symbol('test2');
                const obj = { 
                    [sym1]: 'value1',
                    [sym2]: 'value2',
                    regular: 'value'
                };

                expect(CollectionChecker.hasProperty(obj, 'regular')).toBe(true);
                // Note: Symbol properties require the actual symbol reference
                expect(CollectionChecker.hasProperty(obj, sym1 as any)).toBe(true);
                expect(CollectionChecker.hasProperty(obj, sym2 as any)).toBe(true);
            });
        });

        describe('Error handling', () => {
            it('should throw error for non-object values', () => {
                expect(() => CollectionChecker.hasProperty('string' as any, 'prop')).toThrow('Value must be an object.');
                expect(() => CollectionChecker.hasProperty(42 as any, 'prop')).toThrow('Value must be an object.');
                expect(() => CollectionChecker.hasProperty(true as any, 'prop')).toThrow('Value must be an object.');
                expect(() => CollectionChecker.hasProperty(null as any, 'prop')).toThrow('Value must be an object.');
                expect(() => CollectionChecker.hasProperty(undefined as any, 'prop')).toThrow('Value must be an object.');
                expect(() => CollectionChecker.hasProperty([] as any, 'prop')).toThrow('Value must be an object.');
            });

            it('should handle edge case objects', () => {
                // Date and RegExp are treated as valid objects by TypeChecker.isObject()
                expect(CollectionChecker.hasProperty(new Date() as any, 'prop')).toBe(false); // Date doesn't have 'prop'
                expect(CollectionChecker.hasProperty(/regex/ as any, 'prop')).toBe(false); // RegExp doesn't have 'prop'
                expect(() => CollectionChecker.hasProperty(function() {} as any, 'prop')).toThrow('Value must be an object.');
            });
        });
    });

    describe('contains', () => {
        describe('Array tests', () => {
            it('should return true for existing items in arrays', () => {
                expect(CollectionChecker.contains([1, 2, 3], 2)).toBe(true);
                expect(CollectionChecker.contains(['a', 'b', 'c'], 'b')).toBe(true);
                expect(CollectionChecker.contains([true, false], true)).toBe(true);
                expect(CollectionChecker.contains([null, undefined], null)).toBe(true);
                expect(CollectionChecker.contains([null, undefined], undefined)).toBe(true);
            });

            it('should return false for non-existing items in arrays', () => {
                expect(CollectionChecker.contains([1, 2, 3], 4)).toBe(false);
                expect(CollectionChecker.contains(['a', 'b', 'c'], 'd')).toBe(false);
                expect(CollectionChecker.contains([true, false], 'true')).toBe(false);
                expect(CollectionChecker.contains([1, 2, 3], '2')).toBe(false); // Type mismatch
            });

            it('should handle arrays with mixed types', () => {
                const mixedArray = [1, 'string', true, null, undefined, {}, []];
                expect(CollectionChecker.contains(mixedArray, 1)).toBe(true);
                expect(CollectionChecker.contains(mixedArray, 'string')).toBe(true);
                expect(CollectionChecker.contains(mixedArray, true)).toBe(true);
                expect(CollectionChecker.contains(mixedArray, null)).toBe(true);
                expect(CollectionChecker.contains(mixedArray, undefined)).toBe(true);
                expect(CollectionChecker.contains(mixedArray, 'notFound')).toBe(false);
            });

            it('should handle object references in arrays', () => {
                const obj1 = { id: 1 };
                const obj2 = { id: 2 };
                const array = [obj1, obj2];

                expect(CollectionChecker.contains(array, obj1)).toBe(true);
                expect(CollectionChecker.contains(array, obj2)).toBe(true);
                expect(CollectionChecker.contains(array, { id: 1 })).toBe(false); // Different reference
                expect(CollectionChecker.contains(array, { id: 2 })).toBe(false); // Different reference
            });

            it('should handle nested arrays', () => {
                const nestedArray = [[1, 2], [3, 4], 'string'];
                const subArray1 = [1, 2];
                const subArray2 = [3, 4];

                expect(CollectionChecker.contains(nestedArray, 'string')).toBe(true);
                expect(CollectionChecker.contains(nestedArray, subArray1)).toBe(false); // Different reference
                expect(CollectionChecker.contains(nestedArray, [1, 2])).toBe(false); // Different reference
                
                // But the actual references work
                const actualSub = nestedArray[0];
                expect(CollectionChecker.contains(nestedArray, actualSub)).toBe(true);
            });

            it('should handle empty arrays', () => {
                expect(CollectionChecker.contains([], 'anything')).toBe(false);
                expect(CollectionChecker.contains([], null)).toBe(false);
                expect(CollectionChecker.contains([], undefined)).toBe(false);
            });
        });

        describe('Object tests', () => {
            const testObject = {
                name: 'John',
                age: 30,
                isActive: true,
                score: 0,
                data: null,
                info: undefined,
                hobbies: ['reading', 'coding']
            };

            it('should return true for existing values in objects', () => {
                expect(CollectionChecker.contains(testObject, 'John')).toBe(true);
                expect(CollectionChecker.contains(testObject, 30)).toBe(true);
                expect(CollectionChecker.contains(testObject, true)).toBe(true);
                expect(CollectionChecker.contains(testObject, 0)).toBe(true);
                expect(CollectionChecker.contains(testObject, null)).toBe(true);
                expect(CollectionChecker.contains(testObject, undefined)).toBe(true);
            });

            it('should return false for non-existing values in objects', () => {
                expect(CollectionChecker.contains(testObject, 'Jane')).toBe(false);
                expect(CollectionChecker.contains(testObject, 25)).toBe(false);
                expect(CollectionChecker.contains(testObject, false)).toBe(false);
                expect(CollectionChecker.contains(testObject, 'name')).toBe(false); // Key, not value
                expect(CollectionChecker.contains(testObject, 'age')).toBe(false); // Key, not value
            });

            it('should check values, not keys', () => {
                const obj = { 
                    key1: 'value1',
                    key2: 'value2',
                    value1: 'key1' // Confusing but valid
                };

                expect(CollectionChecker.contains(obj, 'value1')).toBe(true); // Found as value
                expect(CollectionChecker.contains(obj, 'value2')).toBe(true); // Found as value
                expect(CollectionChecker.contains(obj, 'key1')).toBe(true); // Found as value in value1 property
                expect(CollectionChecker.contains(obj, 'key2')).toBe(false); // Only exists as key, not value
            });

            it('should handle object references as values', () => {
                const ref1 = { id: 1 };
                const ref2 = { id: 2 };
                const obj = {
                    ref1: ref1,
                    ref2: ref2,
                    clone: { id: 1 }
                };

                expect(CollectionChecker.contains(obj, ref1)).toBe(true);
                expect(CollectionChecker.contains(obj, ref2)).toBe(true);
                expect(CollectionChecker.contains(obj, { id: 1 })).toBe(false); // Different reference
                expect(CollectionChecker.contains(obj, { id: 2 })).toBe(false); // Different reference
            });

            it('should handle arrays as values', () => {
                const arr1 = [1, 2, 3];
                const arr2 = ['a', 'b'];
                const obj = {
                    numbers: arr1,
                    letters: arr2,
                    copy: [1, 2, 3]
                };

                expect(CollectionChecker.contains(obj, arr1)).toBe(true);
                expect(CollectionChecker.contains(obj, arr2)).toBe(true);
                expect(CollectionChecker.contains(obj, [1, 2, 3])).toBe(false); // Different reference
            });

            it('should handle empty objects', () => {
                expect(CollectionChecker.contains({}, 'anything')).toBe(false);
                expect(CollectionChecker.contains({}, null)).toBe(false);
                expect(CollectionChecker.contains({}, undefined)).toBe(false);
            });
        });

        describe('Error handling', () => {
            it('should throw error for invalid collection types', () => {
                expect(() => CollectionChecker.contains('string' as any, 'item')).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.contains(42 as any, 'item')).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.contains(true as any, 'item')).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.contains(null as any, 'item')).toThrow('Input must be an array or an object.');
                expect(() => CollectionChecker.contains(undefined as any, 'item')).toThrow('Input must be an array or an object.');
            });

            it('should handle edge case inputs', () => {
                // Date and RegExp are treated as valid objects by TypeChecker.isObject()
                expect(CollectionChecker.contains(new Date() as any, 'item')).toBe(false); // Date has no values containing 'item'
                expect(CollectionChecker.contains(/regex/ as any, 'item')).toBe(false); // RegExp has no values containing 'item'
                expect(() => CollectionChecker.contains(function() {} as any, 'item')).toThrow('Input must be an array or an object.');
            });
        });

        describe('Type coercion and edge cases', () => {
            it('should use strict equality for comparisons', () => {
                expect(CollectionChecker.contains([0], false)).toBe(false);
                expect(CollectionChecker.contains([1], true)).toBe(false);
                expect(CollectionChecker.contains([''], 0)).toBe(false);
                expect(CollectionChecker.contains([null], undefined)).toBe(false);
                expect(CollectionChecker.contains([undefined], null)).toBe(false);
            });

            it('should handle NaN correctly', () => {
                expect(CollectionChecker.contains([NaN], NaN)).toBe(true);
                expect(CollectionChecker.contains({ a: NaN }, NaN)).toBe(true);
                expect(CollectionChecker.contains([NaN], 'NaN')).toBe(false);
            });

            it('should handle -0 and +0', () => {
                expect(CollectionChecker.contains([0], -0)).toBe(true);
                expect(CollectionChecker.contains([-0], 0)).toBe(true);
                expect(CollectionChecker.contains({ a: 0 }, -0)).toBe(true);
                expect(CollectionChecker.contains({ a: -0 }, 0)).toBe(true);
            });
        });
    });

    describe('Integration tests', () => {
        it('should work with complex nested structures', () => {
            const complexData = {
                users: [
                    { id: 1, name: 'John', roles: ['admin', 'user'] },
                    { id: 2, name: 'Jane', roles: ['user'] }
                ],
                settings: {
                    theme: 'dark',
                    notifications: true
                },
                metadata: null
            };

            // Test isEmpty with nested structures
            expect(CollectionChecker.isEmpty(complexData)).toBe(false);
            expect(CollectionChecker.isEmpty(complexData.users)).toBe(false);
            expect(CollectionChecker.isEmpty(complexData.settings)).toBe(false);

            // Test hasProperty with nested structures
            expect(CollectionChecker.hasProperty(complexData, 'users')).toBe(true);
            expect(CollectionChecker.hasProperty(complexData, ['users', 'settings', 'metadata'])).toBe(true);
            expect(CollectionChecker.hasProperty(complexData.settings, 'theme')).toBe(true);

            // Test contains with nested structures
            expect(CollectionChecker.contains(complexData, null)).toBe(true); // metadata value
            expect(CollectionChecker.contains(complexData.settings, 'dark')).toBe(true);
            expect(CollectionChecker.contains(complexData.settings, true)).toBe(true);
        });

        it('should handle method chaining scenarios', () => {
            const data = {
                items: [1, 2, 3],
                empty: [],
                config: { enabled: true }
            };

            // Combine multiple checks
            const hasItems = CollectionChecker.hasProperty(data, 'items') && 
                            !CollectionChecker.isEmpty(data.items);
            expect(hasItems).toBe(true);

            const hasEmptyItems = CollectionChecker.hasProperty(data, 'empty') && 
                                 CollectionChecker.isEmpty(data.empty);
            expect(hasEmptyItems).toBe(true);

            const isConfigured = CollectionChecker.hasProperty(data, 'config') &&
                                CollectionChecker.contains(data.config, true);
            expect(isConfigured).toBe(true);
        });
    });
});
