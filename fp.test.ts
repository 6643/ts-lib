import { expect, test } from "bun:test";
import { reduce } from "./fp";

test("reduce returns the initial value for an empty array", () => {
    expect(reduce<number, number>([], (total, value) => total + value, 10)).toBe(10);
});

test("reduce folds values from left to right", () => {
    const result = reduce(["a", "b", "c"], (text, value) => `${text}${value}`, "");
    expect(result).toBe("abc");
});

test("reduce handles large arrays without recursive stack growth", () => {
    const values = Array.from({ length: 20_000 }, (_, index) => index + 1);
    const result = reduce(values, (total, value) => total + value, 0);
    expect(result).toBe(200010000);
});
