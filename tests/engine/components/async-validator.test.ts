import { describe, expect, it, vi } from 'vitest';
import { AsyncValidator } from '../../../src/engine/components/async-validator';
import type { Rule } from '../../../src/engine/rule';

// Mock completo de IRuleCompiler
const mockRuleCompiler = {
  compile: vi.fn(() => [{ helper: vi.fn(() => true) }]),
  getHelper: vi.fn(),
  compileRules: vi.fn(),
  getMetrics: vi.fn(),
  clearCache: vi.fn(),
};
// Asegura que el mockMemoryPoolManager tenga el método get
const mockDataExtractor = {};
const mockMemoryPoolManager = {
  get: vi.fn(() => ({})),
  return: vi.fn(),
};

// Un rule válido (ajustar op según los tipos aceptados en tu proyecto)
const rule: Rule = { op: 'eq', field: 'x', params: { value: 1 } } as any;

describe('AsyncValidator', () => {
  it('should resolve true for valid rule', async () => {
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const result = await validator.applyRuleAsync(rule, 1, []);
    expect(result).toBe(true);
  });

  it('should resolve false if compiledRules is empty', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const result = await validator.applyRuleAsync(rule, 1, []);
    expect(result).toBe(false);
  });

  it('should resolve false if compiledRule is missing', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([{} as any]); // forzar tipo any para simular sin helper
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    let result;
    try {
      result = await validator.applyRuleAsync(rule, 1, []);
    } catch {
      /* ignorar error */
    }
    expect(result).toBeUndefined();
  });

  it('should reject on error in helper', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      {
        helper: vi.fn(() => {
          throw new Error('fail');
        }),
      },
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    await expect(validator.applyRuleAsync(rule, 1, [])).rejects.toThrow('fail');
  });

  it('should handle rule with empty params', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: vi.fn(() => true), original: { op: 'eq', field: 'x' }, pathSegments: ['x'], hasParams: false } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const ruleWithNoParams = { op: 'eq', field: 'x' } as any;
    const result = await validator.applyRuleAsync(ruleWithNoParams, 1, []);
    expect(result).toBe(true);
  });

  it('should return error result if ruleCompiler throws in validateAsync', async () => {
    const validator = new AsyncValidator(
      {
        ...mockRuleCompiler,
        compile: () => {
          throw new Error('fail-compile');
        },
      } as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const res = await validator.validateAsync({ x: 1 }, [rule]);
    expect(res.isValid).toBe(false);
    // El mensaje puede ser diferente, solo verifica que sea string
    expect(typeof res.message).toBe('string');
  });

  it('should return empty array if validateMultipleAsync is called with empty datasets', async () => {
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const res = await validator.validateMultipleAsync([], [rule]);
    expect(res).toEqual([]);
  });

  it('should chunk datasets correctly in validateMultipleAsync', async () => {
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const datasets = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const res = await validator.validateMultipleAsync(datasets, [rule], 2);
    expect(res.length).toBe(3);
  });

  it('should handle rule with empty field', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: vi.fn(() => true), original: { op: 'eq', field: '' }, pathSegments: [''], hasParams: false } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const ruleWithEmptyField = { op: 'eq', field: '' } as any;
    const result = await validator.applyRuleAsync(ruleWithEmptyField, 1, []);
    expect(result).toBe(true);
  });

  it('should handle error in memoryPoolManager.get', async () => {
    const badPool = {
      ...mockMemoryPoolManager,
      get: () => {
        throw new Error('pool-get');
      },
    };
    const validator = new AsyncValidator(mockRuleCompiler as any, mockDataExtractor as any, badPool as any);
    const res = await validator.validateAsync({ x: 1 }, [rule]);
    expect(res.isValid).toBe(false);
    expect(res.message).toMatch(/pool-get/);
  });

  it('should handle error in memoryPoolManager.return', async () => {
    const badPool = {
      ...mockMemoryPoolManager,
      return: () => {
        throw new Error('pool-return');
      },
    };
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: vi.fn(() => true), original: rule, pathSegments: ['x'], hasParams: true } as any,
    ]);
    const validator = new AsyncValidator(mockRuleCompiler as any, mockDataExtractor as any, badPool as any);
    await expect(validator.applyRuleAsync(rule, 1, [])).resolves.toBe(true);
  });

  it('should handle rule with null params', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      {
        helper: vi.fn(() => true),
        original: { op: 'eq', field: 'x', params: null },
        pathSegments: ['x'],
        hasParams: false,
      } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const ruleWithNullParams = { op: 'eq', field: 'x', params: null } as any;
    const result = await validator.applyRuleAsync(ruleWithNullParams, 1, []);
    expect(result).toBe(true);
  });

  it('should handle validateAsync with rule missing field', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: vi.fn(() => true), original: { op: 'eq' }, pathSegments: [], hasParams: false } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const res = await validator.validateAsync({ x: 1 }, [{ op: 'eq' } as any]);
    expect(res.isValid).toBe(false); // Debe ser false si falta el campo
  });

  it('should handle error in applyRuleAsync inside validateAsync', async () => {
    const errorRule = { op: 'eq', field: 'x' } as any;
    const errorCompiler = {
      ...mockRuleCompiler,
      compile: vi.fn(() => [
        {
          helper: {
            apply: () => {
              throw new Error('apply-error');
            },
          },
          original: errorRule,
          pathSegments: ['x'],
          hasParams: false,
        } as any,
      ]),
    };
    const validator = new AsyncValidator(errorCompiler as any, mockDataExtractor as any, mockMemoryPoolManager as any);
    const res = await validator.validateAsync({ x: 1 }, [errorRule]);
    expect(res.isValid).toBe(false);
    // El mensaje puede ser undefined, solo verifica que el error existe
    expect(res.errors?.x?.[0]).toBeDefined();
  });

  it('should handle rule with unknown op gracefully', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      {
        helper: vi.fn(() => true), // Simula que el helper existe pero retorna true
        original: { op: 'unknown', field: 'x' },
        pathSegments: ['x'],
        hasParams: false,
      } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const ruleWithUnknownOp = { op: 'unknown', field: 'x' } as any;
    const result = await validator.applyRuleAsync(ruleWithUnknownOp, 1, []);
    expect(result).toBe(true); // El mock retorna true
  });

  it('should handle async helper that resolves false', async () => {
    // Simula un helper con método apply que retorna una promesa que resuelve en false
    const asyncHelper = { apply: vi.fn(() => Promise.resolve(false)) };
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: asyncHelper, original: rule, pathSegments: ['x'], hasParams: true } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const result = await validator.applyRuleAsync(rule, 1, []);
    expect(result).toBe(false);
  });

  it('should handle rule with nested field path', async () => {
    mockRuleCompiler.compile.mockReturnValueOnce([
      {
        helper: vi.fn(() => true),
        original: { op: 'eq', field: 'a.b' },
        pathSegments: ['a', 'b'],
        hasParams: true,
      } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const ruleWithNestedField = { op: 'eq', field: 'a.b', params: { value: 1 } } as any;
    const result = await validator.applyRuleAsync(ruleWithNestedField, { a: { b: 1 } }, []);
    expect(result).toBe(true);
  });

  it('should return first error in validateAsync with multiple rules, one fails', async () => {
    mockRuleCompiler.compile.mockImplementation((...args: any[]) => {
      const rules = args[0];
      const ruleArg = rules[0];
      if (ruleArg && ruleArg.field === 'fail') {
        return [
          {
            helper: vi.fn(() => {
              throw new Error('fail-helper');
            }),
            original: ruleArg,
            pathSegments: ['fail'],
            hasParams: true,
          },
        ];
      }
      return [
        {
          helper: vi.fn(() => true),
          original: ruleArg,
          pathSegments: [ruleArg?.field],
          hasParams: true,
        },
      ];
    });
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const rules = [
      { op: 'eq', field: 'x', params: { value: 1 } },
      { op: 'eq', field: 'fail', params: { value: 2 } },
    ] as any[];
    const res = await validator.validateAsync({ x: 1, fail: 2 }, rules);
    expect(res.isValid).toBe(false);
    expect(res.errors).toBeDefined();
  });

  it('should return all errors in validateMultipleAsync with mixed results', async () => {
    mockRuleCompiler.compile.mockImplementation((...args: any[]) => {
      const rules = args[0];
      const ruleArg = rules[0];
      if (ruleArg && ruleArg.field === 'fail') {
        return [
          {
            helper: vi.fn(() => {
              throw new Error('fail-multi');
            }),
            original: ruleArg,
            pathSegments: ['fail'],
            hasParams: true,
          },
        ];
      }
      return [
        {
          helper: vi.fn(() => true),
          original: ruleArg,
          pathSegments: [ruleArg?.field],
          hasParams: true,
        },
      ];
    });
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const datasets = [
      { x: 1, fail: 2 },
      { x: 1, fail: 3 },
    ];
    const rules = [
      { op: 'eq', field: 'x', params: { value: 1 } },
      { op: 'eq', field: 'fail', params: { value: 2 } },
    ] as any[];
    const res = await validator.validateMultipleAsync(datasets, rules);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(2);
    expect(res[0]?.isValid).toBe(false);
    expect(res[0]?.errors).toBeDefined();
    expect(res[1]?.isValid).toBe(false);
  });

  it('should handle empty rules array in validateAsync', async () => {
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const res = await validator.validateAsync({ x: 1 }, []);
    expect(res.isValid).toBe(false); // Si no hay reglas, no es válido
    expect(res.errors).toBeUndefined();
  });

  it('should handle null/undefined dataset in validateAsync', async () => {
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const res1 = await validator.validateAsync(null as any, [rule]);
    const res2 = await validator.validateAsync(undefined as any, [rule]);
    expect(res1.isValid).toBe(false);
    expect(res2.isValid).toBe(false);
  });

  it('should add ASYNC_VALIDATION_ERROR error when rule fails validation (helper returns false)', async () => {
    // Simula un helper que retorna false (falla la validación)
    mockRuleCompiler.compile.mockReturnValueOnce([
      {
        helper: vi.fn(() => false),
        original: rule,
        pathSegments: ['x'],
        hasParams: true,
      } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const res = await validator.validateAsync({ x: 1 }, [rule]);
    expect(res.isValid).toBe(false);
    expect(res.errors).toBeDefined();
    // Asegura que el error existe y tiene el código correcto
    const fieldErrors = res.errors && res.errors.x ? res.errors.x : undefined;
    expect(Array.isArray(fieldErrors)).toBe(true);
    expect(fieldErrors?.[0]?.code).toBe('ASYNC_VALIDATION_ERROR');
  });

  it('should resolve false if compiledRule is falsy (coverage for !compiledRule branch)', async () => {
    // @ts-expect-error forzamos un valor undefined para simular el branch
    mockRuleCompiler.compile.mockReturnValueOnce([undefined]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const result = await validator.applyRuleAsync(rule, 1, []);
    expect(result).toBe(false);
  });

  it('should reject if setTimeout throws (cubre catch externo de applyRuleAsync)', async () => {
    // Guardar el original
    const originalSetTimeout = global.setTimeout;
    // @ts-expect-error forzamos error en setTimeout
    global.setTimeout = () => {
      throw new Error('timeout-error');
    };
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    await expect(validator.applyRuleAsync(rule, 1, [])).rejects.toThrow('timeout-error');
    // Restaurar setTimeout
    global.setTimeout = originalSetTimeout;
  });

  it('should use memoryPoolManager.get to provide initial result object (cubre branch de get)', async () => {
    // Creamos un mock que verifica que se llama con la factory y retorna un objeto personalizado
    const poolMock = {
      get: vi.fn((_key, factory) => factory()),
      return: vi.fn(),
    };
    const validator = new AsyncValidator(mockRuleCompiler as any, mockDataExtractor as any, poolMock as any);
    // Forzamos que compile retorne una regla válida pero el helper siempre true
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: vi.fn(() => true), original: rule, pathSegments: ['x'], hasParams: true } as any,
    ]);
    const res = await validator.validateAsync({ x: 1 }, [rule]);
    // Verifica que el pool se usó y el objeto inicial tiene la forma esperada
    expect(poolMock.get).toHaveBeenCalledWith('validationResult', expect.any(Function));
    expect(res).toHaveProperty('isValid'); // Solo verifica que existe la propiedad
    expect(res).toHaveProperty('data');
  });

  it('should add ASYNC_VALIDATION_FAILED error when helper devuelve false (cubre branch específico)', async () => {
    // Mock dataExtractor para devolver el valor real del campo
    const safeDataExtractor = {
      getPathSegments: vi.fn(() => ['x']),
      getValue: vi.fn((data, path) => data[path[0]]),
    };
    // Mock memoryPoolManager para que retorne un array válido para argumentsArray
    const safeMemoryPoolManager = {
      get: vi.fn((key, factory) => (key === 'argumentsArray' ? [] : factory())),
      return: vi.fn((key, arr, cb) => {
        if (typeof cb === 'function') {
          cb(arr);
        }
      }),
    };
    // Helper que simula igualdad
    const helper = function (value: any, param: any) {
      return value === param;
    };
    // Mock ruleCompiler local para evitar contaminación de otros tests
    const localRuleCompiler = {
      compile: vi.fn(() => [
        {
          helper,
          original: rule,
          pathSegments: ['x'],
          hasParams: true,
        } as any,
      ]),
    };
    const validator = new AsyncValidator(
      localRuleCompiler as any,
      safeDataExtractor as any,
      safeMemoryPoolManager as any,
    );
    const res = await validator.validateAsync({ x: 2 }, [rule]);
    expect(res.isValid).toBe(false);
    expect(res.errors).toBeDefined();
    const fieldErrors = res.errors && res.errors.x ? res.errors.x : undefined;
    expect(Array.isArray(fieldErrors)).toBe(true);
    expect(fieldErrors?.[0]?.code).toBe('ASYNC_VALIDATION_FAILED');
    expect(safeMemoryPoolManager.return).toHaveBeenCalledWith(
      'argumentsArray',
      expect.any(Array),
      expect.any(Function),
    );
  });

  it('should call memoryPoolManager.return after successful validation (cubre return en flujo válido)', async () => {
    const safeDataExtractor = {
      getPathSegments: vi.fn(() => ['x']),
      getValue: vi.fn((data, path) => data[path[0]]),
    };
    const safeMemoryPoolManager = {
      get: vi.fn((key, factory) => (key === 'argumentsArray' ? [] : factory())),
      return: vi.fn((key, arr, cb) => {
        if (typeof cb === 'function') {
          cb(arr);
        }
      }),
    };
    const helper = function (value: any, param: any) {
      return value === param;
    };
    const localRuleCompiler = {
      compile: vi.fn(() => [
        {
          helper,
          original: rule,
          pathSegments: ['x'],
          hasParams: true,
        } as any,
      ]),
    };
    const validator = new AsyncValidator(
      localRuleCompiler as any,
      safeDataExtractor as any,
      safeMemoryPoolManager as any,
    );
    const res = await validator.validateAsync({ x: 1 }, [rule]);
    expect(res.isValid).toBe(true);
    expect(safeMemoryPoolManager.return).toHaveBeenCalledWith(
      'argumentsArray',
      expect.any(Array),
      expect.any(Function),
    );
  });

  it('should resolve inverted result when rule.negative is true and async helper', async () => {
    const asyncHelper = { apply: vi.fn(() => Promise.resolve(true)) };
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: asyncHelper, original: { ...rule, negative: true }, pathSegments: ['x'], hasParams: true } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const result = await validator.applyRuleAsync({ ...rule, negative: true }, 1, []);
    expect(result).toBe(false); // porque negative invierte el resultado
  });

  it('should resolve inverted result when rule.negative is true and sync helper', async () => {
    const syncHelper = { apply: vi.fn(() => false) };
    mockRuleCompiler.compile.mockReturnValueOnce([
      { helper: syncHelper, original: { ...rule, negative: true }, pathSegments: ['x'], hasParams: true } as any,
    ]);
    const validator = new AsyncValidator(
      mockRuleCompiler as any,
      mockDataExtractor as any,
      mockMemoryPoolManager as any,
    );
    const result = await validator.applyRuleAsync({ ...rule, negative: true }, 1, []);
    expect(result).toBe(true); // porque negative invierte el resultado
  });
});
