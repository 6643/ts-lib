import { expect, test } from "bun:test";
import { dateToNum, sleep, tickFromString, tickToString, timeSince, timeToString, toTime } from "./time";

test("timeToString returns NaN for invalid timestamps", () => {
    expect(timeToString(Number.NaN)).toBe("NaN");
});

test("timeToString formats valid timestamps", () => {
    expect(timeToString(Date.UTC(2026, 4, 18, 12, 34, 56), "UTC")).toBe("2026-05-18 12:34:56");
});

test("toTime returns explicit day/hour/minute/second parts", () => {
    expect(toTime(90061)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
});

test("tickToString formats same-day minute ticks as HH:mm", () => {
    expect(tickToString(0)).toBe("00:00");
    expect(tickToString(9 * 60 + 5)).toBe("09:05");
});

test("tickToString formats absolute minute ticks as MM-DD HH:mm", () => {
    const minutes = Math.floor(new Date(2026, 4, 17, 9, 5).getTime() / 1000 / 60);
    expect(tickToString(minutes)).toBe("05-17 09:05");
});

test("tickFromString parses same-day and day-offset clock time", () => {
    expect(tickFromString("00:00")).toBe(0);
    expect(tickFromString("09:05")).toBe(9 * 60 + 5);
    expect(tickFromString("2 09:05")).toBeGreaterThan(tickFromString("09:05"));
});

test("tickFromString rejects ambiguous input", () => {
    expect(Number.isNaN(tickFromString("123:45"))).toBe(true);
});

test("sleep resolves with the requested duration", async () => {
    await expect(sleep(0)).resolves.toBe(0);
});

test("dateToNum returns whole seconds", () => {
    expect(dateToNum(new Date(1_234_567))).toBe(1234);
});

test("timeSince measures seconds against unix seconds input", () => {
    const now = Math.trunc(Date.now() / 1000);
    const result = timeSince(now - 2);
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThan(5);
});
