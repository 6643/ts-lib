import { expect, test } from "bun:test";
import { listRemove, listSwap } from "./list";

test("listRemove removes the item at index", () => {
    const values = [1, 2, 3, 2];
    const result = listRemove(values, 1);
    expect(values).toEqual([1, 3, 2]);
    expect(result).toBe(values);
});

test("listRemove supports negative index", () => {
    const values = [1, 2, 3, 2];
    const result = listRemove(values, -1);
    expect(values).toEqual([1, 2, 3]);
    expect(result).toBe(values);
});

test("listSwap swaps two valid positions", () => {
    const values = ["a", "b", "c"];
    const result = listSwap(values, 0, 2);
    expect(values).toEqual(["c", "b", "a"]);
    expect(result).toBe(values);
});

test("listRemove can remove undefined values", () => {
    const values: Array<number | undefined> = [1, undefined, 2, undefined];
    listRemove(values, -1);
    expect(values).toEqual([1, undefined, 2]);
});

test("listRemove ignores out-of-range index", () => {
    const values = [1, 2, 3];
    const result = listRemove(values, -4);
    expect(values).toEqual([1, 2, 3]);
    expect(result).toBe(values);
});

test("listSwap ignores fractional indices", () => {
    const values = ["a", "b", "c"];
    const result = listSwap(values, 1.5, 2);
    expect(values).toEqual(["a", "b", "c"]);
    expect(result).toBe(values);
});
