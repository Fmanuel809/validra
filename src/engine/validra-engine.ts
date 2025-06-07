import { helpersActions, Helper } from "@/dls";
import { ValidraCallback, ValidraEngineOptions, ValidraResult } from "./interfaces";
import { Rule } from "./rule";
import { ValidraLogger } from "@/utils/validra-logger";

/**
 * Interface for compiled rules with pre-computed data
 */
interface CompiledRule {
  original: Rule;
  helper: any;
  pathSegments: string[];
  hasParams: boolean;
}

export class ValidraEngine {
  private rules: Rule[];
  private callbacks: ValidraCallback[];
  private options: ValidraEngineOptions;
  private helperCache = new Map<string, any>();
  private compiledRules: CompiledRule[] = [];
  private logger: ValidraLogger;

  constructor(
    rules: Rule[], 
    callbacks: ValidraCallback[] = [],
    options: ValidraEngineOptions = {}
  ) {
    this.rules = rules;
    this.callbacks = callbacks;
    this.options = {
      debug: false,
      throwOnUnknownField: false,
      allowPartialValidation: false,
      ...options
    };

    // Initialize logger
    this.logger = new ValidraLogger("ValidraEngine");

    // Compile rules for optimization
    this.compiledRules = this.compileRules(rules);
    
    // Preload helpers used by rules
    this.preloadHelpers();

    this.logger.info(`Engine initialized with ${rules.length} rules`, {
      debug: this.options.debug,
      rulesCount: rules.length,
      callbacksCount: callbacks.length
    });
  }

  public validate<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void),
    options?: { failFast?: boolean; maxErrors?: number }
  ): ValidraResult<T> {
    const startTime = performance.now();
    
    // Validación de entrada
    if (!data || typeof data !== 'object') {
      this.logger.error('Invalid data provided for validation', { 
        dataType: typeof data,
        isNull: data === null 
      });
    }

    if (this.compiledRules.length === 0) {
      this.debugLog(() => 'No rules defined, validation passed');
      return { isValid: true, data };
    }

    const { failFast = false, maxErrors = Infinity } = options || {};
    const result: ValidraResult<T> = {
      isValid: true,
      data: data,
      errors: {}
    };
    let errorCount = 0;

    this.debugLog(() => `Starting validation with ${this.compiledRules.length} rules`, {
      failFast,
      maxErrors,
      dataKeys: Object.keys(data)
    });

    for (const compiledRule of this.compiledRules) {
      try {
        const value = this.getValue(data, compiledRule.pathSegments);
        
        // Validar campo desconocido si está habilitado
        if (this.options.throwOnUnknownField && value === undefined && compiledRule.pathSegments.length === 1) {
          this.logger.error(`Unknown field: ${compiledRule.original.field}`);
        }
        
        const isValid = this.applyRule(compiledRule, value);

        this.debugLog(() => 
          `Rule ${compiledRule.original.op} on field ${compiledRule.original.field}: ${isValid ? 'PASS' : 'FAIL'}`,
          { value, hasValue: value !== undefined }
        );

        if (!isValid) {
          result.isValid = false;
          this.addError(result, compiledRule.original);
          errorCount++;
          
          if (failFast || errorCount >= maxErrors) {
            this.debugLog(() => `Stopping validation early`, {
              reason: failFast ? 'failFast' : 'maxErrors',
              errorCount
            });
            break;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Error applying rule ${compiledRule.original.op} on field ${compiledRule.original.field}`, {
          error: errorMessage,
          rule: compiledRule.original
        });
        
        if (!this.options.allowPartialValidation) {
          this.logger.error(`Rule validation failed for field "${compiledRule.original.field}"`, {
            error: errorMessage
          });
        }
        
        result.isValid = false;
        this.addError(result, compiledRule.original, `Validation error: ${errorMessage}`);
        errorCount++;
        
        if (failFast || errorCount >= maxErrors) {
          break;
        }
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.debugLog(() => `Validation completed in ${duration.toFixed(2)}ms`, {
      isValid: result.isValid,
      errorCount,
      duration: `${duration.toFixed(2)}ms`,
      errorsFound: result.errors ? Object.keys(result.errors) : []
    });

    // Log warning para validaciones lentas
    if (duration > 100) {
      this.logger.warn(`Slow validation detected`, {
        duration: `${duration.toFixed(2)}ms`,
        rulesCount: this.compiledRules.length,
        dataSize: JSON.stringify(data).length
      });
    }

    // Ejecutar callback si se proporciona
    this.executeCallback(callback, result);

    return result;
  }

  public async validateAsync<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void | Promise<void>)
  ): Promise<ValidraResult<T>> {
    const startTime = performance.now();
    
    // Validación de entrada
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    if (this.compiledRules.length === 0) {
      this.debugLog(() => 'No rules defined, validation passed');
      return { isValid: true, data };
    }

    const result: ValidraResult<T> = {
      isValid: true,
      data: data,
      errors: {}
    };

    this.debugLog(() => `Starting async validation with ${this.compiledRules.length} rules`);

    for (const compiledRule of this.compiledRules) {
      try {
        const value = this.getValue(data, compiledRule.pathSegments);
        
        // Validar campo desconocido si está habilitado
        if (this.options.throwOnUnknownField && value === undefined && compiledRule.pathSegments.length === 1) {
          throw new Error(`Unknown field: ${compiledRule.original.field}`);
        }
        
        const isValid = await this.applyRuleAsync(compiledRule, value);

        this.debugLog(() => `Rule ${compiledRule.original.op} on field ${compiledRule.original.field}: ${isValid ? 'PASS' : 'FAIL'}`);

        if (!isValid) {
          result.isValid = false;
          this.addError(result, compiledRule.original);
        }
      } catch (error) {
        this.debugLog(() => `Error applying rule ${compiledRule.original.op} on field ${compiledRule.original.field}: ${(error as Error).message}`);
        
        if (!this.options.allowPartialValidation) {
          throw new Error(`Rule validation failed for field "${compiledRule.original.field}": ${(error as Error).message}`);
        }
        
        // En modo parcial, tratar como error de validación
        result.isValid = false;
        this.addError(result, compiledRule.original, `Validation error: ${(error as Error).message}`);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.debugLog(() => `Async validation completed in ${duration.toFixed(2)}ms. Result: ${result.isValid ? 'VALID' : 'INVALID'}`);

    // Ejecutar callback si se proporciona
    await this.executeCallbackAsync(callback, result);

    return result;
  }

  private getHelper(op: string) {
    if (!this.helperCache.has(op)) {
      try {
        // Hacer casting seguro para el tipo esperado por la API
        const helper = helpersActions.getHelperResolverSchema(op as any);
        this.helperCache.set(op, helper);
      } catch (error) {
        // Si el helper no existe, cachear null para evitar búsquedas repetidas
        this.helperCache.set(op, null);
      }
    }
    return this.helperCache.get(op);
  }

  /**
   * Optimized getValue with pre-computed path segments
   */
  private getValue(data: any, pathSegments: string[]): unknown {
    if (pathSegments.length === 1 && pathSegments[0]) {
      return data?.[pathSegments[0]];
    }
    
    let current = data;
    for (const segment of pathSegments) {
      if (current == null) return undefined;
      current = current[segment];
    }
    return current;
  }

  /**
   * Optimized addError with reduced object access
   */
  private addError<T extends Record<string, any>>(result: ValidraResult<T>, rule: Rule, customMessage?: string): void {
    if (!result.errors) {
      result.errors = {} as any;
    }
    
    const errors = result.errors!;
    const field = rule.field as keyof T;
    const fieldErrors = errors[field] || (errors[field] = [] as any);
    
    (fieldErrors as any[]).push({
      message: customMessage || rule.message || `Validation [${rule.op}] failed for ${rule.field}`,
      code: rule.code || "VALIDATION_ERROR",
    });
  }

  private executeCallback<T extends Record<string, any>>(
    callback: string | ((result: ValidraResult<T>) => void) | undefined,
    result: ValidraResult<T>
  ): void {
    if (!callback) return;

    if (typeof callback === "string") {
      const cb = this.callbacks.find((cb) => cb.name === callback);
      if (cb) {
        cb.callback(result as ValidraResult<Record<string, any>>);
      } else {
        throw new Error(`Callback with name "${callback}" not found.`);
      }
    } else if (typeof callback === "function") {
      callback(result);
    } else {
      throw new Error("Callback must be a string or a function.");
    }
  }

  private async executeCallbackAsync<T extends Record<string, any>>(
    callback: string | ((result: ValidraResult<T>) => void | Promise<void>) | undefined,
    result: ValidraResult<T>
  ): Promise<void> {
    if (!callback) return;

    if (typeof callback === "string") {
      const cb = this.callbacks.find((cb) => cb.name === callback);
      if (cb) {
        await cb.callback(result as ValidraResult<Record<string, any>>);
      } else {
        throw new Error(`Callback with name "${callback}" not found.`);
      }
    } else if (typeof callback === "function") {
      await callback(result);
    } else {
      throw new Error("Callback must be a string or a function.");
    }
  }

  /**
   * Compile rules for optimization during constructor
   */
  private compileRules(rules: Rule[]): CompiledRule[] {
    const startTime = performance.now();
    
    const compiled = rules.map((rule, index) => {
      const helper = helpersActions.getHelperResolverSchema(rule.op as any);
      if (!helper) {
        throw new Error(`Unknown operation: ${rule.op} at rule index ${index}`);
      }
      
      return {
        original: rule,
        helper,
        pathSegments: rule.field.includes('.') ? rule.field.split('.') : [rule.field],
        hasParams: 'params' in rule && rule.params !== undefined
      };
    });

    const endTime = performance.now();
    if (this.options.debug) {
      this.logger.debug(`Compiled ${rules.length} rules in ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return compiled;
  }

  /**
   * Preload helpers used by rules for performance
   */
  private preloadHelpers(): void {
    const startTime = performance.now();
    const uniqueOps = new Set(this.rules.map(rule => rule.op));
    
    for (const op of uniqueOps) {
      try {
        const helper = helpersActions.getHelperResolverSchema(op as any);
        if (helper) {
          this.helperCache.set(op, helper);
        }
      } catch (error) {
        if (this.options.debug) {
          this.logger.warn(`Helper not found during preload: ${op}`);
        }
      }
    }
    
    const endTime = performance.now();
    if (this.options.debug) {
      this.logger.debug(`Preloaded ${this.helperCache.size} helpers in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  /**
   * Apply compiled rule for optimized validation
   */
  private applyRule(compiledRule: CompiledRule, value: unknown): boolean {
    try {
      const { helper, original, hasParams } = compiledRule;
      if (!helper) {
        throw new Error(`Unknown operation: ${original.op}`);
      }
      
      let isValid: boolean;
      
      if (!hasParams || helper.params.length === 0) {
        // No parameters needed - pass only the value
        isValid = helper.resolver(value);
      } else {
        // Parameters needed - extract them according to helper.params specification
        const params = (original as any).params || {};
        const args = [value];
        
        // Build arguments array based on helper.params
        for (const paramName of helper.params) {
          if (!(paramName in params)) {
            throw new Error(`Missing required parameter: ${paramName}`);
          }
          args.push(params[paramName]);
        }
        
        isValid = helper.resolver(...args);
      }
      
      return original.negative ? !isValid : isValid;
    } catch (error) {
      throw new Error(`Rule validation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Apply compiled rule for optimized async validation
   */
  private async applyRuleAsync(compiledRule: CompiledRule, value: unknown): Promise<boolean> {
    try {
      const { helper, original, hasParams } = compiledRule;
      if (!helper) {
        throw new Error(`Unknown operation: ${original.op}`);
      }
      
      let isValid: boolean;
      
      if (!hasParams || helper.params.length === 0) {
        // No parameters needed - pass only the value
        isValid = await helper.resolver(value);
      } else {
        // Parameters needed - extract them according to helper.params specification
        const params = (original as any).params || {};
        const args = [value];
        
        // Build arguments array based on helper.params
        for (const paramName of helper.params) {
          if (!(paramName in params)) {
            throw new Error(`Missing required parameter: ${paramName}`);
          }
          args.push(params[paramName]);
        }
        
        isValid = await helper.resolver(...args);
      }
      
      return original.negative ? !isValid : isValid;
    } catch (error) {
      throw new Error(`Rule validation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Optimized debug logging with lazy evaluation
   */
  private debugLog(messageFactory: () => string, data?: any): void {
    if (this.options.debug) {
      this.logger.debug(messageFactory(), data);
    }
  }
}
