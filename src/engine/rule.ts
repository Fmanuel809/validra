import { Helper } from '@/dsl';

/**
 * Represents a validation rule in Validra.
 *
 * Extends a helper definition with optional message, code, and negative flag for advanced rule configuration.
 *
 * @example
 * const rule: Rule = {
 *   op: 'isEmail',
 *   field: 'user.email',
 *   message: 'Invalid email address',
 *   code: 'EMAIL_INVALID',
 *   negative: false
 * };
 */
export type Rule = Helper & {
  /** Optional custom error message for the rule. */
  message?: string;
  /** Optional error code for the rule. */
  code?: string;
  /** If true, the rule logic is negated (NOT). */
  negative?: boolean;
};
