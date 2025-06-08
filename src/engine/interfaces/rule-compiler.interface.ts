import { Rule } from '../rule';

/**
 * Interface for rule compilation operations.
 * Responsible for compiling raw rules into optimized, executable formats.
 *
 * @public
 * @since 1.0.0
 */
export interface IRuleCompiler {
  /**
   * Compiles an array of rules into optimized CompiledRule objects.
   *
   * @param rules - Array of raw rules to compile
   * @returns Array of compiled rules ready for execution
   * @throws Error if any rule is invalid or helper cannot be resolved
   */
  compile(rules: Rule[]): CompiledRule[];

  /**
   * Retrieves a helper function by its operation name.
   *
   * @param operation - The operation name (e.g., 'isString', 'contains')
   * @returns The helper function or undefined if not found
   */
  getHelper(operation: string): any;

  /**
   * Compiles rules with legacy method name for backward compatibility
   *
   * @param rules - Array of raw rules to compile
   * @returns Array of compiled rules ready for execution
   */
  compileRules(rules: Rule[]): CompiledRule[];

  /**
   * Gets performance metrics for the rule compiler.
   * @returns An object with the following properties:
   *   - compiledRulesCount: Number of compiled rules in cache.
   *   - cacheHits: Number of cache hits for rule compilation.
   *   - cacheMisses: Number of cache misses for rule compilation.
   */
  getMetrics(): {
    /** Number of compiled rules in cache. */
    compiledRulesCount: number;
    /** Number of cache hits for rule compilation. */
    cacheHits: number;
    /** Number of cache misses for rule compilation. */
    cacheMisses: number;
  };

  /**
   * Clears internal caches and resets state
   */
  clearCache(): void;
}

/**
 * Represents a rule that has been compiled and optimized for execution.
 *
 * @property original - The original rule before compilation.
 * @property helper - The resolved helper function for this rule.
 * @property pathSegments - Parsed path segments for field access (e.g., ['user', 'profile', 'email']).
 * @property hasParams - Whether this rule has parameters that need to be resolved.
 */
export interface CompiledRule {
  original: Rule;
  helper: any;
  pathSegments: string[];
  hasParams: boolean;
}
