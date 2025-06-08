import { ValidraResult } from './validra-result';

/**
 * A named callback for handling validation events in Validra.
 *
 * Use this interface to register custom logic that executes after a validation completes.
 *
 * @typeParam T - The type of the validated data object.
 *
 * @property name - Unique identifier for the callback.
 * @property callback - Function to execute, receiving the validation result.
 *
 * @example
 * const myCallback: ValidraCallback<User> = {
 *   name: 'onUserValidation',
 *   callback: (result) => {
 *     if (!result.isValid) {
 *       alert('User data is invalid!');
 *     }
 *   }
 * };
 */
export interface ValidraCallback<T extends Record<string, any> = Record<string, any>> {
  name: string;
  callback: (result: ValidraResult<T>) => void;
}
