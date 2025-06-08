import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ValidraLogger } from '../../src/utils/validra-logger';

describe('ValidraLogger', () => {
  let logger: ValidraLogger;
  let consoleSpy: { log: ReturnType<typeof vi.spyOn>; trace: ReturnType<typeof vi.spyOn> };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      trace: vi.spyOn(console, 'trace').mockImplementation(() => {}),
    };
    logger = new ValidraLogger('TestLogger');
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.trace.mockRestore();
  });

  describe('log', () => {
    test('should log message with correct format', () => {
      logger.log('log message');
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] log message/));
    });

    test('should include optional parameters in log', () => {
      const param = { log: 'data' };
      logger.log('log message', param);
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] log message/), param);
    });
  });

  describe('trace', () => {
    test('should log trace message with correct format', () => {
      logger.trace('trace message');
      expect(consoleSpy.trace).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] \[TestLogger\] trace message/));
    });

    test('should include optional parameters in trace', () => {
      const param = { trace: 'data' };
      logger.trace('trace message', param);
      expect(consoleSpy.trace).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] \[TestLogger\] trace message/),
        param,
      );
    });
  });
});
