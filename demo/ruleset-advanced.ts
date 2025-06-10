// Ruleset complejo para demo avanzada de Validra
import { Rule } from '../src/engine/rule';

export const advancedRules: Rule[] = [
  { op: 'isEmail', field: 'email' },
  { op: 'gte', field: 'age', params: { value: 18 } },
  { op: 'lte', field: 'age', params: { value: 80 } },
  { op: 'isEmpty', field: 'name', negative: true },
  { op: 'regexMatch', field: 'address', params: { regex: '^Calle' } },
  { op: 'between', field: 'score', params: { min: 0, max: 100 } },
  { op: 'isString', field: 'type' }, // Cambiado: ahora acepta cualquier string (A o B)
  { op: 'gte', field: 'balance', params: { value: 0 } },
  { op: 'lte', field: 'zip', params: { value: 99999 } },
  { op: 'minLength', field: 'notes', params: { value: 5 } },
  { op: 'isArray', field: 'tags' },
  { op: 'isObject', field: 'meta' },
  { op: 'isBoolean', field: 'isActive' },
  { op: 'isString', field: 'country' },
  { op: 'isString', field: 'ref' },
  { op: 'isObject', field: 'extra' },
  { op: 'isArray', field: 'children' },
  { op: 'isBoolean', field: 'verified' },
  { op: 'regexMatch', field: 'phone', params: { regex: '^555-' } },
  { op: 'regexMatch', field: 'created', params: { regex: '^\\d{4}-\\d{2}-\\d{2}T' } },
];
