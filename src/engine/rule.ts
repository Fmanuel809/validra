import { Helper } from '@/dsl';

export type Rule = Helper & {
  message?: string;
  code?: string;
  negative?: boolean;
};
