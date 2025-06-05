/**
 * A comprehensive logging utility for the Validra library.
 * 
 * Provides structured logging with timestamps and source identification.
 * Supports all standard console logging levels with consistent formatting.
 * 
 * @example
 * ```typescript
 * // Using with default source
 * const logger = new ValidraLogger();
 * logger.log("Processing validation");
 * 
 * // Using with custom source
 * const customLogger = new ValidraLogger("ValidationEngine");
 * customLogger.info("Starting validation process");
 * customLogger.warn("Deprecated method used");
 * ```
 */
export class ValidraLogger {
    /** The source identifier for log messages */
    protected source = 'Validra Engine';
    
    /**
     * Creates a new ValidraLogger instance.
     * 
     * @param source - Optional custom source name for log messages.
     *                If not provided, defaults to 'Validra Engine'
     * 
     * @example
     * ```typescript
     * const logger = new ValidraLogger("MyModule");
     * ```
     */
    constructor (source: string) {
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
        console.error(`[${this.getTimestamp()}] [${this.source}] ${message}`, ...optionalParams);
        throw new Error(`[${this.getTimestamp()}] [${this.source}] ${message}`);
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