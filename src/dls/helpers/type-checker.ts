
export class TypeChecker {
    
    static isString(value: unknown): boolean {
        return typeof value === 'string';
    }

    static isDate(value: unknown): boolean {
        return value instanceof Date;
    }

    static isNumber(value: unknown): boolean {
        return typeof value === 'number' && !isNaN(value);
    }

    static isBoolean(value: unknown): boolean {
        return typeof value === 'boolean';
    }

    isArray(value: unknown): boolean {
        return Array.isArray(value);
    }

    static isObject(value: unknown): boolean {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }    
}