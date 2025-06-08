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
   * Gets performance metrics for the rule compiler
   *
   * @returns Metrics object with compilation stats
   */
  getMetrics(): { compiledRulesCount: number; cacheHits: number; cacheMisses: number };

  /**
   * Clears internal caches and resets state
   */
  clearCache(): void;
}

/**
 * Represents a rule that has been compiled and optimized for execution.
 *
 * @public
 * @since 1.0.0
 */
export interface CompiledRule {
  /** The original rule before compilation */
  original: Rule;

  /** The resolved helper function for this rule */
  helper: any;

  /** Parsed path segments for field access (e.g., ['user', 'profile', 'email']) */
  pathSegments: string[];

  /** Whether this rule has parameters that need to be resolved */
  hasParams: boolean;
}
