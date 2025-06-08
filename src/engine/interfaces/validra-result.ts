/**
 * The result object returned by a Validra validation operation.
 *
 * Contains the validation status, optional message, error details, and the validated data.
 *
 * @typeParam T - The type of the validated data object.
 *
 * @example
 * const result: ValidraResult<User> = {
 *   isValid: false,
 *   message: 'Validation failed',
 *   errors: { email: [{ message: 'Invalid email' }] },
 *   data: { email: 'foo@bar', ... }
 * };
 */
export interface ValidraResult<T extends Record<string, any> = Record<string, any>> {
  /** True if the validation was successful */
  isValid: boolean;
  /** Optional message describing the validation result */
  message?: string;
  /** Optional errors found during validation, keyed by field */
  errors?: ErrorResult<T>;
  /** The validated data object */
  data: T;
}

/**
 * Error details for each field in the validated data.
 *
 * Each key corresponds to a field name, and the value is an array of error objects for that field.
 *
 * @typeParam T - The type of the validated data object.
 * @public
 */
export type ErrorResult<T extends Record<string, any>> = {
  [K in keyof T]?: [TError, ...TError[]];
};

/**
 * Represents a single validation error for a field.
 *
 * Contains a human-readable error message and an optional error code for programmatic handling.
 */
export type TError = {
  /** The error message describing the validation issue. */
  message: string;
  /** Optional error code for programmatic handling. */
  code?: string;
};
