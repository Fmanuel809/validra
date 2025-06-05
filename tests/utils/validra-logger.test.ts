import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ValidraLogger } from '../../src/utils/validra-logger';

describe('ValidraLogger', () => {
    let logger: ValidraLogger;
    let consoleSpy: {
        log: any;
        warn: any;
        error: any;
        info: any;
        debug: any;
        trace: any;
    };

    beforeEach(() => {
        // Mock all console methods
        consoleSpy = {
            log: vi.spyOn(console, 'log').mockImplementation(() => {}),
            warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
            error: vi.spyOn(console, 'error').mockImplementation(() => {}),
            info: vi.spyOn(console, 'info').mockImplementation(() => {}),
            debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
            trace: vi.spyOn(console, 'trace').mockImplementation(() => {})
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        test('should use default source when no parameter provided', () => {
            logger = new ValidraLogger('');
            logger.log('test message');
            
            expect(consoleSpy.log).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[Validra Engine\] test message/)
            );
        });

        test('should use custom source when provided', () => {
            logger = new ValidraLogger('CustomSource');
            logger.log('test message');
            
            expect(consoleSpy.log).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[CustomSource\] test message/)
            );
        });

        test('should handle empty string as source', () => {
            logger = new ValidraLogger('');
            logger.log('test message');
            
            expect(consoleSpy.log).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[Validra Engine\] test message/)
            );
        });
    });

    describe('log', () => {
        beforeEach(() => {
            logger = new ValidraLogger('TestLogger');
        });

        test('should log message with correct format', () => {
            logger.log('test message');
            
            expect(consoleSpy.log).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] test message/)
            );
        });

        test('should include optional parameters', () => {
            const param1 = { key: 'value' };
            const param2 = 'extra info';
            
            logger.log('test message', param1, param2);
            
            expect(consoleSpy.log).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] test message/),
                param1,
                param2
            );
        });

        test('should include ISO timestamp in message', () => {
            const beforeTime = new Date().toISOString().substring(0, 10); // Just date part
            logger.log('test message');
            
            const logCall = consoleSpy.log.mock.calls[0][0];
            expect(logCall).toContain(beforeTime);
        });
    });

    describe('warn', () => {
        beforeEach(() => {
            logger = new ValidraLogger('TestLogger');
        });

        test('should warn message with correct format', () => {
            logger.warn('warning message');
            
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] warning message/)
            );
        });

        test('should include optional parameters in warning', () => {
            const param = { warning: 'details' };
            
            logger.warn('warning message', param);
            
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] warning message/),
                param
            );
        });
    });

    describe('error', () => {
        beforeEach(() => {
            logger = new ValidraLogger('TestLogger');
        });

        test('should log error and throw exception', () => {
            expect(() => {
                logger.error('error message');
            }).toThrow('error message');
            
            expect(consoleSpy.error).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] error message/)
            );
        });

        test('should include optional parameters in error', () => {
            const param = { error: 'details' };
            
            expect(() => {
                logger.error('error message', param);
            }).toThrow('error message');
            
            expect(consoleSpy.error).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] error message/),
                param
            );
        });

        test('should throw Error with formatted message', () => {
            expect(() => {
                logger.error('critical error');
            }).toThrow(/\[.*\] \[TestLogger\] critical error/);
        });
    });

    describe('info', () => {
        beforeEach(() => {
            logger = new ValidraLogger('TestLogger');
        });

        test('should log info message with correct format', () => {
            logger.info('info message');
            
            expect(consoleSpy.info).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] info message/)
            );
        });

        test('should include optional parameters in info', () => {
            const param = { info: 'data' };
            
            logger.info('info message', param);
            
            expect(consoleSpy.info).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] info message/),
                param
            );
        });
    });

    describe('debug', () => {
        beforeEach(() => {
            logger = new ValidraLogger('TestLogger');
        });

        test('should log debug message with correct format', () => {
            logger.debug('debug message');
            
            expect(consoleSpy.debug).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] debug message/)
            );
        });

        test('should include optional parameters in debug', () => {
            const param = { debug: 'info' };
            
            logger.debug('debug message', param);
            
            expect(consoleSpy.debug).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] debug message/),
                param
            );
        });
    });

    describe('trace', () => {
        beforeEach(() => {
            logger = new ValidraLogger('TestLogger');
        });

        test('should log trace message with correct format', () => {
            logger.trace('trace message');
            
            expect(consoleSpy.trace).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] trace message/)
            );
        });

        test('should include optional parameters in trace', () => {
            const param = { trace: 'data' };
            
            logger.trace('trace message', param);
            
            expect(consoleSpy.trace).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[TestLogger\] trace message/),
                param
            );
        });
    });

    describe('timestamp generation', () => {
        test('should generate valid ISO timestamp', () => {
            logger = new ValidraLogger('TestLogger');
            logger.log('test');
            
            const logCall = consoleSpy.log.mock.calls[0][0];
            const timestampMatch = logCall.match(/\[(.*?)\]/);
            
            expect(timestampMatch).toBeTruthy();
            const timestamp = timestampMatch[1];
            expect(() => new Date(timestamp)).not.toThrow();
            expect(new Date(timestamp).toISOString()).toBe(timestamp);
        });
    });

    describe('integration tests', () => {
        test('should handle multiple consecutive log calls', () => {
            logger = new ValidraLogger('IntegrationTest');
            
            logger.log('first message');
            logger.warn('warning message');
            logger.info('info message');
            
            expect(consoleSpy.log).toHaveBeenCalledTimes(1);
            expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
            expect(consoleSpy.info).toHaveBeenCalledTimes(1);
        });

        test('should work with complex objects as parameters', () => {
            logger = new ValidraLogger('ComplexTest');
            const complexObject = {
                nested: {
                    array: [1, 2, 3],
                    object: { key: 'value' }
                },
                date: new Date(),
                func: () => 'test'
            };
            
            logger.info('Complex object test', complexObject);
            
            expect(consoleSpy.info).toHaveBeenCalledWith(
                expect.stringMatching(/\[.*\] \[ComplexTest\] Complex object test/),
                complexObject
            );
        });
    });
});
