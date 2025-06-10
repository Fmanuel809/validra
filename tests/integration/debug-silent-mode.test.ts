import { describe, expect, test, vi } from 'vitest';
import { ValidraEngine } from '../../src/index';

describe('Debug and Silent Mode Integration', () => {
  test('should control logging through debug and silent options', () => {
    const consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };

    try {
      // Test with debug=false (default) - should show info logs but not debug
      const engine1 = new ValidraEngine([{ op: 'isEmail', field: 'email' }], { debug: false });
      engine1.validate({ email: 'test@example.com' });

      expect(consoleSpy.info).toHaveBeenCalled(); // Engine initialization
      expect(consoleSpy.debug).not.toHaveBeenCalled(); // No debug logs

      consoleSpy.info.mockClear();
      consoleSpy.debug.mockClear();

      // Test with debug=true - should show both info and debug logs
      const engine2 = new ValidraEngine([{ op: 'isEmail', field: 'email' }], { debug: true });
      engine2.validate({ email: 'test@example.com' });

      expect(consoleSpy.info).toHaveBeenCalled(); // Engine initialization
      expect(consoleSpy.debug).toHaveBeenCalled(); // Debug logs should appear

      consoleSpy.info.mockClear();
      consoleSpy.debug.mockClear();

      // Test with silent=true - should suppress all logs
      const engine3 = new ValidraEngine([{ op: 'isEmail', field: 'email' }], { debug: true, silent: true });
      engine3.validate({ email: 'test@example.com' });

      expect(consoleSpy.info).not.toHaveBeenCalled(); // All logs suppressed
      expect(consoleSpy.debug).not.toHaveBeenCalled(); // All logs suppressed
    } finally {
      consoleSpy.log.mockRestore();
      consoleSpy.info.mockRestore();
      consoleSpy.debug.mockRestore();
    }
  });

  test('should handle combination of debug and silent flags correctly', () => {
    const consoleSpy = {
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };

    try {
      // Silent mode should override debug mode
      const engine = new ValidraEngine([{ op: 'isEmail', field: 'email' }], { debug: true, silent: true });
      const result = engine.validate({ email: 'test@example.com' });

      expect(result.isValid).toBe(true);
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    } finally {
      consoleSpy.info.mockRestore();
      consoleSpy.debug.mockRestore();
    }
  });
});
