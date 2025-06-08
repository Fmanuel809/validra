import type { IDataExtractor } from '../interfaces/data-extractor.interface';
import type { IMemoryPoolManager } from '../interfaces/memory-pool-manager.interface';
import type { IRuleCompiler } from '../interfaces/rule-compiler.interface';
import type { IAsyncValidator } from '../interfaces/validators.interface';
import type { ValidraResult } from '../interfaces/validra-result';
import { Rule } from '../rule';

/**
 * AsyncValidator handles asynchronous validation operations
 * Implements IAsyncValidator interface following SOLID principles
 */
export class AsyncValidator implements IAsyncValidator {
  /**
   * Creates a new AsyncValidator instance.
   * @param ruleCompiler The rule compiler to use for compiling rules.
   * @param dataExtractor The data extractor for value extraction.
   * @param memoryPoolManager The memory pool manager for object reuse.
   */
  constructor(
    private readonly ruleCompiler: IRuleCompiler,
    private readonly dataExtractor: IDataExtractor,
    private readonly memoryPoolManager: IMemoryPoolManager,
  ) {}

  /**
   * Applies a single rule asynchronously to a value
   */
  async applyRuleAsync(rule: Rule, value: unknown, args: unknown[]): Promise<boolean> {
    console.debug(`Applying rule: ${rule} with value:`, value, 'and args:', args);
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          try {
            const compiledRules = this.ruleCompiler.compile([rule]);
            if (compiledRules.length === 0) {
              resolve(false);
              return;
            }
            const compiledRule = compiledRules[0];
            if (!compiledRule) {
              resolve(false);
              return;
            }
            // Ejecutar el helper y soportar helpers asíncronos
            const result = compiledRule.helper.apply(null, [value, ...args]);
            if (result && typeof result.then === 'function') {
              // Es una promesa
              result
                .then((isValid: boolean) => {
                  resolve(Boolean(rule.negative ? !isValid : isValid));
                })
                .catch(reject);
            } else {
              resolve(Boolean(rule.negative ? !result : result));
            }
          } catch (error) {
            reject(error);
          }
        }, 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Validates data against multiple rules asynchronously
   */
  async validateAsync<T extends Record<string, any>>(data: T, rules: Rule[]): Promise<ValidraResult<T>> {
    try {
      // Get validation result from pool
      const result = this.memoryPoolManager.get('validationResult', () => ({
        data,
        isValid: true,
      })) as ValidraResult<T>;

      // Reset result
      result.data = data;
      result.isValid = true;
      delete result.errors;
      delete result.message;

      // Compile rules
      const compiledRules = this.ruleCompiler.compile(rules);

      // Process rules sequentially
      for (const compiledRule of compiledRules) {
        try {
          // Extract value based on rule path
          const pathKey = compiledRule.original.field || '';
          const pathSegments = this.dataExtractor.getPathSegments(pathKey);
          const value = this.dataExtractor.getValue(data, pathSegments);

          // Get a reusable arguments array for helper params
          const args = this.memoryPoolManager.get('argumentsArray', () => []) as unknown[];
          args.length = 0; // Clear array
          // Extract params from rule into args
          const ruleParams = (compiledRule.original as any).params;
          if (ruleParams !== undefined && ruleParams !== null) {
            const values = Object.values(ruleParams) as unknown[];
            args.push(...values);
          }

          // Apply rule asynchronously
          const isValid = await this.applyRuleAsync(compiledRule.original, value, args);

          if (!isValid) {
            result.isValid = false;
            if (!result.errors) {
              result.errors = {} as any;
            }

            // Add error for this field
            const fieldErrors = (result.errors as any)[pathKey] || [];
            fieldErrors.push({
              message: `Validation failed for field: ${pathKey}`,
              code: 'ASYNC_VALIDATION_FAILED',
            });
            (result.errors as any)[pathKey] = fieldErrors;
          }

          // Return args to pool
          this.memoryPoolManager.return('argumentsArray', args, arr => {
            arr.length = 0;
          });
        } catch (error) {
          result.isValid = false;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (!result.errors) {
            result.errors = {} as any;
          }

          const fieldKey = compiledRule.original.field || 'unknown';
          const fieldErrors = (result.errors as any)[fieldKey] || [];
          fieldErrors.push({
            message: errorMessage,
            code: 'ASYNC_VALIDATION_ERROR',
          });
          (result.errors as any)[fieldKey] = fieldErrors;
        }
      }

      return result;
    } catch (error) {
      // Return error result
      return {
        data,
        isValid: false,
        message: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Validates multiple datasets concurrently
   */
  async validateMultipleAsync<T extends Record<string, any>>(
    datasets: T[],
    rules: Rule[],
    concurrency: number = 3,
  ): Promise<ValidraResult<T>[]> {
    const chunks = this.chunkArray(datasets, concurrency);
    const allResults: ValidraResult<T>[] = [];

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(data => this.validateAsync(data, rules));

      const chunkResults = await Promise.all(chunkPromises);
      allResults.push(...chunkResults);
    }

    return allResults;
  }

  /**
   * Utility method to chunk arrays for batch processing
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
