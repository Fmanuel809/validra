/**
 * @fileoverview Comprehensive logging utility for structured diagnostic output and debugging support
 * @module ValidraLogger
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Comprehensive logging utility for the Validra validation library with structured output and diagnostic support.
 *
 * The ValidraLogger provides a sophisticated logging framework that enhances debugging
 * and monitoring capabilities throughout the Validra ecosystem. Designed with consistent
 * formatting, timestamp precision, and source identification for comprehensive logging
 * across all validation operations and components.
 *
 * Key features:
 * - **Structured Logging**: Consistent timestamp and source formatting across all log levels
 * - **Multi-Level Support**: Complete logging level coverage (log, info, warn, error, debug, trace)
 * - **Source Identification**: Configurable source names for component-specific logging
 * - **Parameter Support**: Flexible parameter passing for complex object logging
 * - **Error Integration**: Automatic error throwing with formatted error messages
 * - **Performance Optimized**: Minimal overhead logging operations for production use
 *
 * Logging format:
 * `[ISO_TIMESTAMP] [SOURCE_NAME] MESSAGE [OPTIONAL_PARAMETERS]`
 *
 * Use cases:
 * - **Development Debugging**: Detailed tracing of validation operations and data flow
 * - **Production Monitoring**: Structured logging for error tracking and performance analysis
 * - **Component Isolation**: Source-specific logging for modular debugging
 * - **Error Reporting**: Consistent error formatting and automatic exception handling
 * - **Performance Analysis**: Timestamped logging for operation timing and optimization
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic logger with default source
 * const logger = new ValidraLogger();
 * logger.log("Validation process started");
 * logger.info("Processing user data");
 * logger.warn("Deprecated validation method used");
 * ```
 *
 * @example
 * ```typescript
 * // Component-specific logger with custom source
 * const engineLogger = new ValidraLogger("ValidationEngine");
 * const cacheLogger = new ValidraLogger("CacheManager");
 *
 * engineLogger.debug("Rule compilation started", { ruleCount: 15 });
 * cacheLogger.info("Cache hit", { key: "user_validation", hitRate: "85%" });
 * ```
 *
 * @example
 * ```typescript
 * // Comprehensive logging with error handling
 * const logger = new ValidraLogger("DataProcessor");
 *
 * try {
 *   logger.trace("Entering critical validation section");
 *   logger.debug("Processing complex nested data", { depth: 5, size: "2.3MB" });
 *   logger.info("Validation completed successfully", {
 *     processed: 1250,
 *     errors: 0,
 *     duration: "245ms"
 *   });
 * } catch (error) {
 *   logger.error("Critical validation failure", {
 *     error: error.message,
 *     stack: error.stack
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Performance monitoring and structured logging
 * const perfLogger = new ValidraLogger("PerformanceMonitor");
 *
 * const startTime = performance.now();
 * // ... validation operations ...
 * const endTime = performance.now();
 *
 * perfLogger.info("Validation performance metrics", {
 *   operation: "bulk_validation",
 *   recordCount: 10000,
 *   duration: `${(endTime - startTime).toFixed(2)}ms`,
 *   throughput: `${(10000 / ((endTime - startTime) / 1000)).toFixed(0)} records/sec`
 * });
 * ```
 */
export class ValidraLogger {
  /**
   * The source identifier used in all log messages for component identification and filtering.
   *
   * @protected
   * @default 'Validra Engine'
   * @since 1.0.0
   */
  protected source = 'Validra Engine';

  /**
   * Creates a new ValidraLogger instance with configurable source identification for structured logging.
   *
   * Initializes the logger with a custom source name that will be included in all log
   * messages for easy identification and filtering. The source name helps distinguish
   * between different components, modules, or services within the Validra ecosystem.
   *
   * @public
   * @param {string} source - Custom source identifier for log message attribution and filtering
   *
   * @example
   * ```typescript
   * // Create logger with custom source for component identification
   * const engineLogger = new ValidraLogger("ValidationEngine");
   * const cacheLogger = new ValidraLogger("CacheManager");
   * const streamLogger = new ValidraLogger("StreamValidator");
   * ```
   *
   * @example
   * ```typescript
   * // Module-specific logging for debugging and monitoring
   * const ruleCompilerLogger = new ValidraLogger("RuleCompiler");
   * ruleCompilerLogger.debug("Starting rule compilation", { ruleCount: 25 });
   * ruleCompilerLogger.info("Compilation completed", { duration: "45ms" });
   * ```
   *
   * @example
   * ```typescript
   * // Environment-specific logger configuration
   * const environment = process.env.NODE_ENV || 'development';
   * const logger = new ValidraLogger(`Validra-${environment}`);
   *
   * logger.info("Logger initialized", {
   *   environment,
   *   timestamp: new Date().toISOString()
   * });
   * ```
   *
   * @since 1.0.0
   */
  constructor(source: string) {
    if (source) {
      this.source = source;
    }
  }

  /**
   * Logs a general message to the console.
   *
   * @param message - The message to log
   * @param optionalParams - Additional parameters to include in the log
   *
   * @example
   * ```typescript
   * logger.log("User validation completed", { userId: 123 });
   * ```
   */
  log(message: string, ...optionalParams: any[]): void {
    console.log(`[${this.getTimestamp()}] [${this.source}] ${message}`, ...optionalParams);
  }

  /**
   * Logs a warning message to the console.
   *
   * @param message - The warning message to log
   * @param optionalParams - Additional parameters to include in the warning
   *
   * @example
   * ```typescript
   * logger.warn("Validation rule is deprecated", { rule: "oldRule" });
   * ```
   */
  warn(message: string, ...optionalParams: any[]): void {
    console.warn(`[${this.getTimestamp()}] [${this.source}] ${message}`, ...optionalParams);
  }

  /**
   * Logs an error message to the console and throws an Error.
   *
   * @param message - The error message to log
   * @param optionalParams - Additional parameters to include in the error
   * @throws {Error} Always throws an Error with the formatted message
   *
   * @example
   * ```typescript
   * try {
   *   logger.error("Critical validation failure", { code: "VAL001" });
   * } catch (error) {
   *   // Handle the thrown error
   * }
   * ```
   */
  error(message: string, ...optionalParams: any[]): void {
    const timestamp = this.getTimestamp();
    console.error(`[${timestamp}] [${this.source}] ${message}`, ...optionalParams);
    throw new Error(`[${timestamp}] [${this.source}] ${message}`);
  }

  /**
   * Logs an informational message to the console.
   *
   * @param message - The info message to log
   * @param optionalParams - Additional parameters to include in the info log
   *
   * @example
   * ```typescript
   * logger.info("Validation engine initialized", { version: "1.0.0" });
   * ```
   */
  info(message: string, ...optionalParams: any[]): void {
    console.info(`[${this.getTimestamp()}] [${this.source}] ${message}`, ...optionalParams);
  }

  /**
   * Logs a debug message to the console.
   *
   * @param message - The debug message to log
   * @param optionalParams - Additional parameters to include in the debug log
   *
   * @example
   * ```typescript
   * logger.debug("Processing rule", { rule: rule.name, input: value });
   * ```
   */
  debug(message: string, ...optionalParams: any[]): void {
    console.debug(`[${this.getTimestamp()}] [${this.source}] ${message}`, ...optionalParams);
  }

  /**
   * Logs a trace message with stack trace to the console.
   *
   * @param message - The trace message to log
   * @param optionalParams - Additional parameters to include in the trace log
   *
   * @example
   * ```typescript
   * logger.trace("Entering validation method", { method: "validateUser" });
   * ```
   */
  trace(message: string, ...optionalParams: any[]): void {
    console.trace(`[${this.getTimestamp()}] [${this.source}] ${message}`, ...optionalParams);
  }

  /**
   * Generates an ISO timestamp string for log entries.
   *
   * @returns ISO formatted timestamp string
   * @private
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }
}
