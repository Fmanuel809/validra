import { describe, it, expect } from "vitest";
import { Equality } from "@/dls/helpers/equality";

describe("DSL - Equality Helper", () => {
  describe("isEqual", () => {
    it("should return true for equal primitive values", () => {
      expect(Equality.isEqual(42, 42)).toBe(true);
      expect(Equality.isEqual("hello", "hello")).toBe(true);
      expect(Equality.isEqual(true, true)).toBe(true);
      expect(Equality.isEqual(false, false)).toBe(true);
    });

    it("should return false for different primitive values", () => {
      expect(Equality.isEqual(42, 24)).toBe(false);
      expect(Equality.isEqual("hello", "world")).toBe(false);
      expect(Equality.isEqual(true, false)).toBe(false);
      expect(Equality.isEqual(123, "123")).toBe(false);
    });

    it("should return true for equal dates", () => {
      const date1 = new Date("2025-01-01T00:00:00.000Z");
      const date2 = new Date("2025-01-01T00:00:00.000Z");
      expect(Equality.isEqual(date1, date2)).toBe(true);

      const sameTimestamp = new Date(1672531200000);
      const sameTimestamp2 = new Date(1672531200000);
      expect(Equality.isEqual(sameTimestamp, sameTimestamp2)).toBe(true);
    });

    it("should return false for different dates", () => {
      const date1 = new Date("2025-01-01T00:00:00.000Z");
      const date2 = new Date("2025-01-02T00:00:00.000Z");
      expect(Equality.isEqual(date1, date2)).toBe(false);

      const date3 = new Date("2025-01-01T00:00:00.000Z");
      const date4 = new Date("2025-01-01T00:00:01.000Z");
      expect(Equality.isEqual(date3, date4)).toBe(false);
    });

    it("should throw error when first value is null or undefined", () => {
      expect(() => Equality.isEqual(null as any, 1)).toThrow("Both values must be provided for comparison.");
      expect(() => Equality.isEqual(undefined as any, 1)).toThrow("Both values must be provided for comparison.");
    });

    it("should throw error when second value is null or undefined", () => {
      expect(() => Equality.isEqual(1, null as any)).toThrow("Both values must be provided for comparison.");
      expect(() => Equality.isEqual(1, undefined as any)).toThrow("Both values must be provided for comparison.");
    });

    it("should throw error when both values are null or undefined", () => {
      expect(() => Equality.isEqual(null as any, null as any)).toThrow("Both values must be provided for comparison.");
      expect(() => Equality.isEqual(undefined as any, undefined as any)).toThrow("Both values must be provided for comparison.");
    });
  });

  describe("isNotEqual", () => {
    it("should return true for different primitive values", () => {
      expect(Equality.isNotEqual(42, 24)).toBe(true);
      expect(Equality.isNotEqual("hello", "world")).toBe(true);
      expect(Equality.isNotEqual(true, false)).toBe(true);
      expect(Equality.isNotEqual(123, "123")).toBe(true);
    });

    it("should return false for equal primitive values", () => {
      expect(Equality.isNotEqual(42, 42)).toBe(false);
      expect(Equality.isNotEqual("hello", "hello")).toBe(false);
      expect(Equality.isNotEqual(true, true)).toBe(false);
      expect(Equality.isNotEqual(false, false)).toBe(false);
    });

    it("should return true for different dates", () => {
      const date1 = new Date("2025-01-01T00:00:00.000Z");
      const date2 = new Date("2025-01-02T00:00:00.000Z");
      expect(Equality.isNotEqual(date1, date2)).toBe(true);

      const date3 = new Date("2025-01-01T00:00:00.000Z");
      const date4 = new Date("2025-01-01T00:00:01.000Z");
      expect(Equality.isNotEqual(date3, date4)).toBe(true);
    });

    it("should return false for equal dates", () => {
      const date1 = new Date("2025-01-01T00:00:00.000Z");
      const date2 = new Date("2025-01-01T00:00:00.000Z");
      expect(Equality.isNotEqual(date1, date2)).toBe(false);

      const sameTimestamp = new Date(1672531200000);
      const sameTimestamp2 = new Date(1672531200000);
      expect(Equality.isNotEqual(sameTimestamp, sameTimestamp2)).toBe(false);
    });

    it("should throw error when first value is null or undefined", () => {
      expect(() => Equality.isNotEqual(null as any, 1)).toThrow("Both values must be provided for comparison.");
      expect(() => Equality.isNotEqual(undefined as any, 1)).toThrow("Both values must be provided for comparison.");
    });

    it("should throw error when second value is null or undefined", () => {
      expect(() => Equality.isNotEqual(1, null as any)).toThrow("Both values must be provided for comparison.");
      expect(() => Equality.isNotEqual(1, undefined as any)).toThrow("Both values must be provided for comparison.");
    });

    it("should throw error when both values are null or undefined", () => {
      expect(() => Equality.isNotEqual(null as any, null as any)).toThrow("Both values must be provided for comparison.");
      expect(() => Equality.isNotEqual(undefined as any, undefined as any)).toThrow("Both values must be provided for comparison.");
    });
  });

  describe("logical consistency", () => {
    it("isNotEqual should be the logical negation of isEqual for valid inputs", () => {
      const testCases = [
        [42, 42],
        [42, 24],
        ["hello", "hello"],
        ["hello", "world"],
        [true, true],
        [true, false],
        [new Date("2025-01-01"), new Date("2025-01-01")],
        [new Date("2025-01-01"), new Date("2025-01-02")]
      ];

      testCases.forEach(([valueA, valueB]) => {
        const isEqual = Equality.isEqual(valueA as any, valueB as any);
        const isNotEqual = Equality.isNotEqual(valueA as any, valueB as any);
        expect(isEqual).toBe(!isNotEqual);
      });
    });
  });
});
