import { DateMatcher } from '@/dsl/helpers/date-matcher';
import { describe, expect, it } from 'vitest';

describe('DateMatcher', () => {
  describe('isAfter', () => {
    it('returns true if date is after reference', () => {
      const date = new Date('2025-01-02T00:00:00Z');
      const ref = new Date('2025-01-01T00:00:00Z');
      expect(DateMatcher.isAfter(date, ref)).toBe(true);
    });
    it('returns false if date is before reference', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      const ref = new Date('2025-01-02T00:00:00Z');
      expect(DateMatcher.isAfter(date, ref)).toBe(false);
    });
    it('returns false if date equals reference', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      expect(DateMatcher.isAfter(date, date)).toBe(false);
    });
    it('throws if either argument is not a Date', () => {
      // @ts-expect-error Testing error branch: first arg not Date
      expect(() => DateMatcher.isAfter('2025-01-01', new Date())).toThrow();
      // @ts-expect-error Testing error branch: second arg not Date
      expect(() => DateMatcher.isAfter(new Date(), '2025-01-01')).toThrow();
    });
  });

  describe('isBefore', () => {
    it('returns true if date is before reference', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      const ref = new Date('2025-01-02T00:00:00Z');
      expect(DateMatcher.isBefore(date, ref)).toBe(true);
    });
    it('returns false if date is after reference', () => {
      const date = new Date('2025-01-02T00:00:00Z');
      const ref = new Date('2025-01-01T00:00:00Z');
      expect(DateMatcher.isBefore(date, ref)).toBe(false);
    });
    it('returns false if date equals reference', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      expect(DateMatcher.isBefore(date, date)).toBe(false);
    });
    it('throws if either argument is not a Date', () => {
      // @ts-expect-error Testing error branch: first arg not Date
      expect(() => DateMatcher.isBefore('2025-01-01', new Date())).toThrow();
      // @ts-expect-error Testing error branch: second arg not Date
      expect(() => DateMatcher.isBefore(new Date(), '2025-01-01')).toThrow();
    });
  });

  describe('isToday', () => {
    it('returns true for today (UTC)', () => {
      const now = new Date();
      expect(DateMatcher.isToday(now)).toBe(true);
      // Also test with UTC midnight
      const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      expect(DateMatcher.isToday(utcMidnight)).toBe(true);
    });
    it('returns false for a different day', () => {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      expect(DateMatcher.isToday(yesterday)).toBe(false);
    });
    it('throws if not a Date', () => {
      // @ts-expect-error Testing error branch: not a Date
      expect(() => DateMatcher.isToday('2025-01-01')).toThrow();
    });
  });

  describe('isWeekend', () => {
    it('returns true for Saturday (UTC)', () => {
      expect(DateMatcher.isWeekend(new Date('2025-01-04T00:00:00Z'))).toBe(true);
    });
    it('returns true for Sunday (UTC)', () => {
      expect(DateMatcher.isWeekend(new Date('2025-01-05T00:00:00Z'))).toBe(true);
    });
    it('returns false for Monday (UTC)', () => {
      expect(DateMatcher.isWeekend(new Date('2025-01-06T00:00:00Z'))).toBe(false);
    });
    it('throws if not a Date', () => {
      // @ts-expect-error Testing error branch: not a Date
      expect(() => DateMatcher.isWeekend('2025-01-04')).toThrow();
    });
  });

  describe('isWeekday', () => {
    it('returns true for Monday (UTC)', () => {
      expect(DateMatcher.isWeekday(new Date('2025-01-06T00:00:00Z'))).toBe(true);
    });
    it('returns true for Friday (UTC)', () => {
      expect(DateMatcher.isWeekday(new Date('2025-01-10T00:00:00Z'))).toBe(true);
    });
    it('returns false for Saturday (UTC)', () => {
      expect(DateMatcher.isWeekday(new Date('2025-01-11T00:00:00Z'))).toBe(false);
    });
    it('returns false for Sunday (UTC)', () => {
      expect(DateMatcher.isWeekday(new Date('2025-01-12T00:00:00Z'))).toBe(false);
    });
    it('throws if not a Date', () => {
      // @ts-expect-error Testing error branch: not a Date
      expect(() => DateMatcher.isWeekday('2025-01-06')).toThrow();
    });
  });

  describe('isLeapYear', () => {
    it('returns true for a leap year (divisible by 4, not 100)', () => {
      expect(DateMatcher.isLeapYear(new Date('2024-01-01T00:00:00Z'))).toBe(true);
    });
    it('returns false for a non-leap year', () => {
      expect(DateMatcher.isLeapYear(new Date('2023-01-01T00:00:00Z'))).toBe(false);
    });
    it('returns true for a leap year (divisible by 400)', () => {
      expect(DateMatcher.isLeapYear(new Date('2000-01-01T00:00:00Z'))).toBe(true);
    });
    it('returns false for a year divisible by 100 but not 400', () => {
      expect(DateMatcher.isLeapYear(new Date('1900-01-01T00:00:00Z'))).toBe(false);
    });
    it('throws if not a Date', () => {
      // @ts-expect-error Testing error branch: not a Date
      expect(() => DateMatcher.isLeapYear('2024-01-01')).toThrow();
    });
  });
});
