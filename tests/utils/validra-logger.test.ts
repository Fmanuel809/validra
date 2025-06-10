import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ValidraLogger, ValidraLoggerOptions } from '../../src/utils/validra-logger';

describe('ValidraLogger', () => {
  let logger: ValidraLogger;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
    trace: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Reset global state before each test
    ValidraLogger.debugEnabled = false;
    ValidraLogger.silentMode = false;

    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      trace: vi.spyOn(console, 'trace').mockImplementation(() => {}),
    };
    logger = new ValidraLogger('TestLogger');
  });

  afterEach(() => {
    // Restore all console methods and reset global state
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    ValidraLogger.debugEnabled = false;
    ValidraLogger.silentMode = false;
  });

  describe('Constructor and Options', () => {
    test('should create logger with default source', () => {
      const defaultLogger = new ValidraLogger();
      expect(defaultLogger['source']).toBe('Validra Engine');
    });

    test('should create logger with custom source', () => {
      const customLogger = new ValidraLogger('CustomSource');
      expect(customLogger['source']).toBe('CustomSource');
    });

    test('should set global debug state from options', () => {
      expect(ValidraLogger.debugEnabled).toBe(false);
      new ValidraLogger('TestDebug', { debug: true });
      expect(ValidraLogger.debugEnabled).toBe(true);
    });

    test('should set global silent state from options', () => {
      expect(ValidraLogger.silentMode).toBe(false);
      new ValidraLogger('TestSilent', { silent: true });
      expect(ValidraLogger.silentMode).toBe(true);
    });

    test('should handle options with both debug and silent flags', () => {
      const options: ValidraLoggerOptions = { debug: true, silent: true };
      new ValidraLogger('TestBoth', options);
      expect(ValidraLogger.debugEnabled).toBe(true);
      expect(ValidraLogger.silentMode).toBe(true);
    });
  });

  describe('Global State Management', () => {
    test('should affect all logger instances when global state changes', () => {
      const logger1 = new ValidraLogger('Logger1');
      const logger2 = new ValidraLogger('Logger2');

      // Enable debug globally
      ValidraLogger.debugEnabled = true;

      logger1.debug('debug message 1');
      logger2.debug('debug message 2');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(2);
      expect(consoleSpy.debug).toHaveBeenNthCalledWith(1, expect.stringContaining('debug message 1'));
      expect(consoleSpy.debug).toHaveBeenNthCalledWith(2, expect.stringContaining('debug message 2'));
    });

    test('should suppress all logging when silent mode is enabled globally', () => {
      ValidraLogger.silentMode = true;

      logger.log('log message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      logger.debug('debug message');
      logger.trace('trace message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.trace).not.toHaveBeenCalled();
    });
  });

  describe('Centralized Debug Control', () => {
    test('should not log debug messages when debug is disabled', () => {
      ValidraLogger.debugEnabled = false;
      logger.debug('debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    test('should log debug messages when debug is enabled', () => {
      ValidraLogger.debugEnabled = true;
      logger.debug('debug message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('debug message'));
    });

    test('should not log trace messages when debug is disabled', () => {
      ValidraLogger.debugEnabled = false;
      logger.trace('trace message');
      expect(consoleSpy.trace).not.toHaveBeenCalled();
    });

    test('should log trace messages when debug is enabled', () => {
      ValidraLogger.debugEnabled = true;
      logger.trace('trace message');
      expect(consoleSpy.trace).toHaveBeenCalledWith(expect.stringContaining('trace message'));
    });

    test('should override debug mode with silent mode', () => {
      ValidraLogger.debugEnabled = true;
      ValidraLogger.silentMode = true;

      logger.debug('debug message');
      logger.trace('trace message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.trace).not.toHaveBeenCalled();
    });
  });

  describe('Silent Mode Control', () => {
    test('should suppress all logs when silent mode is enabled', () => {
      ValidraLogger.silentMode = true;

      logger.log('log message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    test('should allow all logs when silent mode is disabled', () => {
      ValidraLogger.silentMode = false;

      logger.log('log message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Color Support and Formatting', () => {
    test('should include ANSI color codes in formatted messages', () => {
      logger.log('log message');
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('\x1b[90m')); // Gray color

      logger.info('info message');
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('\x1b[34m')); // Blue color

      logger.warn('warn message');
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('\x1b[33m')); // Yellow color

      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('\x1b[31m')); // Red color
    });

    test('should include reset ANSI code after colored messages', () => {
      logger.log('log message');
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('\x1b[0m')); // Reset color

      logger.info('info message');
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('\x1b[0m')); // Reset color
    });

    test('should format debug messages with cyan color when debug is enabled', () => {
      ValidraLogger.debugEnabled = true;
      logger.debug('debug message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('\x1b[36m')); // Cyan color
    });

    test('should format trace messages with green color when debug is enabled', () => {
      ValidraLogger.debugEnabled = true;
      logger.trace('trace message');
      expect(consoleSpy.trace).toHaveBeenCalledWith(expect.stringContaining('\x1b[32m')); // Green color
    });
  });

  describe('Message Formatting', () => {
    test('should include timestamp in formatted messages', () => {
      logger.log('test message');
      const call = consoleSpy.log.mock.calls[0];
      expect(call?.[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    test('should include source name in formatted messages', () => {
      logger.log('test message');
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[TestLogger]'));
    });

    test('should format message with timestamp, source, and content', () => {
      logger.log('test message');
      const call = consoleSpy.log.mock.calls[0];
      // Should match: [TIMESTAMP] [SOURCE] MESSAGE
      expect(call?.[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestLogger\] test message/);
    });
  });

  describe('Log Methods', () => {
    test('should log message with correct format', () => {
      logger.log('log message');
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] log message/));
    });

    test('should include optional parameters in log', () => {
      const param = { log: 'data' };
      logger.log('log message', param);
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] log message/), param);
    });

    test('should log info message with correct format', () => {
      logger.info('info message');
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] info message/));
    });

    test('should log warn message with correct format', () => {
      logger.warn('warn message');
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] warn message/));
    });

    test('should log error message with correct format', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] error message/));
    });

    test('should log trace message with correct format when debug enabled', () => {
      ValidraLogger.debugEnabled = true;
      logger.trace('trace message');
      expect(consoleSpy.trace).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] trace message/));
    });

    test('should include optional parameters in all log methods', () => {
      const param = { data: 'test' };

      logger.log('log message', param);
      logger.info('info message', param);
      logger.warn('warn message', param);
      logger.error('error message', param);

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.any(String), param);
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.any(String), param);
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.any(String), param);
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.any(String), param);
    });

    test('should handle multiple parameters', () => {
      const param1 = { data: 'test1' };
      const param2 = { data: 'test2' };

      logger.log('log message', param1, param2);
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.any(String), param1, param2);
    });
  });

  describe('Integration Scenarios', () => {
    test('should work correctly with multiple loggers and different options', () => {
      const logger1 = new ValidraLogger('Logger1', { debug: true, silent: false });
      const logger2 = new ValidraLogger('Logger2', { debug: false, silent: true });

      // logger1 settings should override global state (debug: true, silent: false)
      expect(ValidraLogger.debugEnabled).toBe(false); // last one wins
      expect(ValidraLogger.silentMode).toBe(true); // last one wins

      // Reset to test individual logger behavior
      ValidraLogger.debugEnabled = true;
      ValidraLogger.silentMode = false;

      logger1.debug('debug from logger1');
      logger2.info('info from logger2');

      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('debug from logger1'));
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('info from logger2'));
    });

    test('should maintain consistent behavior across logger instances', () => {
      const engineLogger = new ValidraLogger('Engine');
      const validatorLogger = new ValidraLogger('Validator');
      const cacheLogger = new ValidraLogger('Cache');

      ValidraLogger.debugEnabled = true;
      ValidraLogger.silentMode = false;

      engineLogger.debug('engine debug');
      validatorLogger.debug('validator debug');
      cacheLogger.debug('cache debug');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(3);
      expect(consoleSpy.debug).toHaveBeenNthCalledWith(1, expect.stringContaining('[Engine]'));
      expect(consoleSpy.debug).toHaveBeenNthCalledWith(2, expect.stringContaining('[Validator]'));
      expect(consoleSpy.debug).toHaveBeenNthCalledWith(3, expect.stringContaining('[Cache]'));
    });

    test('should handle edge cases with empty messages and parameters', () => {
      logger.log('');
      logger.info('', null, undefined);

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[TestLogger] '));
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('[TestLogger] '), null, undefined);
    });
  });
});
