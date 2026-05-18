import { expect, test } from "bun:test";
import { isPhone, matchPhone, isSmsCode, matchSmsCode } from "./verify";

test("isPhone accepts valid mainland China mobile numbers", () => {
    expect(isPhone("13800138000")).toBe(true);
    expect(isPhone("19900138000")).toBe(true);
});

test("isPhone rejects invalid phone numbers", () => {
    expect(isPhone("12800138000")).toBe(false);
    expect(isPhone("1380013800")).toBe(false);
    expect(isPhone("138001380000")).toBe(false);
    expect(isPhone("15,12345678")).toBe(false);
    expect(isPhone("19,12345678")).toBe(false);
});

test("matchPhone returns the matched string for valid numbers", () => {
    expect(matchPhone("13800138000")).toBe("13800138000");
    expect(matchPhone("phone: 13900139000 ext")).toBe("13900139000");
});

test("matchPhone returns null for invalid numbers", () => {
    expect(matchPhone("12800138000")).toBeNull();
    expect(matchPhone("1380013800")).toBeNull();
});

test("isSmsCode accepts exactly six digits", () => {
    expect(isSmsCode("123456")).toBe(true);
});

test("isSmsCode rejects non-six-digit values", () => {
    expect(isSmsCode("12345")).toBe(false);
    expect(isSmsCode("1234567")).toBe(false);
    expect(isSmsCode("12345a")).toBe(false);
});

test("matchSmsCode returns the matched string for valid codes", () => {
    expect(matchSmsCode("123456")).toBe("123456");
    expect(matchSmsCode("code: 654321 end")).toBe("654321");
});

test("matchSmsCode returns null for invalid codes", () => {
    expect(matchSmsCode("12345")).toBeNull();
    expect(matchSmsCode("12345a")).toBeNull();
});
