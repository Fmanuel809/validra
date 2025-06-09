// filepath: c:\sources\repos\validra\tests\integration\index.test.ts
import { describe, expect, it, vi } from 'vitest';

// Test imports from the main index file
import {
  // Component exports
  AsyncValidator,
  CacheManager,
  CallbackManager,
  // DSL exports
  CollectionChecker,
  Comparison,
  DataExtractor,
  DateMatcher,
  Equality,
  ErrorHandler,
  MemoryPoolManager,
  RuleCompiler,
  StreamValidator,
  StringChecker,
  SyncValidator,
  TypeChecker,
  // Engine exports
  ValidraEngine,
  // Utility exports
  ValidraLogger,
  ValidraMemoryPool,
  ValidraStreamingValidator,
  countGraphemes,
  type Rule,
  type ValidraEngineOptions,
  // Interface exports
  type ValidraResult,
} from '../../src/index';
import { basicUserRules, createSuccessCallback, invalidTestData, validTestData } from './fixtures';

describe('Validra Main Index Integration Tests', () => {
  describe('Engine Exports', () => {
    it('should export ValidraEngine class', () => {
      expect(ValidraEngine).toBeDefined();
      expect(typeof ValidraEngine).toBe('function');

      // ValidraEngine requires rules parameter
      const rules: Rule[] = [{ op: 'isEmail', field: 'email' }];
      const engine = new ValidraEngine(rules);
      expect(engine).toBeInstanceOf(ValidraEngine);
    });

    it('should export ValidraStreamingValidator class', () => {
      expect(ValidraStreamingValidator).toBeDefined();
      expect(typeof ValidraStreamingValidator).toBe('function');

      const streamingValidator = new ValidraStreamingValidator();
      expect(streamingValidator).toBeInstanceOf(ValidraStreamingValidator);
    });

    it('should export ValidraMemoryPool class', () => {
      expect(ValidraMemoryPool).toBeDefined();
      expect(typeof ValidraMemoryPool).toBe('function');

      const memoryPool = new ValidraMemoryPool();
      expect(memoryPool).toBeInstanceOf(ValidraMemoryPool);
    });
  });

  describe('Component Exports', () => {
    it('should export all validator components', () => {
      expect(AsyncValidator).toBeDefined();
      expect(SyncValidator).toBeDefined();
      expect(StreamValidator).toBeDefined();

      // These require specific constructor parameters based on interfaces
      const mockRuleCompiler = vi.fn();
      const mockDataExtractor = vi.fn();
      const mockMemoryPool = vi.fn();

      const asyncValidator = new AsyncValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPool as any,
      );
      const syncValidator = new SyncValidator({}, mockDataExtractor as any);
      const streamValidator = new StreamValidator(
        mockRuleCompiler as any,
        mockDataExtractor as any,
        mockMemoryPool as any,
      );

      expect(asyncValidator).toBeInstanceOf(AsyncValidator);
      expect(syncValidator).toBeInstanceOf(SyncValidator);
      expect(streamValidator).toBeInstanceOf(StreamValidator);
    });

    it('should export all management components', () => {
      expect(CacheManager).toBeDefined();
      expect(CallbackManager).toBeDefined();
      expect(DataExtractor).toBeDefined();
      expect(ErrorHandler).toBeDefined();
      expect(MemoryPoolManager).toBeDefined();
      expect(RuleCompiler).toBeDefined();

      const cacheManager = new CacheManager();
      const mockLogger = new ValidraLogger('test');
      const callbackManager = new CallbackManager(mockLogger);
      const dataExtractor = new DataExtractor();
      const errorHandler = new ErrorHandler(mockLogger);
      const memoryPoolManager = new MemoryPoolManager();
      const ruleCompiler = new RuleCompiler(mockLogger);

      expect(cacheManager).toBeInstanceOf(CacheManager);
      expect(callbackManager).toBeInstanceOf(CallbackManager);
      expect(dataExtractor).toBeInstanceOf(DataExtractor);
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
      expect(memoryPoolManager).toBeInstanceOf(MemoryPoolManager);
      expect(ruleCompiler).toBeInstanceOf(RuleCompiler);
    });
  });

  describe('DSL Exports', () => {
    it('should export all DSL helper classes', () => {
      expect(CollectionChecker).toBeDefined();
      expect(Comparison).toBeDefined();
      expect(DateMatcher).toBeDefined();
      expect(Equality).toBeDefined();
      expect(StringChecker).toBeDefined();
      expect(TypeChecker).toBeDefined();

      const collectionChecker = new CollectionChecker();
      const comparison = new Comparison();
      const dateMatcher = new DateMatcher();
      const equality = new Equality();
      const stringChecker = new StringChecker();
      const typeChecker = new TypeChecker();

      expect(collectionChecker).toBeInstanceOf(CollectionChecker);
      expect(comparison).toBeInstanceOf(Comparison);
      expect(dateMatcher).toBeInstanceOf(DateMatcher);
      expect(equality).toBeInstanceOf(Equality);
      expect(stringChecker).toBeInstanceOf(StringChecker);
      expect(typeChecker).toBeInstanceOf(TypeChecker);
    });

    it('should have static methods available on DSL helpers', () => {
      // Test static methods exist
      expect(typeof StringChecker.minLength).toBe('function');
      expect(typeof TypeChecker.isString).toBe('function');
      expect(typeof Equality.isEqual).toBe('function');
      expect(typeof Comparison.isGreaterThan).toBe('function');
    });
  });

  describe('Utility Exports', () => {
    it('should export ValidraLogger class', () => {
      expect(ValidraLogger).toBeDefined();
      expect(typeof ValidraLogger).toBe('function');

      const logger = new ValidraLogger('test');
      expect(logger).toBeInstanceOf(ValidraLogger);
    });

    it('should export utility functions', () => {
      expect(countGraphemes).toBeDefined();
      expect(typeof countGraphemes).toBe('function');

      // Test utility functions
      expect(countGraphemes('hello')).toBe(5);
      expect(countGraphemes('🙂🙂🙂')).toBe(3); // Test emoji counting
    });
  });

  describe('Integration Test - Complete Workflow', () => {
    it('should be able to use engine with proper rule structure', () => {
      const engine = new ValidraEngine(basicUserRules);

      const validData = validTestData.basicUser;
      const invalidData = invalidTestData.invalidEmail;

      // Validate using the engine
      const validResult = engine.validate(validData);
      const invalidResult = engine.validate(invalidData);

      // Verify results
      expect(validResult).toBeDefined();
      expect(typeof validResult.isValid).toBe('boolean');
      expect(validResult.data).toEqual(validData);

      expect(invalidResult).toBeDefined();
      expect(typeof invalidResult.isValid).toBe('boolean');
      expect(invalidResult.data).toEqual(invalidData);
    });

    it('should be able to use memory pool and streaming validator together', () => {
      const memoryPool = new ValidraMemoryPool();
      const streamingValidator = new ValidraStreamingValidator();

      expect(memoryPool).toBeInstanceOf(ValidraMemoryPool);
      expect(streamingValidator).toBeInstanceOf(ValidraStreamingValidator);

      // Verify memory pool metrics
      const metrics = memoryPool.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.hits).toBe('number');
      expect(typeof metrics.misses).toBe('number');
      expect(typeof metrics.allocations).toBe('number');
    });

    it('should be able to create engine with callbacks', () => {
      const engine = new ValidraEngine(basicUserRules, [createSuccessCallback('customTestCallback')]);

      expect(engine).toBeInstanceOf(ValidraEngine);

      // Test validation
      const result = engine.validate(validTestData.basicUser);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('Type Safety Tests', () => {
    it('should have proper TypeScript types for all exports', () => {
      // Test that types are properly exported and can be used
      const engineOptions: ValidraEngineOptions = {
        debug: true,
        throwOnUnknownField: false,
        allowPartialValidation: true,
        enableMemoryPool: true,
        memoryPoolSize: 50,
        enableStreaming: false,
        streamingChunkSize: 100,
      };

      expect(engineOptions).toBeDefined();
      expect(typeof engineOptions.debug).toBe('boolean');
    });

    it('should have proper result types', () => {
      const rules: Rule[] = [{ op: 'isEmail', field: 'email' }];
      const engine = new ValidraEngine(rules);

      const result: ValidraResult = engine.validate({ email: 'test@example.com' });

      // Verify result has proper type structure
      expect(typeof result.isValid).toBe('boolean');
      expect(result.data).toBeDefined();
      expect(['undefined', 'object']).toContain(typeof result.errors);
    });
  });

  describe('Rule Type Tests', () => {
    it('should properly type Rule objects', () => {
      const basicRule = basicUserRules[1] ?? { op: 'isEmail', field: 'email' };
      const ruleWithParams = basicUserRules.find(r => 'params' in r) ?? {
        op: 'gte',
        field: 'age',
        params: { value: 18 },
      };
      const ruleWithMessage = {
        op: 'isEmail',
        field: 'email',
        message: 'Invalid email format',
        code: 'EMAIL_INVALID',
      };
      expect(basicRule.op).toBeDefined();
      expect(typeof basicRule.field).toBe('string');
      if ('params' in ruleWithParams) {
        expect(ruleWithParams.params).toBeDefined();
      }
      expect(ruleWithMessage.message).toBe('Invalid email format');
    });
  });
});
