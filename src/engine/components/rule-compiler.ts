import { helpersActions } from '../../dsl';
import { ValidraLogger } from '../../utils/validra-logger';
import { CompiledRule, IRuleCompiler } from '../interfaces/rule-compiler.interface';
import { Rule } from '../rule';

/**
 * Compiles and optimizes validation rules for efficient execution.
 * Handles rule validation, helper resolution, and path parsing.
 *
 * @public
 * @since 1.0.0
 */
export class RuleCompiler implements IRuleCompiler {
  private readonly logger: ValidraLogger;
  private readonly helperCache = new Map<string, any>();
  private compiledRulesCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(logger?: ValidraLogger) {
    this.logger = logger || new ValidraLogger('error');
  }

  /**
   * Compiles an array of rules into optimized CompiledRule objects.
   */
  public compile(rules: Rule[]): CompiledRule[] {
    this.logger.info('Starting rule compilation', { ruleCount: rules.length });

    const compiledRules: CompiledRule[] = [];
    const startTime = performance.now();

    for (let i = 0; i < rules.length; i++) {
      try {
        const rule = rules[i];
        if (!rule) {
          this.logger.warn(`Rule at index ${i} is undefined, skipping`);
          continue;
        }

        const compiledRule = this.compileRule(rule);
        if (compiledRule) {
          compiledRules.push(compiledRule);
        }
      } catch (error) {
        this.logger.error(`Failed to compile rule at index ${i}`, { rule: rules[i], error });
        throw new Error(`Rule compilation failed at index ${i}: ${error}`);
      }
    }

    const compilationTime = performance.now() - startTime;
    this.logger.info('Rule compilation completed', {
      compiledCount: compiledRules.length,
      timeMs: compilationTime.toFixed(2),
    });

    return compiledRules;
  }

  /**
   * Retrieves a helper function by its operation name with caching.
   */
  public getHelper(operation: string): any {
    if (this.helperCache.has(operation)) {
      this.cacheHits++;
      return this.helperCache.get(operation);
    }

    this.cacheMisses++;
    try {
      const helperSchema = helpersActions.getHelperResolverSchema(operation as any);
      const helper = helperSchema.resolver;
      if (helper) {
        this.helperCache.set(operation, helper);
      }
      return helper;
    } catch (error) {
      this.logger.error(`Failed to resolve helper for operation "${operation}"`, { error });
      return undefined;
    }
  }

  /**
   * Compiles rules with legacy method name for backward compatibility
   */
  public compileRules(rules: Rule[]): CompiledRule[] {
    const compiled = this.compile(rules);
    this.compiledRulesCount += compiled.length;
    return compiled;
  }

  /**
   * Gets performance metrics for the rule compiler
   */
  public getMetrics(): { compiledRulesCount: number; cacheHits: number; cacheMisses: number } {
    return {
      compiledRulesCount: this.compiledRulesCount,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
    };
  }

  /**
   * Clears internal caches and resets state
   */
  public clearCache(): void {
    this.helperCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Compiles a single rule into a CompiledRule object.
   *
   * @private
   * @param rule - The rule to compile
   * @returns Compiled rule or null if compilation fails
   */
  private compileRule(rule: Rule): CompiledRule | null {
    if (!this.validateRuleStructure(rule)) {
      throw new Error(`Invalid rule structure: ${JSON.stringify(rule)}`);
    }

    const helper = this.getHelper(rule.op);
    if (!helper) {
      throw new Error(`Helper not found for operation: ${rule.op}`);
    }

    const pathSegments = this.parseFieldPath(rule.field);
    const hasParams = 'params' in rule && rule.params !== undefined && rule.params !== null;

    return {
      original: rule,
      helper,
      pathSegments,
      hasParams,
    };
  }

  /**
   * Validates the structure of a rule.
   *
   * @private
   * @param rule - The rule to validate
   * @returns True if the rule structure is valid
   */
  private validateRuleStructure(rule: Rule): boolean {
    if (!rule || typeof rule !== 'object') {
      return false;
    }

    if (typeof rule.field !== 'string' || rule.field.trim() === '') {
      return false;
    }

    if (typeof rule.op !== 'string' || rule.op.trim() === '') {
      return false;
    }

    return true;
  }

  /**
   * Parses a field path into segments for nested object access.
   *
   * @private
   * @param field - The field path (e.g., 'user.profile.email')
   * @returns Array of path segments
   */
  private parseFieldPath(field: string): string[] {
    return field
      .split('.')
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);
  }
}
