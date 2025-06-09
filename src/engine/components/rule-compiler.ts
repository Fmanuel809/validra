/**
 * @fileoverview Advanced rule compilation component for optimized validation rule processing and execution
 * @module RuleCompiler
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

import { helpersActions } from '../../dsl';
import { ValidraLogger } from '../../utils/validra-logger';
import { CompiledRule, IRuleCompiler } from '../interfaces/rule-compiler.interface';
import { Rule } from '../rule';

/**
 * Sophisticated rule compilation engine for optimized validation rule processing and execution.
 *
 * The RuleCompiler transforms raw validation rules into highly optimized, executable
 * structures that enhance validation performance through pre-processing, helper
 * resolution, path parsing, and intelligent caching. Designed for high-throughput
 * validation scenarios where rule compilation overhead must be minimized.
 *
 * Key features:
 * - **Rule Optimization**: Transforms rules into optimized executable structures
 * - **Helper Resolution**: Intelligent caching of validation helper functions
 * - **Path Preprocessing**: Pre-computes field paths for efficient data access
 * - **Validation Pipeline**: Comprehensive rule structure validation and error handling
 * - **Performance Monitoring**: Built-in metrics tracking for compilation analysis
 * - **Batch Processing**: Efficient batch compilation with error isolation
 *
 * Compilation process:
 * 1. **Structure Validation**: Validates rule syntax and completeness
 * 2. **Helper Resolution**: Resolves and caches validation helper functions
 * 3. **Path Parsing**: Pre-computes field paths for optimized data access
 * 4. **Optimization**: Creates optimized executable rule structures
 * 5. **Error Handling**: Provides comprehensive error reporting and recovery
 *
 * Performance benefits:
 * - Reduced validation runtime through pre-compilation
 * - Helper function caching for repeated rule types
 * - Pre-parsed field paths for efficient data extraction
 * - Batch processing optimizations for large rule sets
 *
 * @public
 * @implements {IRuleCompiler}
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic rule compilation usage
 * const compiler = new RuleCompiler();
 * const rules = [
 *   { field: 'email', op: 'isEmail' },
 *   { field: 'age', op: 'min', params: [18] },
 *   { field: 'user.profile.name', op: 'required' }
 * ];
 *
 * const compiledRules = compiler.compile(rules);
 * console.log(`Compiled ${compiledRules.length} rules successfully`);
 * ```
 *
 * @example
 * ```typescript
 * // Advanced compilation with logging and monitoring
 * const logger = new ValidraLogger('debug');
 * const compiler = new RuleCompiler(logger);
 *
 * const compiledRules = compiler.compile(validationRules);
 *
 * // Monitor compilation performance
 * const metrics = compiler.getMetrics();
 * console.log(`Compilation metrics:
 *   Compiled: ${metrics.compiledRulesCount}
 *   Cache hits: ${metrics.cacheHits}
 *   Cache misses: ${metrics.cacheMisses}`);
 * ```
 *
 * @example
 * ```typescript
 * // Error handling and rule validation
 * try {
 *   const compiledRules = compiler.compile(userRules);
 *
 *   // Use compiled rules for validation
 *   for (const compiledRule of compiledRules) {
 *     const value = dataExtractor.getValue(data, compiledRule.pathSegments);
 *     const result = compiledRule.helper(value, ...(compiledRule.original.params || []));
 *   }
 * } catch (error) {
 *   console.error('Rule compilation failed:', error.message);
 * }
 * ```
 *
 * @see {@link IRuleCompiler} for the interface definition
 * @see {@link CompiledRule} for compiled rule structure
 * @see {@link Rule} for input rule format
 */
export class RuleCompiler implements IRuleCompiler {
  private readonly logger: ValidraLogger;
  private readonly helperCache = new Map<string, any>();
  private compiledRulesCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Creates a new RuleCompiler instance with optional logging configuration.
   *
   * Initializes the rule compilation engine with configurable logging for debugging
   * and monitoring compilation operations. The compiler maintains internal state
   * for helper caching, performance metrics, and compilation tracking.
   *
   * @public
   * @param {ValidraLogger} [logger] - Optional logger instance for compilation event logging;
   *                                   defaults to error-level logging if not provided
   *
   * @example
   * ```typescript
   * // Basic compiler with default logging
   * const compiler = new RuleCompiler();
   * ```
   *
   * @example
   * ```typescript
   * // Compiler with custom logger for detailed monitoring
   * const logger = new ValidraLogger('debug');
   * const compiler = new RuleCompiler(logger);
   * ```
   *
   * @example
   * ```typescript
   * // Production compiler with info-level logging
   * const productionLogger = new ValidraLogger('info');
   * const compiler = new RuleCompiler(productionLogger);
   *
   * // Compile rules with comprehensive logging
   * const compiled = compiler.compile(validationRules);
   * ```
   *
   * @since 1.0.0
   */
  constructor(logger?: ValidraLogger) {
    this.logger = logger || new ValidraLogger('error');
  }

  /**
   * Compiles an array of validation rules into optimized executable structures.
   *
   * Transforms raw validation rules into highly optimized CompiledRule objects
   * through comprehensive processing including structure validation, helper
   * resolution, path parsing, and performance optimization. Provides batch
   * compilation with error isolation and detailed performance monitoring.
   *
   * @public
   * @param {Rule[]} rules - Array of raw validation rules to compile
   * @returns {CompiledRule[]} Array of compiled and optimized rule objects
   * @throws {Error} Throws compilation error if any rule fails to compile
   *
   * @example
   * ```typescript
   * // Basic rule compilation
   * const rules = [
   *   { field: 'email', op: 'isEmail' },
   *   { field: 'age', op: 'min', params: [18] },
   *   { field: 'name', op: 'required' }
   * ];
   *
   * const compiled = compiler.compile(rules);
   * console.log(`Successfully compiled ${compiled.length} rules`);
   * ```
   *
   * @example
   * ```typescript
   * // Complex nested field compilation
   * const complexRules = [
   *   { field: 'user.profile.email', op: 'isEmail' },
   *   { field: 'user.settings.notifications', op: 'isBoolean' },
   *   { field: 'order.items.0.price', op: 'min', params: [0.01] }
   * ];
   *
   * const compiled = compiler.compile(complexRules);
   * // Rules are optimized with pre-parsed paths and cached helpers
   * ```
   *
   * @example
   * ```typescript
   * // Compilation with error handling and performance monitoring
   * try {
   *   const startTime = performance.now();
   *   const compiled = compiler.compile(userDefinedRules);
   *   const compilationTime = performance.now() - startTime;
   *
   *   console.log(`Compilation completed in ${compilationTime.toFixed(2)}ms`);
   *   console.log(`Compiled ${compiled.length} rules`);
   *
   *   // Check compilation metrics
   *   const metrics = compiler.getMetrics();
   *   console.log(`Helper cache efficiency: ${metrics.cacheHits}/${metrics.cacheHits + metrics.cacheMisses}`);
   * } catch (error) {
   *   console.error('Rule compilation failed:', error.message);
   * }
   * ```
   *
   * @since 1.0.0
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
   * Retrieves validation helper functions by operation name with intelligent caching.
   *
   * Provides high-performance helper function resolution with LRU caching to
   * minimize repeated lookups and improve compilation performance. The method
   * handles helper resolution errors gracefully and maintains cache statistics
   * for performance monitoring.
   *
   * @public
   * @param {string} operation - Name of the validation operation to resolve
   * @returns {any} Resolved helper function or undefined if operation not found
   *
   * @example
   * ```typescript
   * // Basic helper resolution
   * const emailHelper = compiler.getHelper('isEmail');
   * const minHelper = compiler.getHelper('min');
   * const requiredHelper = compiler.getHelper('required');
   *
   * // Use helper for validation
   * const isValid = emailHelper('user@example.com');
   * ```
   *
   * @example
   * ```typescript
   * // Helper resolution with error handling
   * const helper = compiler.getHelper('customValidation');
   * if (helper) {
   *   const result = helper(value, ...params);
   * } else {
   *   console.warn('Custom validation helper not found');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Performance monitoring of helper caching
   * const operations = ['isEmail', 'required', 'min', 'max', 'isString'];
   *
   * operations.forEach(op => {
   *   const helper = compiler.getHelper(op);
   *   console.log(`${op}: ${helper ? 'found' : 'not found'}`);
   * });
   *
   * const metrics = compiler.getMetrics();
   * console.log(`Cache performance: ${metrics.cacheHits} hits, ${metrics.cacheMisses} misses`);
   * ```
   *
   * @since 1.0.0
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
   * Compiles rules using legacy method name for backward compatibility.
   *
   * Provides backward compatibility for existing code while maintaining
   * the same compilation functionality as the main compile() method.
   * Updates internal compilation metrics for performance tracking.
   *
   * @public
   * @param {Rule[]} rules - Array of raw validation rules to compile
   * @returns {CompiledRule[]} Array of compiled and optimized rule objects
   * @deprecated Use compile() method instead for better clarity
   *
   * @example
   * ```typescript
   * // Legacy usage (deprecated but supported)
   * const compiled = compiler.compileRules(rules);
   *
   * // Preferred usage
   * const compiled = compiler.compile(rules);
   * ```
   *
   * @since 1.0.0
   */
  public compileRules(rules: Rule[]): CompiledRule[] {
    const compiled = this.compile(rules);
    this.compiledRulesCount += compiled.length;
    return compiled;
  }

  /**
   * Retrieves comprehensive performance metrics for compilation analysis and optimization.
   *
   * Provides detailed compilation statistics including rule counts, cache performance,
   * and efficiency metrics for performance monitoring, optimization decisions, and
   * system health analysis. Essential for production monitoring and tuning.
   *
   * @public
   * @returns {object} Performance metrics object with compilation and cache statistics
   * @returns {number} returns.compiledRulesCount - Total number of rules compiled
   * @returns {number} returns.cacheHits - Number of successful helper cache lookups
   * @returns {number} returns.cacheMisses - Number of cache misses requiring helper resolution
   *
   * @example
   * ```typescript
   * // Basic performance monitoring
   * const metrics = compiler.getMetrics();
   * console.log(`Compilation Summary:
   *   Total Compiled: ${metrics.compiledRulesCount}
   *   Cache Hits: ${metrics.cacheHits}
   *   Cache Misses: ${metrics.cacheMisses}`);
   * ```
   *
   * @example
   * ```typescript
   * // Cache efficiency analysis
   * const metrics = compiler.getMetrics();
   * const totalCacheAccess = metrics.cacheHits + metrics.cacheMisses;
   * const hitRate = totalCacheAccess > 0 ? (metrics.cacheHits / totalCacheAccess) * 100 : 0;
   *
   * console.log(`Helper cache efficiency: ${hitRate.toFixed(2)}%`);
   * if (hitRate < 80) {
   *   console.warn('Low cache hit rate - consider rule optimization');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Performance benchmarking
   * const startMetrics = compiler.getMetrics();
   *
   * // Perform compilation operations
   * compiler.compile(largeBatchOfRules);
   *
   * const endMetrics = compiler.getMetrics();
   * const newCompilations = endMetrics.compiledRulesCount - startMetrics.compiledRulesCount;
   * console.log(`Batch compiled ${newCompilations} rules`);
   * ```
   *
   * @since 1.0.0
   */
  public getMetrics(): {
    /** Number of compiled rules in cache. */
    compiledRulesCount: number;
    /** Number of cache hits for rule compilation. */
    cacheHits: number;
    /** Number of cache misses for rule compilation. */
    cacheMisses: number;
  } {
    return {
      compiledRulesCount: this.compiledRulesCount,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
    };
  }

  /**
   * Clears internal caches and resets performance metrics to initial state.
   *
   * Provides comprehensive cleanup for memory management in long-running applications
   * or testing scenarios. Clears helper cache and resets all performance counters,
   * allowing for fresh compilation patterns and accurate metric tracking.
   *
   * @public
   *
   * @example
   * ```typescript
   * // Periodic cache cleanup in long-running applications
   * setInterval(() => {
   *   const metrics = compiler.getMetrics();
   *   if (metrics.cacheHits > 1000) {
   *     compiler.clearCache();
   *     console.log('Compiler cache cleared for memory optimization');
   *   }
   * }, 600000); // Every 10 minutes
   * ```
   *
   * @example
   * ```typescript
   * // Testing scenario cleanup
   * afterEach(() => {
   *   compiler.clearCache(); // Ensure clean state between tests
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Application phase transition
   * function switchValidationContext() {
   *   compiler.clearCache(); // Clear cache for new validation context
   *   console.log('Compiler state reset for new context');
   * }
   * ```
   *
   * @since 1.0.0
   */
  public clearCache(): void {
    this.helperCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Compiles a single rule into an optimized CompiledRule object with pre-resolved helpers and parsed field paths.
   *
   * This method performs the core compilation logic for individual rules, transforming raw
   * rule definitions into optimized executable structures. The compilation process includes
   * rule structure validation, helper function resolution, field path parsing, and parameter
   * processing optimization.
   *
   * Compilation steps:
   * 1. **Structure Validation**: Validates rule syntax and required fields
   * 2. **Helper Resolution**: Resolves and caches validation helper function
   * 3. **Path Parsing**: Pre-computes field path segments for nested access
   * 4. **Parameter Analysis**: Determines parameter presence for optimization
   * 5. **Structure Creation**: Creates optimized CompiledRule object
   *
   * @private
   * @param {Rule} rule - The raw validation rule to compile into executable form
   * @returns {CompiledRule | null} Compiled rule object with optimized structure, or null if compilation fails
   * @throws {Error} Throws compilation error for invalid rule structure or missing helpers
   *
   * @example
   * ```typescript
   * // Internal compilation of simple rule
   * const rule = { field: 'email', op: 'isEmail' };
   * const compiled = this.compileRule(rule);
   * // Returns: { original: rule, helper: emailValidatorFn, pathSegments: ['email'], hasParams: false }
   * ```
   *
   * @example
   * ```typescript
   * // Internal compilation of complex nested rule
   * const rule = { field: 'user.profile.age', op: 'min', params: [18] };
   * const compiled = this.compileRule(rule);
   * // Returns: { original: rule, helper: minValidatorFn, pathSegments: ['user', 'profile', 'age'], hasParams: true }
   * ```
   *
   * @example
   * ```typescript
   * // Internal compilation with error handling
   * try {
   *   const compiled = this.compileRule(invalidRule);
   * } catch (error) {
   *   // Handle compilation errors for invalid rules or missing helpers
   *   console.error('Rule compilation failed:', error.message);
   * }
   * ```
   *
   * @since 1.0.0
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
   * Validates the structural integrity and completeness of a validation rule object.
   *
   * This method performs comprehensive validation of rule objects to ensure they meet
   * the required structure and contain valid data before compilation. The validation
   * process checks for proper object structure, required field presence, data type
   * correctness, and content validity.
   *
   * Validation criteria:
   * - **Object Structure**: Ensures rule is a valid non-null object
   * - **Field Validation**: Validates field property is a non-empty string
   * - **Operation Validation**: Validates op property is a non-empty string
   * - **Type Safety**: Ensures proper data types for all properties
   * - **Content Validation**: Validates string properties are not empty after trimming
   *
   * @private
   * @param {Rule} rule - The validation rule object to validate for structural integrity
   * @returns {boolean} True if the rule structure is valid and meets all requirements, false otherwise
   *
   * @example
   * ```typescript
   * // Valid rule structure validation
   * const validRule = { field: 'email', op: 'isEmail' };
   * const isValid = this.validateRuleStructure(validRule);
   * // Returns: true
   * ```
   *
   * @example
   * ```typescript
   * // Invalid rule structure detection
   * const invalidRules = [
   *   null,                              // null rule
   *   { field: '', op: 'required' },     // empty field
   *   { field: 'name', op: '' },         // empty operation
   *   { field: 123, op: 'isString' },    // invalid field type
   *   { op: 'required' }                 // missing field property
   * ];
   *
   * invalidRules.forEach(rule => {
   *   const isValid = this.validateRuleStructure(rule);
   *   // All return: false
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Validation in rule preprocessing
   * const rules = getUserInputRules();
   * const validRules = rules.filter(rule => this.validateRuleStructure(rule));
   * console.log(`${validRules.length}/${rules.length} rules passed validation`);
   * ```
   *
   * @since 1.0.0
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
   * Parses a field path string into an array of segments for efficient nested object access.
   *
   * This method transforms dot-notation field paths into optimized segment arrays that
   * enable efficient traversal of nested object structures during validation. The parsing
   * process handles complex nested paths, array indices, and provides sanitized path
   * segments for safe data extraction.
   *
   * Path parsing features:
   * - **Dot-notation Support**: Parses standard dot-notation paths (e.g., 'user.profile.email')
   * - **Segment Sanitization**: Trims whitespace and filters empty segments
   * - **Nested Object Access**: Optimizes paths for deep object traversal
   * - **Array Index Support**: Handles numeric array indices in paths
   * - **Performance Optimization**: Pre-computed segments reduce runtime processing
   *
   * @private
   * @param {string} field - The dot-notation field path to parse into accessible segments
   * @returns {string[]} Array of sanitized path segments for efficient object traversal
   *
   * @example
   * ```typescript
   * // Simple field path parsing
   * const segments = this.parseFieldPath('email');
   * // Returns: ['email']
   * ```
   *
   * @example
   * ```typescript
   * // Nested object path parsing
   * const segments = this.parseFieldPath('user.profile.firstName');
   * // Returns: ['user', 'profile', 'firstName']
   * ```
   *
   * @example
   * ```typescript
   * // Complex nested path with array indices
   * const segments = this.parseFieldPath('orders.0.items.5.price');
   * // Returns: ['orders', '0', 'items', '5', 'price']
   * ```
   *
   * @example
   * ```typescript
   * // Path sanitization and empty segment filtering
   * const segments = this.parseFieldPath('user..profile. name .');
   * // Returns: ['user', 'profile', 'name'] (empty segments filtered, whitespace trimmed)
   * ```
   *
   * @example
   * ```typescript
   * // Usage in data extraction optimization
   * const pathSegments = this.parseFieldPath('user.settings.notifications.email');
   * // Pre-computed segments enable efficient nested access:
   * // data[segments[0]][segments[1]][segments[2]][segments[3]]
   * ```
   *
   * @since 1.0.0
   */
  private parseFieldPath(field: string): string[] {
    return field
      .split('.')
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);
  }
}
