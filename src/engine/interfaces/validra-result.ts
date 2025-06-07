export interface ValidraResult<
  T extends Record<string, any> = Record<string, any>,
> {
  isValid: boolean;
  message?: string;
  errors?: ErrorResult<T>;
  data: T;
}

type ErrorResult<T extends Record<string, any>> = {
  [K in keyof T]?: [TError, ...TError[]];
};

type TError = {
  message: string;
  code?: string;
};
