import { ValidraResult } from './validra-result';

export interface ValidraCallback<T extends Record<string, any> = Record<string, any>> {
  name: string;
  callback: (result: ValidraResult<T>) => void;
}
