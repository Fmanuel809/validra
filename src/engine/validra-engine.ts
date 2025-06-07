import { helpersActions, Helper } from "@/dls";
import { ValidraCallback, ValidraEngineOptions, ValidraResult } from "./interfaces";
import { Rule } from "./rule";

export class ValidraEngine {
  private rules: Rule[];
  private callbacks: ValidraCallback[];
  private options: ValidraEngineOptions;
  private helperCache = new Map<string, any>();

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
  }

  public validate<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void)
  ): ValidraResult<T> {
    // Validación de entrada
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    if (this.rules.length === 0) {
      this.debugLog('No rules defined, validation passed');
      return { isValid: true, data };
    }

    const result: ValidraResult<T> = {
      isValid: true,
      data: data,
      errors: {}
    };

    this.debugLog(`Starting validation with ${this.rules.length} rules`);

    for (const rule of this.rules) {
      try {
        const value = this.getValue(data, rule.field);
        
        // Validar campo desconocido si está habilitado
        if (this.options.throwOnUnknownField && value === undefined && !rule.field.includes('.')) {
          throw new Error(`Unknown field: ${rule.field}`);
        }
        
        const isValid = this.applyRule(rule, value);

        this.debugLog(`Rule ${rule.op} on field ${rule.field}: ${isValid ? 'PASS' : 'FAIL'}`);

        if (!isValid) {
          result.isValid = false;
          this.addError(result, rule);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.debugLog(`Error applying rule ${rule.op} on field ${rule.field}: ${errorMessage}`);
        
        if (!this.options.allowPartialValidation) {
          throw new Error(`Rule validation failed for field "${rule.field}": ${errorMessage}`);
        }
        
        // En modo parcial, tratar como error de validación
        result.isValid = false;
        this.addError(result, rule, `Validation error: ${errorMessage}`);
      }
    }

    this.debugLog(`Validation completed. Result: ${result.isValid ? 'VALID' : 'INVALID'}`);

    // Ejecutar callback si se proporciona
    this.executeCallback(callback, result);

    return result;
  }

  public async validateAsync<T extends Record<string, any>>(
    data: T,
    callback?: string | ((result: ValidraResult<T>) => void | Promise<void>)
  ): Promise<ValidraResult<T>> {
    // Validación de entrada
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    if (this.rules.length === 0) {
      this.debugLog('No rules defined, validation passed');
      return { isValid: true, data };
    }

    const result: ValidraResult<T> = {
      isValid: true,
      data: data,
      errors: {}
    };

    this.debugLog(`Starting async validation with ${this.rules.length} rules`);

    for (const rule of this.rules) {
      try {
        const value = this.getValue(data, rule.field);
        
        // Validar campo desconocido si está habilitado
        if (this.options.throwOnUnknownField && value === undefined && !rule.field.includes('.')) {
          throw new Error(`Unknown field: ${rule.field}`);
        }
        
        const isValid = await this.applyRuleAsync(rule, value);

        this.debugLog(`Rule ${rule.op} on field ${rule.field}: ${isValid ? 'PASS' : 'FAIL'}`);

        if (!isValid) {
          result.isValid = false;
          this.addError(result, rule);
        }
      } catch (error) {
        this.debugLog(`Error applying rule ${rule.op} on field ${rule.field}: ${(error as Error).message}`);
        
        if (!this.options.allowPartialValidation) {
          throw new Error(`Rule validation failed for field "${rule.field}": ${(error as Error).message}`);
        }
        
        // En modo parcial, tratar como error de validación
        result.isValid = false;
        this.addError(result, rule, `Validation error: ${(error as Error).message}`);
      }
    }

    this.debugLog(`Async validation completed. Result: ${result.isValid ? 'VALID' : 'INVALID'}`);

    // Ejecutar callback si se proporciona
    await this.executeCallbackAsync(callback, result);

    return result;
  }

  private applyRule(rule: Rule, value: unknown): boolean {
    try {
      const helper = this.getHelper(rule.op);
      if (!helper) {
        throw new Error(`Unknown operation: ${rule.op}`);
      }
      
      // Extraer params de manera segura usando discriminated union
      const params = 'params' in rule ? rule.params : {};
      const isValid = helper.resolver(value, params);
      return rule.negative ? !isValid : isValid;
    } catch (error) {
      throw new Error(`Rule validation failed: ${(error as Error).message}`);
    }
  }

  private async applyRuleAsync(rule: Rule, value: unknown): Promise<boolean> {
    try {
      const helper = this.getHelper(rule.op);
      if (!helper) {
        throw new Error(`Unknown operation: ${rule.op}`);
      }
      
      // Extraer params de manera segura usando discriminated union
      const params = 'params' in rule ? rule.params : {};
      const isValid = await helper.resolver(value, params);
      return rule.negative ? !isValid : isValid;
    } catch (error) {
      throw new Error(`Rule validation failed: ${(error as Error).message}`);
    }
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

  private getValue(data: any, path: string): unknown {
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private addError<T extends Record<string, any>>(result: ValidraResult<T>, rule: Rule, customMessage?: string): void {
    if (!result.errors) {
      result.errors = {} as any;
    }
    
    const errors = result.errors!;
    const field = rule.field as keyof T;
    if (!errors[field]) {
      errors[field] = [] as any;
    }
    
    (errors[field] as any[]).push({
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

  private debugLog(message: string): void {
    if (this.options.debug) {
      console.log(`[ValidraEngine] ${message}`);
    }
  }

  /**
   * Añade una nueva regla al motor de validación
   */
  public addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  /**
   * Elimina reglas por campo
   */
  public removeRulesByField(field: string): void {
    this.rules = this.rules.filter(rule => rule.field !== field);
  }

  /**
   * Obtiene todas las reglas para un campo específico
   */
  public getRulesForField(field: string): Rule[] {
    return this.rules.filter(rule => rule.field === field);
  }

  /**
   * Limpia el caché de helpers
   */
  public clearHelperCache(): void {
    this.helperCache.clear();
  }

  /**
   * Obtiene estadísticas del motor
   */
  public getStats(): { rulesCount: number; callbacksCount: number; cacheSize: number } {
    return {
      rulesCount: this.rules.length,
      callbacksCount: this.callbacks.length,
      cacheSize: this.helperCache.size
    };
  }

  /**
   * Valida un campo específico en lugar de todo el objeto
   */
  public validateField<T extends Record<string, any>>(
    data: T,
    fieldName: string
  ): { isValid: boolean; errors: string[] } {
    const fieldRules = this.getRulesForField(fieldName);
    const errors: string[] = [];
    let isValid = true;

    for (const rule of fieldRules) {
      try {
        const value = this.getValue(data, rule.field);
        const ruleIsValid = this.applyRule(rule, value);
        
        if (!ruleIsValid) {
          isValid = false;
          errors.push(rule.message || `Validation [${rule.op}] failed for ${rule.field}`);
        }
      } catch (error) {
        isValid = false;
        errors.push(`Error validating field ${fieldName}: ${(error as Error).message}`);
      }
    }

    return { isValid, errors };
  }
}
