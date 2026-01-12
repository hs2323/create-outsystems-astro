import { describe, expect, it } from "vitest";
import { Operation, setCounterCount } from "../../../src/lib/setCounterCount";

describe("setCounterCount", () => {
  it("should increment the count when operation is Add", () => {
    expect(setCounterCount(5, Operation.Add)).toBe(6);
    expect(setCounterCount(0, Operation.Add)).toBe(1);
    expect(setCounterCount(-1, Operation.Add)).toBe(0);
  });

  it("should decrement the count when operation is Subtract", () => {
    expect(setCounterCount(5, Operation.Subtract)).toBe(4);
    expect(setCounterCount(0, Operation.Subtract)).toBe(-1);
    expect(setCounterCount(1, Operation.Subtract)).toBe(0);
  });

  it("should return the original count for invalid operation (default case)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(setCounterCount(5, Operation as any)).toBe(5);
  });
});
