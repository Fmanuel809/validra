import { ValidraStreamingValidator } from '@/engine/streaming-validator';
import { describe, expect, it, vi } from 'vitest';

describe('ValidraStreamingValidator', () => {
  it('yields valid and invalid results, calls callbacks, and returns summary', async () => {
    const data = [
      { id: 1, valid: true },
      { id: 2, valid: false },
      { id: 3, valid: true },
    ];
    const onChunkComplete = vi.fn();
    const onComplete = vi.fn();
    const validator = new ValidraStreamingValidator({ onChunkComplete, onComplete });
    const validate = (item: { id: number; valid: boolean }) =>
      Promise.resolve({
        isValid: item.valid,
        data: item,
        errors: item.valid ? undefined : { id: [{ message: 'error' }, { message: 'error2' }] },
      }) as any;
    const results: any[] = [];
    for await (const res of validator.validateStream(data, validate)) {
      results.push(res);
    }
    expect(results).toHaveLength(3);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[1].errors).toHaveProperty('id');
    expect(Array.isArray(results[1].errors.id)).toBe(true);
    expect(results[1].errors.id[0]).toBe('error');
    expect(onChunkComplete).toHaveBeenCalledTimes(3);
    expect(onComplete).toHaveBeenCalledTimes(1);
    const summary = onComplete.mock.calls[0]?.[0];
    expect(summary).toHaveProperty('totalProcessed', 3);
    expect(summary).toHaveProperty('totalInvalid', 1);
  });

  it('handles validator exceptions and yields error result', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    const validator = new ValidraStreamingValidator();
    const validate = (item: any) => {
      if (item.id === 2) {
        throw new Error('fail');
      }
      return { isValid: true, data: item };
    };
    const results: any[] = [];
    for await (const res of validator.validateStream(data, validate)) {
      results.push(res);
    }
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[1].errors.validation[0]).toContain('fail');
  });

  it('returns correct summary for empty input', async () => {
    const validator = new ValidraStreamingValidator();
    const validate = (item: any) => ({ isValid: true, data: item });
    const iter = validator.validateStream([], validate);
    const { value: summary, done } = await iter.next();
    expect(done).toBe(true);
    expect(summary).toMatchObject({ totalProcessed: 0, totalValid: 0, totalInvalid: 0, totalErrors: 0 });
  });

  it('convertErrors returns empty object for empty errors', () => {
    const validator = new ValidraStreamingValidator();
    // @ts-expect-error acceso a método privado
    expect(validator.convertErrors({})).toEqual({});
  });

  it('convertErrors normalizes error formats', () => {
    const validator = new ValidraStreamingValidator();
    // @ts-expect-error acceso a método privado
    const result = validator.convertErrors({
      field1: ['err1', { message: 'err2' }],
      field2: 'err3',
    });
    expect(result.field1).toEqual(['err1', 'err2']);
    expect(result.field2).toEqual(['err3']);
  });

  it('createArrayStream yields all items in order', () => {
    const arr = [1, 2, 3];
    const gen = ValidraStreamingValidator.createArrayStream(arr);
    expect([...gen]).toEqual(arr);
  });
});
