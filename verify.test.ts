import { expect, test } from "bun:test";
import { matchPhone, matchSmsCode } from "./verify";

test("matchPhone accepts valid mainland China mobile numbers", () => {
    expect(matchPhone("13800138000")).toBe(true);
    expect(matchPhone("19900138000")).toBe(true);
});

test("matchPhone rejects invalid phone numbers", () => {
    expect(matchPhone("12800138000")).toBe(false);
    expect(matchPhone("1380013800")).toBe(false);
    expect(matchPhone("138001380000")).toBe(false);
    expect(matchPhone("15,12345678")).toBe(false);
    expect(matchPhone("19,12345678")).toBe(false);
});

test("matchSmsCode accepts exactly six digits", () => {
    expect(matchSmsCode("123456")).toBe(true);
});

test("matchSmsCode rejects non-six-digit values", () => {
    expect(matchSmsCode("12345")).toBe(false);
    expect(matchSmsCode("1234567")).toBe(false);
    expect(matchSmsCode("12345a")).toBe(false);
});
