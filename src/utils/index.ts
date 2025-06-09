/**
 * @fileoverview Utility functions, type guards, and helper tools for enhanced development experience
 * @module utils
 * @version 1.0.0
 * @author Validra Team
 * @since 1.0.0
 */

/**
 * Utility module providing essential helper functions, type guards, and development tools.
 *
 * The utils module offers a comprehensive collection of utility functions and type
 * definitions that enhance the development experience and provide essential functionality
 * throughout the Validra ecosystem. Designed to support common development patterns,
 * improve type safety, and provide debugging and diagnostic capabilities.
 *
 * Exported components:
 * - **Utility Functions**: Helper functions for string manipulation and data processing
 * - **Utility Guards**: Type guard functions for runtime type checking and validation
 * - **Utility Types**: Type definitions for enhanced type safety and development experience
 * - **Validra Logger**: Comprehensive logging utility for debugging and monitoring
 *
 * Key features:
 * - **Type Safety**: Comprehensive type guards and TypeScript integration
 * - **Unicode Support**: International text processing and character counting
 * - **Runtime Validation**: Safe type checking and null/undefined detection
 * - **Logging Framework**: Structured logging with source identification and formatting
 * - **Performance Optimized**: Minimal overhead utility functions for production use
 * - **Developer Experience**: Enhanced debugging and diagnostic capabilities
 *
 * Utility categories:
 * - **String Processing**: Unicode-aware string manipulation and analysis
 * - **Type Checking**: Runtime type validation and safety checks
 * - **Null Safety**: Comprehensive null and undefined detection
 * - **Numeric Validation**: Number type checking with NaN exclusion
 * - **Logging**: Structured diagnostic output and debugging support
 *
 * @public
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Import utility functions for data processing
 * import { countGraphemes, isNullOrUndefined, isNumber } from 'validra/utils';
 *
 * // Use utilities for safe data handling
 * const length = countGraphemes("Hello 🌍!"); // 9
 * const isValid = !isNullOrUndefined(userData) && isNumber(userData.age);
 * ```
 *
 * @example
 * ```typescript
 * // Import logger for debugging and monitoring
 * import { ValidraLogger } from 'validra/utils';
 *
 * const logger = new ValidraLogger('MyComponent');
 * logger.info('Processing validation', { ruleCount: 25 });
 * ```
 *
 * @see {@link countGraphemes} for Unicode-aware string length calculation
 * @see {@link isNullOrUndefined} for null safety checking
 * @see {@link isNumber} for numeric type validation
 * @see {@link ValidraLogger} for structured logging
 */

// String manipulation and Unicode processing utilities
export * from './utility-functions';

// Type guard functions for runtime type checking
export * from './utility-guards';

// Type definitions for enhanced type safety
export * from './utility.types';

// Comprehensive logging utility
export * from './validra-logger';
